'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import WriteGrid, { type WriteGridHandle } from '@/components/WriteGrid';
import { POEMS, SENTENCES, type Poem, type Sentence } from '@/data/vocabulary';
import { useStore, selectDueRecite } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { speak, stopSpeak } from '@/lib/tts';

type View =
  | { kind: 'select' }
  | { kind: 'poem'; poem: Poem }
  | { kind: 'sentence'; sentence: Sentence };

type Status = 'new' | 'due' | 'learned' | 'mastered';

function statusOf(p: { lastReview: number; reps: number; interval: number; nextDue: number } | undefined): Status {
  if (!p || p.lastReview === 0) return 'new';
  if (p.reps >= 4 && p.interval >= 7) return 'mastered';
  if (p.nextDue <= Date.now()) return 'due';
  return 'learned';
}

const STATUS_LABEL: Record<Status, string> = { new: '未学', due: '🔔 今日复习', learned: '已学', mastered: '✓ 已掌握' };
const STATUS_COLOR: Record<Status, string> = {
  new: 'var(--color-ink-soft)',
  due: 'var(--color-vermilion)',
  learned: 'var(--color-jade)',
  mastered: 'var(--color-jade)',
};

export default function RecitePage() {
  const [view, setView] = useState<View>({ kind: 'select' });

  useEffect(() => () => stopSpeak(), []);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-8">
        {view.kind === 'select' && <SelectScreen onPick={setView} />}
        {view.kind === 'poem' && (
          <PoemStudy poem={view.poem} onExit={() => setView({ kind: 'select' })} />
        )}
        {view.kind === 'sentence' && (
          <SentenceStudy sentence={view.sentence} onExit={() => setView({ kind: 'select' })} />
        )}
      </main>
    </div>
  );
}

