'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import WriteGrid, { type WriteGridHandle } from '@/components/WriteGrid';
import AnswerCheck from '@/components/AnswerCheck';
import HanziStrokes from '@/components/HanziStrokes';
import { POEMS, SENTENCES, type Poem, type Sentence } from '@/data/vocabulary';
import { useStore, selectDueRecite } from '@/lib/store';
import { isMastered, type SrsState } from '@/lib/srs';
import { useShallow } from 'zustand/react/shallow';
import { speak, stopSpeak } from '@/lib/tts';

type Kind = 'poems' | 'sentences' | 'both';
function parseKind(v: string | null): Kind {
  return v === 'sentences' ? 'sentences' : v === 'poems' ? 'poems' : 'both';
}

type View =
  | { kind: 'select' }
  | { kind: 'poem'; poem: Poem }
  | { kind: 'sentence'; sentence: Sentence };

type Status = 'new' | 'due' | 'learned' | 'mastered';

function statusOf(p: SrsState | undefined): Status {
  if (!p || p.lastReview === 0) return 'new';
  if (isMastered(p)) return 'mastered';
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
  return (
    <Suspense fallback={<div className="min-h-screen"><Nav /></div>}>
      <ReciteInner />
    </Suspense>
  );
}

function ReciteInner() {
  const sp = useSearchParams();
  const kind = parseKind(sp.get('kind'));
  const [view, setView] = useState<View>({ kind: 'select' });

  useEffect(() => () => stopSpeak(), []);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-8">
        {view.kind === 'select' && <SelectScreen kind={kind} onPick={setView} />}
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
function SelectScreen({ kind, onPick }: { kind: Kind; onPick: (v: View) => void }) {
  const progress = useStore(s => s.progress);
  const selectedBook = useStore(s => s.selectedBook);
  const dueRecite = useStore(useShallow(s => selectDueRecite(s)));

  // 按 kind 过滤;同时按 selectedBook 限定到「当前课本」(没选过则不限)
  const matchesBook = <T extends { grade?: number; semester: '上' | '下' }>(x: T) =>
    !selectedBook || ((x.grade ?? 2) === selectedBook.grade && x.semester === selectedBook.semester);
  const filteredPoems = (kind === 'sentences' ? [] : POEMS).filter(matchesBook);
  const filteredSentences = (kind === 'poems' ? [] : SENTENCES).filter(matchesBook);

  const groups = Array.from(
    new Map(
      [...filteredPoems, ...filteredSentences].map(x => [
        `${x.grade ?? 2}-${x.semester}-${x.unit}`,
        { grade: x.grade ?? 2, semester: x.semester, unit: x.unit },
      ]),
    ).values(),
  ).sort((a, b) => (
    a.grade !== b.grade ? a.grade - b.grade :
    a.semester !== b.semester ? (a.semester === '上' ? -1 : 1) :
    a.unit - b.unit
  ));

  // 标题 + 简介按 kind 切
  const heading =
    kind === 'sentences' ? '句子默写' :
    kind === 'poems'     ? '古诗默写'   :
    '古诗 · 句子 背默';
  const intro =
    kind === 'sentences'
      ? <>课文里值得整句默的<b>关键句</b>(现代汉语 + 文言文)。听一整句,写下来——别忘了<b>标点</b>。</>
      : kind === 'poems'
        ? <>先<b>读懂诗意</b>,再<b>一句一句</b>默写整首古诗。练过的会进入<b>间隔复习</b>。</>
        : <>古诗:先<b>读懂诗意</b>,再<b>一句一句</b>默写。句子:听一整句,写下来——别忘了标点。</>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}>
        {heading}
      </h1>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
        {intro}
      </p>

      {dueRecite.length > 0 && (
        <div
          className="mb-5 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(33,52,140,0.08)', border: '1px solid var(--color-vermilion)' }}
        >
          🔔 <b>今天有 {dueRecite.length} 项</b>该复习了 —— 下面带「今日复习」标记的就是。
        </div>
      )}

      {groups.length === 0 && (
        <div className="card p-8 text-center" style={{ color: 'var(--color-ink-soft)' }}>
          暂无{kind === 'sentences' ? '句子' : '古诗'}内容
        </div>
      )}

      {groups.map(({ grade, semester, unit }) => {
        const poems = filteredPoems.filter(p => (p.grade ?? 2) === grade && p.semester === semester && p.unit === unit);
        const sentences = filteredSentences.filter(s => (s.grade ?? 2) === grade && s.semester === semester && s.unit === unit);
        if (poems.length === 0 && sentences.length === 0) return null;
        return (
          <div key={`${grade}${semester}${unit}`} className="mb-7">
            <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-vermilion)' }}>
              {['一', '二', '三', '四', '五', '六'][grade - 1]}年级{semester}册 · 第 {unit} 单元
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
// 古诗：学 → 逐句默写（逐字点选错字）→ 按错字比例评分
// ============================================================
export function PoemStudy({
  poem, onExit, startStep = 'learn',
}: { poem: Poem; onExit: () => void; startStep?: 'learn' | 'recite' }) {
  const recordAnswer = useStore(s => s.recordAnswer);
  const [step, setStep] = useState<'learn' | 'recite'>(startStep);
  const [lineIdx, setLineIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [strokeLine, setStrokeLine] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<Set<number>>(new Set());
  const [shots, setShots] = useState<(string | null)[]>([]);
  const [empties, setEmpties] = useState<boolean[]>([]);
  const [wrongCharsAll, setWrongCharsAll] = useState<string[]>([]);
  const [wrongShotsAll, setWrongShotsAll] = useState<(string | null)[]>([]);
  const [lineRecords, setLineRecords] = useState<{ text: string; label: string; shots: (string | null)[]; wrong: number[] }[]>([]);
  const [showReview, setShowReview] = useState(false);
  const gridRef = useRef<WriteGridHandle>(null);
  const redoRef = useRef<WriteGridHandle>(null);
  // 默写范围 = 诗题 + 作者 + 每一句正文
  const parts = useMemo(() => {
    const n = poem.lines.length;
    return [
      { text: poem.title, tts: poem.title, meaning: '', label: '诗题' },
      { text: `${poem.dynasty}${poem.author}`, tts: `${poem.dynasty}，${poem.author}`, meaning: '这首诗的作者', label: '作者' },
      ...poem.lines.map((l, i) => ({ text: l.text, tts: l.tts ?? l.text, meaning: l.meaning, label: `第 ${i + 1} / ${n} 句` })),
    ];
  }, [poem]);
  const allLinesDone = lineIdx >= parts.length;

  useEffect(() => {
    if (step === 'recite' && !allLinesDone && !revealed && !correcting) {
      const t = setTimeout(() => speak(parts[lineIdx].tts, { rate: 0.62 }), 350);
      return () => clearTimeout(t);
    }
  }, [step, lineIdx, allLinesDone, revealed, correcting, parts]);

  const readWhole = async () => {
    for (const p of parts) {
      await speak(p.tts, { rate: 0.62 });
      await new Promise(r => setTimeout(r, 250));
    }
  };

  const restart = () => {
    setLineIdx(0); setRevealed(false); setCorrecting(false);
    setWrongIdx(new Set()); setShots([]); setEmpties([]);
    setWrongCharsAll([]); setWrongShotsAll([]); setLineRecords([]); setShowReview(false);
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

  // 进入下一句：累加本句错字 + 手写；最后一句默完 → 立刻记账进错题本
  const nextLine = () => {
    const lineChars = Array.from(parts[lineIdx].text);
    const lineWrong = lineChars.filter((_, i) => wrongIdx.has(i));
    const lineWrongShots = lineChars.map((_, i) => shots[i] ?? null).filter((_, i) => wrongIdx.has(i));
    const allWrong = [...wrongCharsAll, ...lineWrong];
    const allWrongShots = [...wrongShotsAll, ...lineWrongShots];
    const isLast = lineIdx >= parts.length - 1;
    setWrongCharsAll(allWrong);
    setWrongShotsAll(allWrongShots);
    setLineRecords(prev => [...prev, { text: parts[lineIdx].text, label: parts[lineIdx].label, shots: [...shots], wrong: [...wrongIdx] }]);
    setRevealed(false);
    setCorrecting(false);
    setWrongIdx(new Set());
    setShots([]);
    setEmpties([]);
    setLineIdx(i => i + 1);
    if (isLast) {
      // 整首默完，立刻记账 —— 不依赖再点按钮，错字一定进错题本
      const totalChars = parts.reduce((s, p) => s + Array.from(p.text).length, 0);
      const wc = allWrong.length;
      // 评分宽松：错一两个字不至于整首推倒重学；但有错字一律计为「错」
      const grade = wc === 0 ? 5 : wc <= Math.max(2, Math.ceil(totalChars * 0.1)) ? 3 : 1;
      recordAnswer(poem.id, wc === 0, { grade, wrongChars: allWrong, wrongShots: allWrongShots });
    }
  };

  const lineText = allLinesDone ? '' : parts[lineIdx].text;
  const lineTts = allLinesDone ? '' : parts[lineIdx].tts;
  const partLabel = allLinesDone ? '' : parts[lineIdx].label;
  const wrongCharsThisLine = Array.from(lineText).filter((_, i) => wrongIdx.has(i));

  return (
    <div>
      <button onClick={onExit} className="text-sm underline mb-4" style={{ color: 'var(--color-ink-soft)' }}>
        ← 返回
      </button>

      <div className="text-center mb-5">
        {step === 'recite' ? (
          // 默写时不显示诗题 / 作者 —— 否则就是抄了
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display, var(--font-serif-cn))' }}>
            古诗默写
          </h2>
        ) : (
          <>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display, var(--font-serif-cn))' }}>
              {poem.title}
            </h2>
            <div className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
              〔{poem.dynasty}〕{poem.author}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {([['learn', '1 · 读懂诗意'], ['recite', '2 · 逐句默写']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setStep(k)}
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
                    onClick={() => speak(l.tts ?? l.text, { rate: 0.62 })}
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
              onClick={() => setStep('recite')}
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
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <div className="seal text-2xl mx-auto mb-5" style={{ width: 76, height: 76, fontSize: '1.8rem' }}>诵</div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              《{poem.title}》默写完成！
            </h3>
            {wrongCharsAll.length === 0 ? (
              <p className="text-sm mb-5" style={{ color: 'var(--color-jade)' }}>
                🎉 全诗一个字都没错，太棒了！已记入复习计划。
              </p>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>
                  已记入复习计划，到点会在「古诗」页提醒你再默一次。
                </p>
                <div className="inline-block mb-5 px-4 py-2 rounded-lg" style={{ background: 'rgba(212,73,61,0.08)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-cinnabar)' }}>
                    这次写错的 {wrongCharsAll.length} 个字（已进错题本）：
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1 justify-center">
                    {wrongCharsAll.map((c, i) => (
                      <span key={i} className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-cinnabar)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 逐句回看：这次每句到底写成什么样 */}
            {lineRecords.length > 0 && (
              <div className="mb-5">
                <button
                  onClick={() => setShowReview(v => !v)}
                  className="text-xs underline"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  {showReview ? '收起回看 ▲' : '✍️ 回看我每句写的字 ▾'}
                </button>
                {showReview && (
                  <div className="mt-3 space-y-4">
                    {lineRecords.map((rec, i) => (
                      <div key={i}>
                        <div className="text-xs mb-1 text-left" style={{ color: 'var(--color-vermilion)' }}>
                          {rec.label}
                        </div>
                        <AnswerCheck
                          target={rec.text}
                          shots={rec.shots}
                          wrong={new Set(rec.wrong)}
                          onToggle={() => {}}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                )}
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
          <motion.div key={lineIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>
              {partLabel === '诗题' ? '✍️ 先默写诗题'
                : partLabel === '作者' ? '✍️ 默写作者'
                : partLabel}
            </div>
            <div className="text-center mb-4">
              <button
                onClick={() => speak(lineTts, { rate: 0.62 })}
                className="px-5 py-3 rounded-full font-medium"
                style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
              >
                🔊 再听一遍
              </button>
            </div>

            {correcting ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-xs text-center mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                  照着浅色的字，把<b style={{ color: 'var(--color-cinnabar)' }}>写错的 {wrongIdx.size} 个字</b>每个订正三遍 ✍️
                </div>
                <div className="mb-4">
                  <WriteGrid
                    ref={redoRef}
                    count={Math.max(1, wrongIdx.size) * 3}
                    guide={wrongCharsThisLine.map((c) => c.repeat(3)).join('')}
                  />
                </div>
                <div className="text-center">
                  <button
                    onClick={nextLine}
                    className="px-6 py-2.5 rounded-md font-medium"
                    style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
                  >
                    {lineIdx >= parts.length - 1 ? '订正好了，完成默写 →' : '订正好了，下一步 →'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* 写字格：write/对答案 共用同一实例，回去改不丢笔迹 */}
                <div style={{ display: revealed ? 'none' : 'block' }} className="mb-4">
                  <WriteGrid ref={gridRef} count={lineText.length} />
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
                      onClick={onReveal}
                      className="px-6 py-2.5 rounded-md font-medium"
                      style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                    >
                      写好了，看答案
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="mb-3">
                      <AnswerCheck target={lineText} empties={empties} shots={shots} wrong={wrongIdx} onToggle={toggleWrong} />
                    </div>
                    {parts[lineIdx].meaning && (
                      <div className="text-sm text-center mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                        {parts[lineIdx].meaning}
                      </div>
                    )}
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => setRevealed(false)}
                        className="text-sm px-4 py-2 rounded-md border"
                        style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                      >
                        ← 回去改
                      </button>
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
                          ? '不订正，下一步'
                          : lineIdx >= parts.length - 1 ? '全写对了，完成 →' : '全写对了，下一步 →'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )
      )}
    </div>
  );
}

// ============================================================
// 句子：整句听写 →（逐字点选错字）→ 只订正错字 → 按错字比例评分
// ============================================================
export function SentenceStudy({ sentence, onExit }: { sentence: Sentence; onExit: () => void }) {
  const recordAnswer = useStore(s => s.recordAnswer);
  const [phase, setPhase] = useState<'write' | 'check' | 'redo' | 'done'>('write');
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [shots, setShots] = useState<(string | null)[]>([]);
  const [empties, setEmpties] = useState<boolean[]>([]);
  const gridRef = useRef<WriteGridHandle>(null);
  const redoRef = useRef<WriteGridHandle>(null);

  const chars = Array.from(sentence.text);
  const wrongChars = chars.filter((_, i) => wrong.has(i));
  const wrongShots = chars.map((_, i) => shots[i] ?? null).filter((_, i) => wrong.has(i));

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
      recordAnswer(sentence.id, true, { grade: 5, wrongChars: [], wrongShots: [] });
      setPhase('done');
    } else {
      setPhase('redo');
    }
  };

  const finishRedo = () => {
    // 有错字 → 计为「错」进错题本；评分宽松（错一两个不至于推倒重学）
    const grade = wrongChars.length <= Math.max(1, Math.ceil(chars.length * 0.1)) ? 3 : 1;
    recordAnswer(sentence.id, false, { grade, wrongChars, wrongShots });
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
              onClick={() => { if (window.confirm('再写一遍会清空这次的成绩,确定吗?')) reset(); }}
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
            照着浅色的字，把<b style={{ color: 'var(--color-cinnabar)' }}>写错的 {wrongChars.length} 个字</b>每个订正三遍 ✍️
          </div>
          <div className="mb-4">
            <WriteGrid
              ref={redoRef}
              count={Math.max(1, wrongChars.length) * 3}
              guide={wrongChars.map((c) => c.repeat(3)).join('')}
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={finishRedo}
              className="px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
            >
              订正好了，完成 →
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {phase === 'write' && (
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
            </>
          )}

          {/* 写字格：write/对答案 共用同一实例，回去改不丢笔迹 */}
          <div style={{ display: phase === 'check' ? 'none' : 'block' }} className="mb-4">
            <WriteGrid ref={gridRef} count={chars.length} />
          </div>

          {phase === 'check' && (
            <div className="mb-4">
              <AnswerCheck target={sentence.text} empties={empties} shots={shots} wrong={wrong} onToggle={toggle} />
            </div>
          )}

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
                onClick={toCheck}
                className="px-6 py-2.5 rounded-md font-medium"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                写好了，看答案
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPhase('write')}
                  className="text-sm px-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                >
                  ← 回去改
                </button>
                <button
                  onClick={confirmCheck}
                  className="px-7 py-3 rounded-md font-medium"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                >
                  对完了 →
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
                把写错的字都点出来再继续
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
