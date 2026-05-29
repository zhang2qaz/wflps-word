'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Nav from '@/components/Nav';
import CharBreakdown from '@/components/CharBreakdown';
import HanziStrokes from '@/components/HanziStrokes';
import WriteCanvas from '@/components/WriteCanvas';
import Link from 'next/link';
import { unitGroups, books, currentPosition, type Word } from '@/data/vocabulary';
import { useStore } from '@/lib/store';
import { speak } from '@/lib/tts';
import { useRequireBook } from '@/components/RequireBook';

export default function LearnPage() {
  const guard = useRequireBook();
  const progress = useStore(s => s.progress);
  const selectedBook = useStore(s => s.selectedBook);
  const customWords = useStore(s => s.customWords);
  const [queue, setQueue] = useState<Word[]>([]);
  const [queueName, setQueueName] = useState('');
  const [idx, setIdx] = useState(0);
  const [bookIdx, setBookIdx] = useState(0);
  const [lastUnit, setLastUnit] = useState<number | null>(null); // 记住用户最后进入学习的单元
  const markLearned = useStore(s => s.markLearned);

  const bookList = useMemo(() => books(), []);
  const book = bookList[bookIdx] ?? bookList[0];
  const groups = useMemo(() => unitGroups(book.grade, book.semester, customWords), [book, customWords]);

  // 进入页面时:优先用「用户在首页选的课本」(selectedBook),没选过再退回历史进度自动定位
  const [pos, setPos] = useState<{ grade: number; semester: '上' | '下'; unit: number } | null>(null);
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const p = currentPosition(id => !!progress[id]?.lastReview);
    setPos(p);
    // selectedBook 优先 —— 用户已经在首页声明了「我在学这一本」,以此为准
    const targetBook = selectedBook ?? { grade: p.grade, semester: p.semester };
    const bi = bookList.findIndex(b => b.grade === targetBook.grade && b.semester === targetBook.semester);
    if (bi > 0) setBookIdx(bi);
    const t = setTimeout(() => {
      document
        .getElementById(`learn-unit-${p.unit}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 320);
    return () => clearTimeout(t);
  }, [progress, bookList]);

  // 返回选择界面时(从某课退出),自动滚回那个单元而不是顶部
  useEffect(() => {
    if (queue.length !== 0 || lastUnit == null) return;
    const t = setTimeout(() => {
      document
        .getElementById(`learn-unit-${lastUnit}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => clearTimeout(t);
  }, [queue.length, lastUnit]);

  const start = (words: Word[], name: string) => {
    if (words.length === 0) return;
    // 记住正在学的单元 → 返回时滚回去
    setLastUnit(words[0]?.unit ?? null);
    // 跳到上次学到的位置：第一个还没学过的词
    const firstNew = words.findIndex(w => !progress[w.id]?.lastReview);
    setQueue(words);
    setQueueName(name);
    setIdx(firstNew >= 0 ? firstNew : 0);
  };

  // 没选课本 —— 引导去 /setup
  if (guard) return <div className="min-h-screen"><Nav />{guard}</div>;

  // ---------- 选择界面 ----------
  if (queue.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-3xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            学字词 · {book.label}
          </h1>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            每个字四步:<b>认词 → 拆字 → 记法 → 运用</b>。建议一次学 6–8 个,学完去「听写」检验。
          </p>

          {pos && pos.grade === book.grade && pos.semester === book.semester && (
            <p className="text-xs mb-4 flex items-center gap-1" style={{ color: 'var(--color-jade)' }}>
              📍 已为你定位到上次学习的单元(第 {pos.unit} 单元)
            </p>
          )}

          {groups.some(g => g.draft) && (
            <details className="mb-5 rounded-lg" style={{ border: '1px dashed var(--color-mustard)' }}>
              <summary className="px-3 py-2 text-xs cursor-pointer list-none flex items-center gap-2"
                style={{ color: 'var(--color-mustard)' }}>
                <span>⚠️</span>
                <span>本课本有「草稿 · 待核对」单元 —— 点开看说明</span>
              </summary>
              <div className="px-3 pb-3 text-xs leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                带<b style={{ color: 'var(--color-mustard)' }}>「草稿 · 待核对」</b>标记的单元用的是
                统编版标准词表,尚未逐字对照世外默写卷,请家长核对后再作正式默写。
              </div>
            </details>
          )}

          <div className="space-y-8">
            {groups.map(g => {
              const allWords = g.lessons.flatMap(l => l.words);
              const isCurrent =
                !!pos &&
                pos.grade === book.grade &&
                pos.semester === book.semester &&
                pos.unit === g.unit;
              return (
                <div
                  key={g.unit}
                  id={`learn-unit-${g.unit}`}
                  className="scroll-mt-6 rounded-2xl"
                  style={
                    isCurrent
                      ? {
                          background: 'rgba(42,138,107,0.07)',
                          border: '1px solid var(--color-jade)',
                          padding: 14,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
                    >
                      {g.unit === 99 ? '我导入的' : `第 ${g.unit} 单元`}
                    </span>
                    {g.unit !== 99 && (
                      <span className="text-sm" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink-soft)' }}>
                        {g.unitTitle}
                      </span>
                    )}
                    {g.draft && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(224,163,42,0.18)', color: 'var(--color-mustard)' }}
                      >
                        草稿 · 待核对
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
                      >
                        📍 现在学到这里
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {g.lessons.map(({ lesson, words }) => {
                      const learned = words.filter(w => progress[w.id]?.lastReview).length;
                      return (
                        <button
                          key={lesson}
                          onClick={() => start(words, lesson)}
                          className="w-full text-left p-4 rounded-xl border hover:shadow-md transition-all flex items-center gap-4"
                          style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs mb-1" style={{ color: 'var(--color-vermilion)' }}>
                              课文《{lesson}》
                            </div>
                            <div className="text-lg font-bold mb-2 truncate" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                              {words.slice(0, 4).map(w => w.char).join('  ')} …
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: 'var(--color-stone)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${(learned / words.length) * 100}%`, background: 'var(--color-jade)' }}
                              />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                              {learned}/{words.length}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>已学</div>
                          </div>
                        </button>
                      );
                    })}

                    {/* 古诗入口 */}
                    {g.poems.length > 0 && (
                      <Link
                        href="/recite"
                        className="w-full block text-left p-4 rounded-xl border hover:shadow-md transition-all"
                        style={{ borderColor: 'var(--color-mustard)', background: 'rgba(224,163,42,0.08)' }}
                      >
                        <div className="text-xs mb-1" style={{ color: 'var(--color-mustard)' }}>古诗 · 句子</div>
                        <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                          📜 {g.poems.map(p => `《${p.title}》`).join('')} 等
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                          去「古诗句子」页背默 →
                        </div>
                      </Link>
                    )}

                    <button
                      onClick={() => start(allWords, g.unit === 99 ? '我导入的全部' : `第${g.unit}单元全部`)}
                      className="w-full text-center p-2 text-xs underline"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      （赶进度时）一次学完{g.unit === 99 ? '导入的' : `第 ${g.unit} 单元`} {allWords.length} 个词
                    </button>
                  </div>
                </div>
              );
            })}

          </div>

          <a
            href="/import"
            className="mt-4 block text-center text-sm underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            + 导入其他单元的词语（导入后在「听写」里练）
          </a>
        </main>
      </div>
    );
  }

  // ---------- 学习界面 ----------
  const done = idx >= queue.length;
  const current = queue[idx];

  const next = () => {
    markLearned(current.id);
    setIdx(i => i + 1);
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { setQueue([]); setIdx(0); }}
            className="text-sm underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            ← 选其他课文
          </button>
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            {queueName} · {done ? '完成' : `${idx + 1} / ${queue.length}`}
          </div>
        </div>

        <div className="h-1 rounded-full mb-6" style={{ background: 'var(--color-stone)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-jade)' }}
            animate={{ width: `${(idx / queue.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                优
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                《{queueName}》全部学完！
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                这些字已进入<b>间隔重复</b>队列。
                <br />
                按艾宾浩斯曲线，<b>5 分钟后</b>和 <b>明天</b>各复习一次，记得最牢。
              </p>
              <div className="flex justify-center gap-3">
                <a href="/dictate" className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
                  马上听写检验
                </a>
                <button onClick={() => { setQueue([]); setIdx(0); }} className="px-5 py-2.5 rounded-md font-medium border" style={{ borderColor: 'var(--color-stone-dark)' }}>
                  学其他课文
                </button>
              </div>
            </motion.div>
          ) : (
            <LearnCard key={current.id} word={current} onNext={next} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ============================================================
// 单词学习卡 · 四步科学记忆
// ============================================================

type Step = 'meet' | 'split' | 'memory' | 'use';
const STEPS: { key: Step; label: string; full: string }[] = [
  { key: 'meet', label: '认', full: '认词' },
  { key: 'split', label: '拆', full: '拆字' },
  { key: 'memory', label: '记', full: '记法' },
  { key: 'use', label: '用', full: '运用' },
];

function LearnCard({ word, onNext }: { word: Word; onNext: () => void }) {
  const [step, setStep] = useState<Step>('meet');
  const [showStrokes, setShowStrokes] = useState(false);

  // 拆字步骤只在「至少一个字」有详细数据(部首/拆分/记法/字族)时展示;
  // 全空时把这一步从导航里去掉,免得孩子看到一片空白卡。
  const hasBreakdown = word.chars.some(
    (c) => c.radical || c.split || c.kind || c.hook || c.family || c.warn,
  );
  const activeSteps = hasBreakdown ? STEPS : STEPS.filter((s) => s.key !== 'split');

  // 切到没有拆字数据的词时,如果当前停在 split,自动跳到记法
  useEffect(() => {
    if (step === 'split' && !hasBreakdown) setStep('memory');
  }, [step, hasBreakdown]);

  const stepIdx = activeSteps.findIndex(s => s.key === step);
  const isLast = stepIdx === activeSteps.length - 1;

  const goNext = () => {
    if (isLast) { onNext(); return; }
    setStep(activeSteps[stepIdx + 1].key);
  };
  const goPrev = () => {
    if (stepIdx > 0) setStep(activeSteps[stepIdx - 1].key);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* 词头 */}
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs" style={{ color: 'var(--color-vermilion)' }}>
            《{word.lesson}》
          </span>
          {word.type === 'idiom' && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
            >
              成语
            </span>
          )}
        </div>
        <div className="text-base mb-1" style={{ color: 'var(--color-ink-soft)', letterSpacing: '0.18em' }}>
          {word.pinyin}
        </div>
        <button
          onClick={() => speak(word.char)}
          className="text-5xl md:text-6xl font-bold leading-none hover:scale-105 transition-transform"
          style={{ fontFamily: 'var(--font-display, var(--font-serif-cn))' }}
          title="点击发音"
        >
          {word.char}
        </button>
      </div>

      {/* 步骤指示 —— 没拆字数据时只展示 3 步 */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {activeSteps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => setStep(s.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors"
              style={
                step === s.key
                  ? { background: 'var(--color-vermilion)', color: 'var(--color-paper)' }
                  : i < stepIdx
                    ? { color: 'var(--color-jade)' }
                    : { color: 'var(--color-ink-soft)' }
              }
            >
              <span className="font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>{s.label}</span>
              <span className="hidden sm:inline text-xs">{s.full}</span>
            </button>
            {i < activeSteps.length - 1 && <span className="mx-0.5" style={{ color: 'var(--color-stone-dark)' }}>›</span>}
          </div>
        ))}
      </div>

      {/* 已经会了 → 直接跳过（尊重学有余力的孩子，自己掌握节奏） */}
      <div className="text-center -mt-4 mb-5">
        <button
          onClick={onNext}
          className="text-xs px-3 py-1 rounded-full"
          style={{ border: '1px dashed var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
        >
          ✓ 这个字我已经会了，跳过 →
        </button>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {/* ---------- 步骤 1 · 认词 ---------- */}
        {step === 'meet' && (
          <section className="space-y-4">
            <div
              className="border rounded-xl p-5"
              style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
            >
              <div className="text-xs mb-1.5" style={{ color: 'var(--color-vermilion)' }}>这个词是什么意思</div>
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                {word.meaning}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => speak(word.char)}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
              >
                🔊 听读音
              </button>
              <button
                onClick={() => speak(word.meaning)}
                className="px-4 py-2 rounded-full text-sm border"
                style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
              >
                🔊 听意思
              </button>
            </div>
            <p className="text-center text-xs" style={{ color: 'var(--color-ink-soft)' }}>
              先认识它 — 知道一个词是什么意思，才记得住怎么写。
            </p>
          </section>
        )}

        {/* ---------- 步骤 2 · 拆字 ---------- */}
        {step === 'split' && (
          <section className="space-y-3">
            <p className="text-sm text-center mb-1" style={{ color: 'var(--color-ink-soft)' }}>
              把每个字拆成你<b>已经认识</b>的部件 — 这是记字最聪明的办法。
            </p>
            {word.chars.map((info, i) => (
              <CharBreakdown key={`${info.c}-${i}`} info={info} index={i} />
            ))}
          </section>
        )}

        {/* ---------- 步骤 3 · 记法 ---------- */}
        {step === 'memory' && (
          <section className="space-y-4">
            {/* 整词记忆要点 */}
            <div
              className="border-2 rounded-xl p-5"
              style={{ borderColor: 'var(--color-mustard)', background: 'var(--color-paper-warm)' }}
            >
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-mustard)' }}>
                记忆要点
              </div>
              <p className="text-base leading-relaxed" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                {word.tip}
              </p>
            </div>

            {/* 寓言 / 成语故事 */}
            {word.story && (
              <div
                className="border rounded-xl p-5"
                style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-cinnabar)' }}>
                    📖 故事记成语
                  </div>
                  <button
                    onClick={() => word.story && speak(word.story)}
                    className="text-xs px-2.5 py-1 rounded border"
                    style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                  >
                    🔊 听故事
                  </button>
                </div>
                <p className="text-sm leading-7" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                  {word.story}
                </p>
                <p className="text-xs mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                  成语最好的记法就是记住它背后的故事 — 故事记住了，四个字自然就记住了。
                </p>
              </div>
            )}
          </section>
        )}

        {/* ---------- 步骤 4 · 运用 ---------- */}
        {step === 'use' && (
          <section className="space-y-4">
            {/* 语境例句 */}
            <div
              className="border rounded-xl p-5"
              style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-vermilion)' }}>
                  放进句子里
                </div>
                <button
                  onClick={() => speak(word.sentence)}
                  className="text-xs px-2.5 py-1 rounded border"
                  style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                >
                  🔊 听句子
                </button>
              </div>
              <p className="text-base leading-7" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                {highlightWord(word.sentence, word.char)}
              </p>
            </div>

            {/* 组词 */}
            {word.examples.length > 0 && (
              <div>
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
                  这样组词
                </div>
                <div className="flex flex-wrap gap-2">
                  {word.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="text-sm px-3 py-1.5 rounded-full"
                      style={{ background: 'var(--color-stone)', color: 'var(--color-ink)' }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 笔顺 — 可选 */}
            <div
              className="border rounded-xl p-4"
              style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
            >
              <button
                onClick={() => setShowStrokes(s => !s)}
                className="w-full flex items-center justify-between text-sm font-medium"
              >
                <span>✍️ 想看每个字怎么写？（笔顺动画 + 描红）</span>
                <span style={{ color: 'var(--color-ink-soft)' }}>{showStrokes ? '收起 ▲' : '展开 ▼'}</span>
              </button>
              {showStrokes && (
                <div className="mt-4 flex justify-center gap-3 flex-wrap">
                  {Array.from(word.char).map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <HanziStrokes char={c} size={120} />
                      <WriteCanvas size={120} guideChar={c} />
                    </div>
                  ))}
                </div>
              )}
              {!showStrokes && (
                <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
                  笔顺很重要，但它只是「怎么写」。先弄懂「为什么这样写」，笔顺自然就顺了。
                </p>
              )}
            </div>
          </section>
        )}
      </motion.div>

      {/* 底部导航 */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={stepIdx === 0}
          className="text-sm underline disabled:opacity-30"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          ← 上一步
        </button>
        <div className="flex gap-1">
          {activeSteps.map((s, i) => (
            <span
              key={s.key}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i <= stepIdx ? 'var(--color-vermilion)' : 'var(--color-stone)' }}
            />
          ))}
        </div>
        <button
          onClick={goNext}
          className="px-6 py-2.5 rounded-md font-medium"
          style={{ background: isLast ? 'var(--color-vermilion)' : 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          {isLast ? '学好了，下一个 →' : '下一步 →'}
        </button>
      </div>
    </motion.div>
  );
}

// 在例句里高亮目标词
function highlightWord(sentence: string, word: string) {
  const parts = sentence.split(word);
  if (parts.length === 1) return sentence;
  const out: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    out.push(<span key={`p${i}`}>{p}</span>);
    if (i < parts.length - 1) {
      out.push(
        <span
          key={`w${i}`}
          className="font-bold brush-underline"
          style={{ color: 'var(--color-vermilion)' }}
        >
          {word}
        </span>,
      );
    }
  });
  return out;
}
