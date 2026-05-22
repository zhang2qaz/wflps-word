#!/usr/bin/env node
// ============================================================
//  vault/字词/*.md  ──►  src/data/vault-words.generated.ts
//
//  把 Obsidian 笔记仓库里的字词笔记，编译成 App 能用的词语数据。
//  · 手动重新生成：  npm run vault
//  · build 时自动运行（见 package.json 的 "build" 脚本）
//
//  笔记格式见 vault/字词/_模板.md。文件名以「_」开头的会被跳过
//  （当作模板 / 说明，不进 App）。
// ============================================================

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORDS_DIR = join(ROOT, 'vault', '字词');
const OUT = join(ROOT, 'src', 'data', 'vault-words.generated.ts');

const VALID_KIND = new Set(['象形', '指事', '会意', '形声', '独体']);
const warnings = [];
const errors = [];

// ---- 小工具 ----------------------------------------------------

// 拆出 frontmatter（首尾 --- 之间）和正文
function splitDoc(raw) {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() === '---') {
    const end = lines.indexOf('---', 1);
    if (end !== -1) {
      return { fm: lines.slice(1, end), body: lines.slice(end + 1) };
    }
  }
  return { fm: [], body: lines };
}

// frontmatter：每行 key: value（中英文冒号都认）
function parseFrontmatter(fmLines) {
  const fm = {};
  for (const line of fmLines) {
    const m = line.match(/^([A-Za-z_]+)\s*[:：]\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

// 正文按 ## 标题切块  →  { 标题: [行...] }
function splitSections(bodyLines) {
  const sections = {};
  let cur = null;
  for (const line of bodyLines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) { cur = h2[1].trim(); sections[cur] = []; continue; }
    if (cur) sections[cur].push(line);
  }
  return sections;
}

// 一段纯文本：非空行拼起来
function asText(lines = []) {
  return lines.map((l) => l.trim()).filter(Boolean).join('');
}

// 一段无序列表  →  字符串数组
function asList(lines = []) {
  return lines
    .map((l) => l.trim())
    .filter((l) => /^[-*]\s+/.test(l))
    .map((l) => l.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

// 「逐字拆解」块：### 字  +  - key: value
function parseChars(lines = []) {
  const chars = [];
  let cur = null;
  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3) { cur = { c: h3[1].trim(), pinyin: '' }; chars.push(cur); continue; }
    if (!cur) continue;
    const b = line.match(/^[-*]\s*([A-Za-z]+)\s*[:：]\s*(.+)$/);
    if (!b) continue;
    const key = b[1];
    const val = b[2].trim();
    if (key === 'strokes') {
      const n = Number(val);
      if (Number.isFinite(n)) cur.strokes = n;
    } else if (key === 'kind') {
      if (VALID_KIND.has(val)) cur.kind = val;
      else warnings.push(`造字法「${val}」不是合法值（象形/指事/会意/形声/独体），已忽略`);
    } else if (['c', 'pinyin', 'radical', 'split', 'hook', 'family', 'warn'].includes(key)) {
      cur[key] = val;
    }
  }
  return chars;
}

// ---- 单篇笔记  →  Word ----------------------------------------

function noteToWord(file, raw) {
  const { fm: fmLines, body } = splitDoc(raw);
  const fm = parseFrontmatter(fmLines);
  const sec = splitSections(body);
  const where = `${file}`;

  const id = fm.id?.trim();
  const char = fm.char?.trim();
  if (!id) { errors.push(`${where}：缺少 frontmatter「id」`); return null; }
  if (!char) { errors.push(`${where}：缺少 frontmatter「char」`); return null; }

  const semester = fm.semester === '上' ? '上' : fm.semester === '下' ? '下' : null;
  if (!semester) { errors.push(`${where}：semester 必须是「上」或「下」`); return null; }

  const unit = Number(fm.unit);
  if (!Number.isFinite(unit)) { errors.push(`${where}：unit 必须是数字`); return null; }

  const grade = fm.grade ? Number(fm.grade) : 2;
  const unitTitle = fm.unitTitle?.trim() || '';
  const lesson = fm.lesson?.trim() || '';
  if (!unitTitle) warnings.push(`${where}：建议补上 unitTitle（单元名）`);
  if (!lesson) warnings.push(`${where}：建议补上 lesson（课文名）`);

  const type = fm.type === 'idiom' || fm.type === 'word'
    ? fm.type
    : ([...char].length >= 4 ? 'idiom' : 'word');

  const meaning = asText(sec['释义']);
  const sentence = asText(sec['例句']);
  const tip = asText(sec['记忆要点']) || '把这个词拆成单个字记，再用它造个句子。';
  const story = asText(sec['故事']);
  const examples = asList(sec['组词']);
  let chars = parseChars(sec['逐字拆解']);
  if (chars.length === 0) {
    chars = [...char].map((c) => ({ c, pinyin: '' }));
  }
  if (!meaning) warnings.push(`${where}：缺「## 释义」段落`);

  const word = {
    id, char,
    pinyin: fm.pinyin?.trim() || '',
    meaning,
    grade,
    semester, unit, unitTitle, lesson,
    type,
    examples,
    sentence,
    tip,
    chars,
  };
  if (story) word.story = story;
  return word;
}

// ---- 主流程 ----------------------------------------------------

function main() {
  let words = [];

  if (!existsSync(WORDS_DIR)) {
    warnings.push(`没有找到 ${WORDS_DIR}，本次生成空词表`);
  } else {
    const files = readdirSync(WORDS_DIR)
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .sort();
    for (const f of files) {
      const w = noteToWord(f, readFileSync(join(WORDS_DIR, f), 'utf8'));
      if (w) words.push(w);
    }
  }

  // 查 id 撞车
  const seen = new Map();
  for (const w of words) {
    if (seen.has(w.id)) errors.push(`id「${w.id}」重复（${seen.get(w.id)} 和 ${w.char}）`);
    else seen.set(w.id, w.char);
  }

  if (errors.length) {
    console.error('✗ vault 编译失败：');
    for (const e of errors) console.error(`  · ${e}`);
    process.exit(1);
  }

  const banner =
    '// ⚠️ 此文件由脚本自动生成，请勿手改。\n' +
    '// 源文件：vault/字词/*.md   ·   重新生成：npm run vault\n\n' +
    "import type { Word } from './vocabulary';\n\n";
  const out = `${banner}export const VAULT_WORDS: Word[] = ${JSON.stringify(words, null, 2)};\n`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, out);

  for (const w of warnings) console.warn(`  ⚠ ${w}`);
  console.log(`✓ vault 编译完成：${words.length} 个词语 → src/data/vault-words.generated.ts`);
}

main();