// ============================================================
// 选择界面
// ============================================================
function SelectScreen({ onPick }: { onPick: (v: View) => void }) {
  const progress = useStore(s => s.progress);
  const dueRecite = useStore(useShallow(s => selectDueRecite(s)));

  return (
    <>
      <div className="text-xs tracking-wide mb-1" style={{ color: 'var(--color-vermilion)' }}>
        世外小学 · 国际部 P2 · 二下第六单元
      </div>
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
        古诗 · 句子 背默
      </h1>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
        古诗：先<b>读懂诗意</b>，再<b>一句一句</b>默写。句子：听一整句，写下来——别忘了标点。
        练过的会进入<b>间隔复习</b>，到点会提醒。
      </p>

      {/* 今日复习提示 */}
      {dueRecite.length > 0 && (
        <div
          className="mb-5 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(33,52,140,0.08)', border: '1px solid var(--color-vermilion)' }}
        >
          🔔 <b>今天有 {dueRecite.length} 项</b>古诗 / 句子该复习了 —— 下面带「今日复习」标记的就是。
        </div>
      )}

      {/* 古诗 */}
      <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
        古诗二首
      </div>
      <div className="space-y-2 mb-6">
        {POEMS.map(p => {
          const st = statusOf(progress[p.id]);
          return (
            <button
              key={p.id}
              onClick={() => onPick({ kind: 'poem', poem: p })}
              className="w-full text-left p-4 rounded-xl border hover:shadow flex items-center justify-between"
              style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
            >
              <div>
                <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                  《{p.title}》
                </div>
                <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                  〔{p.dynasty}〕{p.author} · {p.lines.length} 句
                </div>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: STATUS_COLOR[st] }}>{STATUS_LABEL[st]}</span>
            </button>
          );
        })}
      </div>

      {/* 句子 */}
      <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
        课文句子
      </div>
      <div className="space-y-2">
        {SENTENCES.map(s => {
          const st = statusOf(progress[s.id]);
          return (
            <button
              key={s.id}
              onClick={() => onPick({ kind: 'sentence', sentence: s })}
              className="w-full text-left p-4 rounded-xl border hover:shadow"
              style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--color-vermilion)' }}>《{s.lesson}》</span>
                <span className="text-xs" style={{ color: STATUS_COLOR[st] }}>{STATUS_LABEL[st]}</span>
              </div>
              <div className="text-sm" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink)' }}>
                {s.text}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ============================================================
// 古诗：学 → 逐句默写 → 自评记录
// ============================================================
function PoemStudy({ poem, onExit }: { poem: Poem; onExit: () => void }) {
  const recordAnswer = useStore(s => s.recordAnswer);
  const [step, setStep] = useState<'learn' | 'recite'>('learn');
  const [lineIdx, setLineIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const gridRef = useRef<WriteGridHandle>(null);
  const allLinesDone = lineIdx >= poem.lines.length;

  useEffect(() => {
    if (step === 'recite' && !allLinesDone) {
      const t = setTimeout(() => speak(poem.lines[lineIdx].text, { rate: 0.62 }), 350);
      return () => clearTimeout(t);
    }
  }, [step, lineIdx, allLinesDone, poem]);

  const readWhole = async () => {
    for (const l of poem.lines) {
      await speak(l.text, { rate: 0.62 });
      await new Promise(r => setTimeout(r, 250));
    }
  };

  const nextLine = () => {
    gridRef.current?.clear();
    setRevealed(false);
    setLineIdx(i => i + 1);
  };

  const finish = (correct: boolean) => {
    recordAnswer(poem.id, correct);
    setRecorded(true);
  };

  const restart = () => { setLineIdx(0); setRevealed(false); setRecorded(false); };

  return (
    <div>
      <button onClick={onExit} className="text-sm underline mb-4" style={{ color: 'var(--color-ink-soft)' }}>
        ← 返回
      </button>

      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display, var(--font-serif-cn))' }}>
          {poem.title}
        </h2>
        <div className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          〔{poem.dynasty}〕{poem.author}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {([['learn', '1 · 读懂诗意'], ['recite', '2 · 逐句默写']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => { setStep(k); restart(); }}
            className="text-sm px-4 py-1.5 rounded-full"
            style={
              step === k
                ? { background: 'var(--color-vermilion)', color: 'var(--color-paper)' }
                : { border: '1px solid var(--color-stone-dark)', color: 'var(--color-ink-soft)' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---- 学 ---- */}
      {step === 'learn' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'rgba(224,163,42,0.12)', border: '1px solid var(--color-mustard)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-mustard)' }}>这首诗写什么</div>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif-cn)' }}>{poem.theme}</p>
          </div>

          <div className="space-y-3 mb-5">
            {poem.lines.map((l, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ border: '1px solid var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--color-ink-soft)', letterSpacing: '0.1em' }}>
                  {l.pinyin}
                </div>
                <div className="text-xl font-bold mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                  <span>{l.text}</span>
                  <button
                    onClick={() => speak(l.text, { rate: 0.62 })}
                    className="text-xs px-2 py-0.5 rounded border"
                    style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                  >
                    🔊
                  </button>
                </div>
                <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{l.meaning}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={readWhole} className="px-5 py-2.5 rounded-md border" style={{ borderColor: 'var(--color-stone-dark)' }}>
              🔊 朗读整首
            </button>
            <button
              onClick={() => { setStep('recite'); restart(); }}
              className="px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
            >
              读熟了，去默写 →
            </button>
          </div>
        </motion.div>
      )}

      {/* ---- 默 ---- */}
      {step === 'recite' && (
        allLinesDone ? (
          recorded ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="seal text-2xl mx-auto mb-5" style={{ width: 76, height: 76, fontSize: '1.8rem' }}>诵</div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                《{poem.title}》默写完成！
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                已记入复习计划，到点会在「古诗句子」页提醒你再默一次。
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={restart} className="px-5 py-2.5 rounded-md border" style={{ borderColor: 'var(--color-stone-dark)' }}>
                  再默一遍
                </button>
                <button onClick={onExit} className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
                  完成
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                整首诗默完啦！
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                和正确答案对照过——这首诗，你默对了吗？
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => finish(false)}
                  className="px-6 py-3 rounded-md font-medium"
                  style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
                >
                  有几个字错了
                </button>
                <button
                  onClick={() => finish(true)}
                  className="px-6 py-3 rounded-md font-medium"
                  style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
                >
                  全默对了
                </button>
              </div>
            </motion.div>
          )
        ) : (
          <motion.div key={lineIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>
              第 {lineIdx + 1} / {poem.lines.length} 句
            </div>
            <div className="text-center mb-4">
              <button
                onClick={() => speak(poem.lines[lineIdx].text, { rate: 0.62 })}
                className="px-5 py-3 rounded-full font-medium"
                style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
              >
                🔊 再听这一句
              </button>
            </div>

            <div className="mb-4">
              <WriteGrid ref={gridRef} count={poem.lines[lineIdx].text.length} />
            </div>

            {!revealed ? (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => gridRef.current?.clear()}
                  className="text-sm px-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                >
                  清空
                </button>
                <button
                  onClick={() => setRevealed(true)}
                  className="px-6 py-2.5 rounded-md font-medium"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                >
                  写好了，看答案
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="text-xs mb-1" style={{ color: 'var(--color-vermilion)' }}>正确答案</div>
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                  {poem.lines[lineIdx].text}
                </div>
                <div className="text-sm mb-5" style={{ color: 'var(--color-ink-soft)' }}>
                  {poem.lines[lineIdx].meaning}
                </div>
                <button
                  onClick={nextLine}
                  className="px-6 py-2.5 rounded-md font-medium"
                  style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
                >
                  {lineIdx >= poem.lines.length - 1 ? '完成默写 →' : '对照好了，下一句 →'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )
      )}
    </div>
  );
}

// ============================================================
// 句子：整句听写 → 自评记录
// ============================================================
function SentenceStudy({ sentence, onExit }: { sentence: Sentence; onExit: () => void }) {
  const recordAnswer = useStore(s => s.recordAnswer);
  const [phase, setPhase] = useState<'write' | 'check' | 'done'>('write');
  const gridRef = useRef<WriteGridHandle>(null);

  useEffect(() => {
    const t = setTimeout(() => speak(sentence.text, { rate: 0.72 }), 350);
    return () => clearTimeout(t);
  }, [sentence]);

  const finish = (correct: boolean) => {
    recordAnswer(sentence.id, correct);
    setPhase('done');
  };

  return (
    <div>
      <button onClick={onExit} className="text-sm underline mb-4" style={{ color: 'var(--color-ink-soft)' }}>
        ← 返回
      </button>

      <div className="text-xs mb-1" style={{ color: 'var(--color-vermilion)' }}>《{sentence.lesson}》· 句子默写</div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif-cn)' }}>听一整句，写下来</h2>

      {phase === 'done' ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="seal text-2xl mx-auto mb-5" style={{ width: 76, height: 76, fontSize: '1.8rem' }}>句</div>
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>句子默写完成！</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
            已记入复习计划，到点会提醒你再默一次。
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => { gridRef.current?.clear(); setPhase('write'); }}
              className="px-5 py-2.5 rounded-md border"
              style={{ borderColor: 'var(--color-stone-dark)' }}
            >
              再写一遍
            </button>
            <button onClick={onExit} className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              完成
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div
            className="rounded-xl p-3 mb-4 text-sm flex gap-2"
            style={{ background: 'rgba(224,163,42,0.12)', border: '1px solid var(--color-mustard)' }}
          >
            <span>💡</span>
            <span>{sentence.tip}</span>
          </div>

          <div className="text-center mb-4">
            <button
              onClick={() => speak(sentence.text, { rate: 0.72 })}
              className="px-5 py-3 rounded-full font-medium"
              style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
            >
              🔊 再听一遍
            </button>
          </div>

          <div className="text-xs text-center mb-1" style={{ color: 'var(--color-ink-soft)' }}>
            一格写一个字，标点也要占一格
          </div>
          <div className="mb-4">
            <WriteGrid ref={gridRef} count={sentence.text.length} />
          </div>

          {phase === 'write' ? (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => gridRef.current?.clear()}
                className="text-sm px-4 py-2 rounded-md border"
                style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
              >
                清空
              </button>
              <button
                onClick={() => setPhase('check')}
                className="px-6 py-2.5 rounded-md font-medium"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                写好了，看答案
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-xs mb-2" style={{ color: 'var(--color-vermilion)' }}>正确答案 — 逐字对照检查</div>
              <div className="text-lg font-bold leading-9 mb-5 px-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                {sentence.text}
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>对照检查后——你写对了吗？</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => finish(false)}
                  className="px-6 py-3 rounded-md font-medium"
                  style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
                >
                  有错的字
                </button>
                <button
                  onClick={() => finish(true)}
                  className="px-6 py-3 rounded-md font-medium"
                  style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
                >
                  全写对了
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
