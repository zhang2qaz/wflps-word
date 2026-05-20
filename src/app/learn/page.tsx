'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Nav from '@/components/Nav';
import CharBreakdown from '@/components/CharBreakdown';
import HanziStrokes from '@/components/HanziStrokes';
import WriteCanvas from '@/components/WriteCanvas';
import Link from 'next/link';
import { unitGroups, type Word } from '@/data/vocabulary';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { speak } from '@/lib/tts';

export default function LearnPage() {
  const customWords = useStore(useShallow(s => s.customWords));
  const progress = useStore(s => s.progress);
  const [queue, setQueue] = useState<Word[]>([]);
  const [queueName, setQueueName] = useState('');
  const [idx, setIdx] = useState(0);
  const markLearned = useStore(s => s.markLearned);

  const groups = useMemo(() => unitGroups(), []);

  const start = (words: Word[], name: string) => {
    if (words.length === 0) return;
    setQueue(words);
    setQueueName(name);
    setIdx(0);
  };

  // ---------- 选择界面 ----------
  if (queue.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-3xl mx-auto px-5 py-10">
          <div className="mb-2 text-xs tracking-wide" style={{ color: 'var(--color-vermilion)' }}>
            上海世界外国语小学 · 国际部 P2 · 二年级下册
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            学新字 · 科学记忆四步法
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            不靠死记硬背。每个字带你走四步：<b>认词 → 拆字 → 记法 → 运用</b>。
            把陌生的字拆成你已经认识的部件，弄懂它「为什么这样写」，记得又快又牢。
          </p>

          <div className="space-y-8">
            {groups.map(g => {
              const allWords = g.lessons.flatMap(l => l.words);
              return (
                <div key={g.unit}>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
                    >
                      第 {g.unit} 单元
                    </span>
                    <span className="text-sm" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink-soft)' }}>
                      {g.unitTitle}
                    </span>
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
                      onClick={() => start(allWords, `第${g.unit}单元全部`)}
                      className="w-full text-center p-2.5 rounded-xl border text-sm font-medium"
                      style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
                    >
                      一次学完第 {g.unit} 单元（{allWords.length} 个词）
                    </button>
                  </div>
                </div>
              );
            })}

            {/* 自定义导入 */}
            {customWords.length > 0 && (
              <button
                onClick={() => start(customWords, '我导入的词单')}
                className="w-full text-left p-5 rounded-xl border-2 border-dashed hover:shadow transition-all"
                style={{ borderColor: 'var(--color-mustard)', background: 'var(--color-paper-warm)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--color-mustard)' }}>我的导入</div>
                <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                  自定义词单 · {customWords.length} 个词
                </div>
              </button>
            )}
          </div>

          <a
            href="/import"
            className="mt-4 block text-center text-sm underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            + 导入其他单元的词语（拍测试卷 / 贴词单）
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
  const [mnemonic, setMnemonic] = useState('');
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [showStrokes, setShowStrokes] = useState(false);

  const stepIdx = STEPS.findIndex(s => s.key === step);
  const isLast = step === 'use';

  // 进入「记」步骤时按需调用 AI 生成补充联想（只尝试一次）
  useEffect(() => {
    if (step !== 'memory' || aiState !== 'idle') return;
    setAiState('loading');
    fetch('/api/mnemonic', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ char: word.char, pinyin: word.pinyin, meaning: word.meaning }),
    })
      .then(r => r.json())
      .then((d: { text?: string }) => {
        setMnemonic(typeof d?.text === 'string' ? d.text.trim() : '');
      })
      .catch(() => setMnemonic(''))
      .finally(() => setAiState('done'));
  }, [step, aiState, word]);

  const goNext = () => {
    if (isLast) { onNext(); return; }
    setStep(STEPS[stepIdx + 1].key);
  };
  const goPrev = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].key);
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

      {/* 步骤指示 */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {STEPS.map((s, i) => (
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
            {i < STEPS.length - 1 && <span className="mx-0.5" style={{ color: 'var(--color-stone-dark)' }}>›</span>}
          </div>
        ))}
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

            {/* AI 补充联想 —— 仅在加载中或确有内容时显示 */}
            {(aiState === 'loading' || (aiState === 'done' && mnemonic)) && (
              <div
                className="border rounded-xl p-4"
                style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
              >
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-jade)' }}>
                  ✨ AI 老师再给你一个联想
                </div>
                {aiState === 'loading' ? (
                  <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>正在想一个更好玩的记法…</p>
                ) : (
                  <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif-cn)' }}>{mnemonic}</p>
                )}
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
          {STEPS.map((s, i) => (
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
