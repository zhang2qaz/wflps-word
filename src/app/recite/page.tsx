'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import WriteGrid, { type WriteGridHandle } from '@/components/WriteGrid';
import AnswerCheck from '@/components/AnswerCheck';
import HanziStrokes from '@/components/HanziStrokes';
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

  // 按学期 + 单元归集
  const groups = Array.from(
    new Map(
      [...POEMS, ...SENTENCES].map(x => [`${x.semester}-${x.unit}`, { semester: x.semester, unit: x.unit }]),
    ).values(),
  ).sort((a, b) =>
    a.semester !== b.semester ? (a.semester === '上' ? -1 : 1) : a.unit - b.unit,
  );

  return (
    <>
      <div className="text-xs tracking-wide mb-1" style={{ color: 'var(--color-vermilion)' }}>
        世外小学 · 国际部 P2 · 二年级下册
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

      {groups.map(({ semester, unit }) => {
        const poems = POEMS.filter(p => p.semester === semester && p.unit === unit);
        const sentences = SENTENCES.filter(s => s.semester === semester && s.unit === unit);
        return (
          <div key={`${semester}${unit}`} className="mb-7">
            <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-vermilion)' }}>
              二年级{semester}册 · 第 {unit} 单元
            </div>
            <div className="space-y-2">
              {poems.map(p => {
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
                        📜《{p.title}》
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                        〔{p.dynasty}〕{p.author} · {p.lines.length} 句
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: STATUS_COLOR[st] }}>{STATUS_LABEL[st]}</span>
                  </button>
                );
              })}
              {sentences.map(s => {
                const st = statusOf(progress[s.id]);
                return (
                  <button
                    key={s.id}
                    onClick={() => onPick({ kind: 'sentence', sentence: s })}
                    className="w-full text-left p-4 rounded-xl border hover:shadow"
                    style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--color-vermilion)' }}>✍️《{s.lesson}》句子</span>
                      <span className="text-xs" style={{ color: STATUS_COLOR[st] }}>{STATUS_LABEL[st]}</span>
                    </div>
                    <div className="text-sm" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink)' }}>
                      {s.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ============================================================
// 古诗：学 → 逐句默写（逐字点选错字）→ 自评记录
// ============================================================
function PoemStudy({ poem, onExit }: { poem: Poem; onExit: () => void }) {
  const recordAnswer = useStore(s => s.recordAnswer);
  const [step, setStep] = useState<'learn' | 'recite'>('learn');
  const [lineIdx, setLineIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [strokeLine, setStrokeLine] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<Set<number>>(new Set());
  const [shots, setShots] = useState<(string | null)[]>([]);
  const [empties, setEmpties] = useState<boolean[]>([]);
  const [wrongCharsAll, setWrongCharsAll] = useState<string[]>([]);
  const gridRef = useRef<WriteGridHandle>(null);
  const redoRef = useRef<WriteGridHandle>(null);
  const allLinesDone = lineIdx >= poem.lines.length;

  useEffect(() => {
    if (step === 'recite' && !allLinesDone && !revealed) {
      const t = setTimeout(() => speak(poem.lines[lineIdx].text, { rate: 0.62 }), 350);
      return () => clearTimeout(t);
    }
  }, [step, lineIdx, allLinesDone, revealed, poem]);

  const readWhole = async () => {
    for (const l of poem.lines) {
      await speak(l.text, { rate: 0.62 });
      await new Promise(r => setTimeout(r, 250));
    }
  };

  const restart = () => {
    setLineIdx(0); setRevealed(false); setCorrecting(false);
    setWrongIdx(new Set()); setShots([]); setEmpties([]);
    setWrongCharsAll([]); setRecorded(false);
  };

  // 看答案：抓快照，空格自动标红
  const onReveal = () => {
    const e = gridRef.current?.emptyFlags() ?? [];
    const s = gridRef.current?.snapshots() ?? [];
    const auto = new Set<number>();
    e.forEach((isEmpty, i) => { if (isEmpty) auto.add(i); });
    setEmpties(e);
    setShots(s);
    setWrongIdx(auto);
    setRevealed(true);
  };

  const toggleWrong = (ci: number) => {
    setWrongIdx(prev => {
      const next = new Set(prev);
      if (next.has(ci)) next.delete(ci); else next.add(ci);
      return next;
    });
  };

  // 进入下一句：把本句错字累加进总错字
  const nextLine = () => {
    const lineText = poem.lines[lineIdx].text;
    const lineWrong = Array.from(lineText).filter((_, i) => wrongIdx.has(i));
    setWrongCharsAll(prev => [...prev, ...lineWrong]);
    setRevealed(false);
    setCorrecting(false);
    setWrongIdx(new Set());
    setShots([]);
    setEmpties([]);
    setLineIdx(i => i + 1);
  };

  const finish = (allWrong: string[]) => {
    recordAnswer(poem.id, allWrong.length === 0, { wrongChars: allWrong });
    setRecorded(true);
  };

  const lineText = allLinesDone ? '' : poem.lines[lineIdx].text;
  const wrongCharsThisLine = Array.from(lineText).filter((_, i) => wrongIdx.has(i));

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
                <div className="text-sm mb-2" style={{ color: 'var(--color-ink-soft)' }}>{l.meaning}</div>
                <button
                  onClick={() => setStrokeLine(strokeLine === i ? null : i)}
                  className="text-xs px-2.5 py-1 rounded border"
                  style={{ borderColor: 'var(--color-vermilion)', color: 'var(--color-vermilion)' }}
                >
                  {strokeLine === i ? '收起笔顺 ▲' : '✍️ 看这句每个字的笔顺'}
                </button>
                {strokeLine === i && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {Array.from(l.text).map((c, ci) => (
                      <HanziStrokes key={`${i}-${ci}-${c}`} char={c} size={92} />
                    ))}
                  </div>
                )}
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
              <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                已记入复习计划，到点会在「古诗句子」页提醒你再默一次。
              </p>
              {wrongCharsAll.length > 0 && (
                <div className="inline-block text-left mb-5 px-4 py-2 rounded-lg" style={{ background: 'rgba(212,73,61,0.08)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-cinnabar)' }}>
                    这次写错的字（已进错题本）：
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {wrongCharsAll.map((c, i) => (
                      <span key={i} className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-cinnabar)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
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
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                整首诗默完啦！
              </h3>
              {wrongCharsAll.length === 0 ? (
                <p className="text-sm mb-6" style={{ color: 'var(--color-jade)' }}>
                  🎉 全诗一个字都没错，太棒了！
                </p>
              ) : (
                <div className="mb-6">
                  <p className="text-sm mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                    这首诗你写错了 <b style={{ color: 'var(--color-cinnabar)' }}>{wrongCharsAll.length}</b> 个字：
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wrongCharsAll.map((c, i) => (
                      <span
                        key={i}
                        className="text-2xl font-bold px-2 py-1 rounded"
                        style={{ fontFamily: 'var(--font-serif-cn)', background: 'rgba(212,73,61,0.12)', color: 'var(--color-cinnabar)' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => finish(wrongCharsAll)}
                className="px-6 py-3 rounded-md font-medium"
                style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
              >
                完成默写 →
              </button>
            </motion.div>
          )
        ) : (
          <motion.div key={lineIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>
              第 {lineIdx + 1} / {poem.lines.length} 句
            </div>
            <div className="text-center mb-4">
              <button
                onClick={() => speak(lineText, { rate: 0.62 })}
                className="px-5 py-3 rounded-full font-medium"
                style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
              >
                🔊 再听这一句
              </button>
            </div>

            {/* 写 / 对答案 / 订正 */}
            {!revealed ? (
              <>
                <div className="mb-4">
                  <WriteGrid ref={gridRef} count={lineText.length} />
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => gridRef.current?.clear()}
                    className="text-sm px-4 py-2 rounded-md border"
                    style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                  >
                    清空
                  </button>
                  <button
                    onClick={onReveal}
                    className="px-6 py-2.5 rounded-md font-medium"
                    style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                  >
                    写好了，看答案
                  </button>
                </div>
              </>
            ) : !correcting ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-3">
                  <AnswerCheck target={lineText} empties={empties} shots={shots} wrong={wrongIdx} onToggle={toggleWrong} />
                </div>
                <div className="text-sm text-center mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                  {poem.lines[lineIdx].meaning}
                </div>
                <div className="flex justify-center gap-2">
                  {wrongIdx.size > 0 && (
                    <button
                      onClick={() => setCorrecting(true)}
                      className="px-5 py-2.5 rounded-md font-medium"
                      style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
                    >
                      ✍️ 订正这 {wrongIdx.size} 个字
                    </button>
                  )}
                  <button
                    onClick={nextLine}
                    className="px-5 py-2.5 rounded-md font-medium"
                    style={
                      wrongIdx.size > 0
                        ? { border: '1px solid var(--color-stone-dark)', color: 'var(--color-ink-soft)' }
                        : { background: 'var(--color-jade)', color: 'var(--color-paper)' }
                    }
                  >
                    {wrongIdx.size > 0
                      ? '不订正，下一句'
                      : lineIdx >= poem.lines.length - 1 ? '全写对了，完成 →' : '全写对了，下一句 →'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-xs text-center mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                  照着浅色的字，把<b style={{ color: 'var(--color-cinnabar)' }}>写错的 {wrongIdx.size} 个字</b>各订正一遍 ✍️
                </div>
                <div className="mb-4">
                  <WriteGrid ref={redoRef} count={Math.max(1, wrongIdx.size)} guide={wrongCharsThisLine.join('')} />
                </div>
                <div className="text-center">
                  <button
                    onClick={nextLine}
                    className="px-6 py-2.5 rounded-md font-medium"
                    style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
                  >
                    {lineIdx >= poem.lines.length - 1 ? '订正好了，完成默写 →' : '订正好了，下一句 →'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )
      )}
    </div>
  );
}

// ============================================================
// 句子：整句听写 →（逐字点选错字）→ 只订正错字 → 记录
// ============================================================
function SentenceStudy({ sentence, onExit }: { sentence: Sentence; onExit: () => void }) {
  const recordAnswer = useStore(s => s.recordAnswer);
  const [phase, setPhase] = useState<'write' | 'check' | 'redo' | 'done'>('write');
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [shots, setShots] = useState<(string | null)[]>([]);
  const [empties, setEmpties] = useState<boolean[]>([]);
  const gridRef = useRef<WriteGridHandle>(null);
  const redoRef = useRef<WriteGridHandle>(null);

  const chars = Array.from(sentence.text);
  const wrongChars = chars.filter((_, i) => wrong.has(i));

  useEffect(() => {
    if (phase !== 'write') return;
    const t = setTimeout(() => speak(sentence.text, { rate: 0.72 }), 350);
    return () => clearTimeout(t);
  }, [sentence, phase]);

  const reset = () => {
    setWrong(new Set()); setShots([]); setEmpties([]); setPhase('write');
  };

  // 看答案：抓快照，空格自动标红
  const toCheck = () => {
    const e = gridRef.current?.emptyFlags() ?? [];
    const s = gridRef.current?.snapshots() ?? [];
    const auto = new Set<number>();
    e.forEach((isEmpty, i) => { if (isEmpty) auto.add(i); });
    setEmpties(e);
    setShots(s);
    setWrong(auto);
    setPhase('check');
  };

  const toggle = (i: number) => {
    setWrong(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const confirmCheck = () => {
    if (wrong.size === 0) {
      recordAnswer(sentence.id, true, { wrongChars: [] });
      setPhase('done');
    } else {
      setPhase('redo');
    }
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
          <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
            已记入复习计划，到点会提醒你再默一次。
          </p>
          {wrongChars.length > 0 && (
            <div className="inline-block mb-5 px-4 py-2 rounded-lg" style={{ background: 'rgba(212,73,61,0.08)' }}>
              <span className="text-xs" style={{ color: 'var(--color-cinnabar)' }}>这次写错的字（已进错题本）：</span>
              <div className="flex flex-wrap gap-1.5 mt-1 justify-center">
                {wrongChars.map((c, i) => (
                  <span key={i} className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-cinnabar)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-center gap-3">
            <button
              onClick={reset}
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
      ) : phase === 'redo' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-xs text-center mb-1" style={{ color: 'var(--color-ink-soft)' }}>
            照着浅色的字，把<b style={{ color: 'var(--color-cinnabar)' }}>写错的 {wrongChars.length} 个字</b>各订正一遍 ✍️
          </div>
          <div className="mb-4">
            <WriteGrid ref={redoRef} count={Math.max(1, wrongChars.length)} guide={wrongChars.join('')} />
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => { recordAnswer(sentence.id, false, { wrongChars }); setPhase('done'); }}
              className="px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
            >
              订正好了，完成 →
            </button>
          </div>
        </motion.div>
      ) : phase === 'check' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-3">
            <AnswerCheck target={sentence.text} empties={empties} shots={shots} wrong={wrong} onToggle={toggle} />
          </div>
          <div className="text-center">
            <button
              onClick={confirmCheck}
              className="px-7 py-3 rounded-md font-medium"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              对完了 →
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
              把写错的字都点出来再继续
            </p>
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
            <WriteGrid ref={gridRef} count={chars.length} />
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => gridRef.current?.clear()}
              className="text-sm px-4 py-2 rounded-md border"
              style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
            >
              清空
            </button>
            <button
              onClick={toCheck}
              className="px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              写好了，看答案
            </button>
          </div>
        </>
      )}
    </div>
  );
}
