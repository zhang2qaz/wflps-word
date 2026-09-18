'use client';

import { useMemo, useState } from 'react';
import { pinyin } from 'pinyin-pro';
import Nav from '@/components/Nav';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { CHAR_X_ALL, type Word, type CharInfo, type Sentence } from '@/data/vocabulary';
import { GRADE3_WORD_X } from '@/data/grade3-words';
import { useRequireBook } from '@/components/RequireBook';

type Draft = { char: string; pinyin: string };

const GRADE_CHAR = ['', '一', '二', '三', '四', '五', '六'];

export default function ImportPage() {
  const guard = useRequireBook();
  // 一课一录:单元号 + 课号 + 课文名,对应老师词语表的一课
  const [unit, setUnit] = useState('');
  const [lessonNo, setLessonNo] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [raw, setRaw] = useState('');
  const [rawSentences, setRawSentences] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savedMsg, setSavedMsg] = useState('');
  const addCustomWords = useStore(s => s.addCustomWords);
  const addCustomSentences = useStore(s => s.addCustomSentences);
  const clearCustomWords = useStore(s => s.clearCustomWords);
  const removeCustomLesson = useStore(s => s.removeCustomLesson);
  const customWords = useStore(useShallow(s => s.customWords));
  const customSentences = useStore(useShallow(s => s.customSentences));
  const selectedBook = useStore(s => s.selectedBook);

  const bookLabel = selectedBook
    ? `${GRADE_CHAR[selectedBook.grade] ?? selectedBook.grade}年级${selectedBook.semester}册`
    : '';

  const parse = () => {
    // 支持换行 / 空格 / 逗号 / 顿号 分隔
    const tokens = raw
      .split(/[\s,，、;；]+/)
      .map(t => t.trim())
      .filter(t => /[一-龥]/.test(t));
    const seen = new Set<string>();
    const list: Draft[] = [];
    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      list.push({ char: t, pinyin: pinyin(t, { toneType: 'symbol', type: 'string' }) });
    }
    setDrafts(list);
    setSavedMsg('');
  };

  const sentenceList = useMemo(
    () => rawSentences.split(/\n+/).map(s => s.trim()).filter(s => /[一-龥]/.test(s)),
    [rawSentences],
  );

  const unitNum = Number(unit);
  const lessonLabel = `${lessonNo.trim() ? `${lessonNo.trim()}、` : ''}${lessonName.trim()}`;
  const canSave =
    Number.isInteger(unitNum) && unitNum >= 1 && unitNum <= 9 &&
    lessonName.trim().length > 0 &&
    (drafts.length > 0 || sentenceList.length > 0);

  const save = () => {
    if (!canSave) return;
    const ts = Date.now();
    const grade = selectedBook?.grade ?? 3;
    const semester = selectedBook?.semester ?? '上';

    const words: Word[] = drafts.map((d, i) => {
      // 多音字修复:逐字 pinyin 优先用「词级 d.pinyin」(家长可改) 切片,
      // 没切到才退回 pinyin-pro 默认读音 —— 避免「圈/教/觉」始终读错。
      const syllables = d.pinyin.trim().split(/\s+/);
      const charList = Array.from(d.char);
      const chars: CharInfo[] = charList.map((c, idx) => ({
        c,
        pinyin: syllables[idx] || pinyin(c, { toneType: 'symbol', type: 'string' }),
        // 自动挂接全小学拆字资产:拆解 / 造字法 / 口诀 / 字族 / 易错提醒
        ...CHAR_X_ALL[c],
      }));
      // 单字词再挂三年级的记法/例句/组词
      const wx = d.char.length === 1 ? GRADE3_WORD_X[d.char] : undefined;
      return {
        id: `custom-${ts}-${i}`,
        char: d.char,
        pinyin: d.pinyin,
        meaning: '',
        grade, semester,
        unit: unitNum,
        unitTitle: '老师默写',
        lesson: lessonLabel,
        type: d.char.length >= 4 ? 'idiom' : 'word',
        examples: wx?.examples ?? [],
        sentence: wx?.sentence ?? '',
        tip: wx?.tip ?? '老师默写词 —— 拆成单个字记,每个字的口诀在「拆字」步骤。',
        chars,
        custom: true,
      };
    });

    const sentences: Sentence[] = sentenceList.map((text, i) => ({
      id: `customs-${ts}-${i}`,
      text,
      grade, semester,
      unit: unitNum,
      unitTitle: '老师默写',
      lesson: lessonLabel,
      tip: '老师默写句 —— 注意标点符号,写完逐字对一遍。',
    }));

    if (words.length) addCustomWords(words);
    if (sentences.length) addCustomSentences(sentences);
    setSavedMsg(
      `✓ 已保存《${lessonLabel}》:${words.length} 个词${sentences.length ? ` + ${sentences.length} 个句子` : ''}。` +
      `词在「学字词」第 ${unitNum} 单元置顶,句子在「学句子」里,听写页也能整课练。`,
    );
    setRaw(''); setRawSentences(''); setDrafts([]);
    setLessonNo(''); setLessonName('');
  };

  // 已导入内容按「单元+课」分组,支持整课删除重录
  const lessonsImported = useMemo(() => {
    const map = new Map<string, { unit: number; lesson: string; words: number; sentences: number }>();
    for (const w of customWords) {
      const k = `${w.unit}|${w.lesson}`;
      const e = map.get(k) ?? { unit: w.unit, lesson: w.lesson, words: 0, sentences: 0 };
      e.words += 1; map.set(k, e);
    }
    for (const s of customSentences) {
      const k = `${s.unit}|${s.lesson}`;
      const e = map.get(k) ?? { unit: s.unit, lesson: s.lesson, words: 0, sentences: 0 };
      e.sentences += 1; map.set(k, e);
    }
    return [...map.values()].sort((a, b) => a.unit - b.unit || a.lesson.localeCompare(b.lesson, 'zh'));
  }, [customWords, customSentences]);

  if (guard) return <div className="min-h-screen"><Nav />{guard}</div>;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
          导入老师的词语表
        </h1>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
          照着老师发的词语表,<b>一课一录</b>:填上单元和课文,把词语和句子贴进来。
          保存后每个词自动带上<b>拼音 + 拆字 + 记忆口诀</b>,出现在「学字词」对应单元的<b>最上面</b>;
          句子进「学句子」。当前课本:<b>{bookLabel || '未选'}</b>。
        </p>

        {savedMsg && (
          <div className="mb-5 p-3 rounded-lg text-sm leading-relaxed"
            style={{ background: 'rgba(45,138,111,0.12)', color: 'var(--color-jade)' }}>
            {savedMsg}
          </div>
        )}

        {/* 这一课是哪课 */}
        <div className="flex gap-2 mb-3">
          <input type="number" min={1} max={9} value={unit} onChange={e => setUnit(e.target.value)}
            placeholder="单元"
            className="w-20 border rounded-lg px-3 py-2 text-sm bg-transparent outline-none"
            style={{ borderColor: 'var(--color-stone-dark)' }} />
          <input type="number" min={1} max={40} value={lessonNo} onChange={e => setLessonNo(e.target.value)}
            placeholder="课号"
            className="w-20 border rounded-lg px-3 py-2 text-sm bg-transparent outline-none"
            style={{ borderColor: 'var(--color-stone-dark)' }} />
          <input type="text" value={lessonName} onChange={e => setLessonName(e.target.value)}
            placeholder="课文名(如:铺满金色巴掌的水泥道)"
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-transparent outline-none"
            style={{ borderColor: 'var(--color-stone-dark)' }} />
        </div>

        {/* 词语 */}
        <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={4}
          placeholder="词语(红色黑色都贴进来,空格/顿号/换行分开)。例如:&#10;明朗 亮晶晶 雨珠 粘住 印子 图案 平展 排列"
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none resize-y mb-2"
          style={{ borderColor: 'var(--color-stone-dark)', fontFamily: 'var(--font-serif-cn)' }} />

        {/* 句子 */}
        <textarea value={rawSentences} onChange={e => setRawSentences(e.target.value)} rows={3}
          placeholder="句子(可选,一行一句,连标点一起抄)。例如:&#10;每一片法国梧桐树的落叶,都像一个金色的小巴掌。"
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none resize-y mb-3"
          style={{ borderColor: 'var(--color-stone-dark)', fontFamily: 'var(--font-serif-cn)' }} />

        <div className="flex items-center gap-3 mb-6">
          <button onClick={parse} disabled={!raw.trim()}
            className="px-5 py-2.5 rounded-md font-medium disabled:opacity-40"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
            生成拼音 →
          </button>
          {sentenceList.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
              已识别 {sentenceList.length} 个句子
            </span>
          )}
        </div>

        {/* 预览 + 编辑拼音 */}
        {drafts.length > 0 && (
          <div className="mb-6">
            <div className="text-sm mb-2" style={{ color: 'var(--color-ink-soft)' }}>
              共 {drafts.length} 个词 · 检查并修正拼音(多音字尤其注意)
            </div>
            <div className="space-y-2">
              {drafts.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border"
                  style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}>
                  <span className="text-xl font-bold w-24 flex-shrink-0" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                    {d.char}
                  </span>
                  <input type="text" value={d.pinyin}
                    onChange={e => {
                      const v = e.target.value;
                      setDrafts(ds => ds.map((x, j) => (j === i ? { ...x, pinyin: v } : x)));
                    }}
                    className="flex-1 border-b bg-transparent text-sm py-1 outline-none"
                    style={{ borderColor: 'var(--color-stone-dark)', letterSpacing: '0.08em' }} />
                  <button onClick={() => setDrafts(ds => ds.filter((_, j) => j !== i))}
                    className="text-xs px-2 py-1" style={{ color: 'var(--color-cinnabar)' }}>
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(drafts.length > 0 || sentenceList.length > 0) && (
          <div className="mb-8">
            <button onClick={save} disabled={!canSave}
              className="px-6 py-2.5 rounded-md font-medium disabled:opacity-40"
              style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}>
              保存这一课({drafts.length} 词{sentenceList.length ? ` + ${sentenceList.length} 句` : ''})
            </button>
            {!canSave && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-mustard)' }}>
                请先填好上面的「单元」和「课文名」{drafts.length === 0 && raw.trim() ? ',并点「生成拼音」' : ''}。
              </p>
            )}
          </div>
        )}

        {/* 已导入的课 —— 按课管理,可整课删除重录 */}
        {lessonsImported.length > 0 && (
          <div className="border-t pt-5" style={{ borderColor: 'var(--color-stone)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">
                已导入 {lessonsImported.length} 课 · {customWords.length} 词 / {customSentences.length} 句
              </h2>
              <button onClick={() => { if (confirm('清空所有导入的词和句子？')) clearCustomWords(); }}
                className="text-xs underline" style={{ color: 'var(--color-ink-soft)' }}>
                全部清空
              </button>
            </div>
            <div className="space-y-2">
              {lessonsImported.map(l => (
                <div key={`${l.unit}|${l.lesson}`}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}>
                  <span className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}>
                    {l.unit === 99 ? '旧版导入' : `第 ${l.unit} 单元`}
                  </span>
                  <span className="flex-1 text-sm font-medium" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                    {l.lesson}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-ink-soft)' }}>
                    {l.words} 词{l.sentences ? ` · ${l.sentences} 句` : ''}
                  </span>
                  <button
                    onClick={() => { if (confirm(`删除《${l.lesson}》的全部导入内容？(可重新录入)`)) removeCustomLesson(l.unit, l.lesson); }}
                    className="text-xs px-2 py-1 flex-shrink-0" style={{ color: 'var(--color-cinnabar)' }}>
                    删除重录
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
