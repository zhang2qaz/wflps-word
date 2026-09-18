#!/usr/bin/env node
// 把「拍照导入」用的 OCR 资产备齐到 public/ocr/,App 同源加载:
//   · worker / core(wasm) —— 直接从 node_modules/tesseract.js* 拷贝
//   · chi_sim 中文识别数据 —— 下载一次(约 12MB),幂等
// 与 fetch-vosk-model.mjs 同一套路:HF Docker 构建时烤进镜像,国内无外联。

import { existsSync, mkdirSync, statSync, unlinkSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OCR_DIR = join(ROOT, 'public', 'ocr');
const CORE_DIR = join(OCR_DIR, 'core');
const LANG_DIR = join(OCR_DIR, 'lang');
const LANG_FILE = join(LANG_DIR, 'chi_sim.traineddata.gz');
const LANG_URL = 'https://tessdata.projectnaptha.com/4.0.0/chi_sim.traineddata.gz';
const LANG_MIN = 8 * 1024 * 1024; // 小于 8MB 视为下载失败

function copyDist() {
  mkdirSync(CORE_DIR, { recursive: true });
  copyFileSync(
    join(ROOT, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
    join(OCR_DIR, 'worker.min.js'),
  );
  const coreSrc = join(ROOT, 'node_modules', 'tesseract.js-core');
  let n = 0;
  for (const f of readdirSync(coreSrc)) {
    if (/^tesseract-core.*\.(js|wasm)$/.test(f)) {
      copyFileSync(join(coreSrc, f), join(CORE_DIR, f));
      n += 1;
    }
  }
  console.log(`✓ OCR worker + core 已拷贝 (${n} 个 core 文件)`);
}

function downloadLang() {
  if (existsSync(LANG_FILE) && statSync(LANG_FILE).size >= LANG_MIN) {
    console.log(`✓ 中文识别数据已就位 (${(statSync(LANG_FILE).size / 1024 / 1024).toFixed(1)} MB) —— 跳过下载`);
    return;
  }
  mkdirSync(LANG_DIR, { recursive: true });
  console.log(`↓ 下载 ${LANG_URL} (约 12MB)`);
  try {
    execFileSync('curl', ['-fsSL', '--retry', '3', '--max-time', '300', '-o', LANG_FILE, LANG_URL], { stdio: 'inherit' });
  } catch {
    console.warn('⚠ 中文识别数据下载失败 —— 拍照导入将不可用(手动录入不受影响)');
    try { unlinkSync(LANG_FILE); } catch { /* ignore */ }
    return;
  }
  const sz = existsSync(LANG_FILE) ? statSync(LANG_FILE).size : 0;
  if (sz < LANG_MIN) {
    console.warn(`⚠ 下载文件太小 (${sz} B),已删除。拍照导入将不可用。`);
    try { unlinkSync(LANG_FILE); } catch { /* ignore */ }
    return;
  }
  console.log(`✓ 中文识别数据下载完成 (${(sz / 1024 / 1024).toFixed(1)} MB)`);
}

copyDist();
downloadLang();
