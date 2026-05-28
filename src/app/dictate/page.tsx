'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Nav from '@/components/Nav';
import DictationCard, { type DictationResult } from '@/components/DictationCard';
import { WORDS, unitGroups, books, type Word } from '@/data/vocabulary';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { stopSpeak } from '@/lib/tts';
import { useRequireBook } from '@/components/RequireBook';

type RoundResult = { id: string; word: string; correct: boolean };

export default function DictatePage() {
  const guard = useRequireBook();
  const customWords = useStore(useShallow(s => s.customWords));
  const progress = useStore(s => s.progress);
  const recordAnswer = useStore(s => s.recordAnswer);
  const selectedBook = useStore(s => s.selectedBook);
  const [queue, setQueue] = useState<Word[]>([]);
  const [queueName, setQueueName] = useState('');
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<RoundResult[]>([]);
  const [bookIdx, setBookIdx] = useState(0);
  const [challengeMode, setChallengeMode] = useState(false);  // 满分挑战开关
  const [roundChallenge, setRoundChallenge] = useState(false); // 本轮是否挑战

  const bookList = useMemo(() => books(), []);
  const book = bookList[bookIdx] ?? bookList[0];

  // 默认对齐用户在首页选的课本
  useEffect(() => {
    if (!selectedBook) return;
    const bi = bookList.findIndex(b => b.grade === selectedBook.grade && b.semester === selectedBook.semester);
    if (bi >= 0) setBookIdx(bi);
    // 只在 selectedBook 改变时跑;bookList 是固定的
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook]);

  const groups = useMemo(() => unitGroups(book.grade, book.semester, customWords), [book, customWords]);
  const allWords = useMemo(() => [...WORDS, ...customWords], [customWords]);

  const customLists = useMemo(() => {
    const map = new Map<string, Word[]>();
    for (const w of customWords) {
      if (!map.has(w.lesson)) map.set(w.lesson, []);
      map.get(w.lesson)!.push(w);
    }
    return Array.from(map.entries());
  }, [customWords]);

  useEffect(() => () => stopSpeak(), []);

  const start = (words: Word[], name: string) => {
    if (words.length === 0) return;
    setQueue([...words].sort(() => Math.random() - 0.5));
    setQueueName(name);
    setIdx(0);
    setDone(false);
    setResult([]);
    setRoundChallenge(challengeMode);
  };

  const handleDone = (r: DictationResult) => {
    const current = queue[idx];
    recordAnswer(current.id, r.correct, { hintUsed: r.hintUsed, errorTags: r.errorTags, wrongChars: r.wrongChars, wrongShots: r.wrongShots });
    setResult(rs => [...rs, { id: current.id, word: current.char, correct: r.correct }]);
    if (idx >= queue.length - 1) setDone(true);
    else setIdx(i => i + 1);
  };

  if (guard) return <div className="min-h-screen"><Nav />{guard}</div>;

  // ---------- 选择界面 ----------
  if (queue.length === 0) {
    const learnedWords = allWords.filter(w => progress[w.id]?.lastReview);
    const mistakeWords = allWords.filter(w => (progress[w.id]?.wrong ?? 0) > 0);

    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            听写 · {book.label}
          </h1>
          <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>
            老师读词 → 你写 → <b>卡住有提示,写错能诊断,错了当场订正</b>。一次练一篇课文(十几个词)刚好。
          </p>

          {/* 满分挑战开关 */}
          <button
            onClick={() => setChallengeMode(c => !c)}
            className="w-full mb-5 p-3 rounded-lg flex items-center gap-3"
            style={
              challengeMode
                ? { background: 'rgba(227,36,43,0.07)', border: '2px solid var(--color-cinnabar)' }
                : { background: 'var(--color-paper-warm)', border: '1px solid var(--color-stone-dark)' }
            }
          >
            <span className="text-2xl">🏆</span>
            <span className="flex-1 text-left">
              <span className="font-bold text-sm">满分挑战模式</span>
              <span className="block text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                关掉提示,全靠自己 —— 看看能不能拿满分
              </span>
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
              style={
                challengeMode
                  ? { background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }
                  : { background: 'var(--color-stone)', color: 'var(--color-ink-soft)' }
              }
            >
              {challengeMode ? '已开启' : '开启'}
            </span>
          </button>

          {groups.some(g => g.draft) && (
            <details className="mb-4 rounded-lg" style={{ border: '1px dashed var(--color-mustard)' }}>
              <summary className="px-3 py-2 text-xs cursor-pointer list-none flex items-center gap-2"
                style={{ color: 'var(--color-mustard)' }}>
                <span>⚠️</span>
                <span>本课本有「草稿」单元 —— 点开看说明</span>
              </summary>
              <div className="px-3 pb-3 text-xs leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                带<b style={{ color: 'var(--color-mustard)' }}>「草稿」</b>标记的单元用的是统编版标准词表,
                尚未对照世外默写卷,请家长核对后再用。
              </div>
            </details>
          )}
          <div className="space-y-7 mb-6">
            {groups.map(g => {
              const unitWords = g.lessons.flatMap(l => l.words);
              return (
                <div key={g.unit}>
                  <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
                    >
                      第 {g.unit} 单元
                    </span>
                    <span className="text-sm" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink-soft)' }}>
                      {g.unitTitle}
                    </span>
                    {g.draft && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(224,163,42,0.18)', color: 'var(--color-mustard)' }}
                      >
                        草稿 · 待核对
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {g.lessons.map(({ lesson, words }) => (
                      <button
                        key={lesson}
                        onClick={() => start(words, `《${lesson}》`)}
                        className="card card-hover card-warm w-full text-left p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-base font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>《{lesson}》</div>
                          <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{words.length} 个词</div>
                        </div>
                        <span style={{ color: 'var(--color-vermilion)' }}>开始 →</span>
                      </button>
                    ))}
                    {(g.poems.length > 0 || g.sentences.length > 0) && (
                      <Link
                        href="/recite"
                        className="w-full block p-3 rounded-xl border text-sm text-center"
                        style={{ borderColor: 'var(--color-mustard)', color: 'var(--color-mustard)', background: 'rgba(224,163,42,0.08)' }}
                      >
                        📜 本单元古诗 / 句子默写 →
                      </Link>
                    )}
                    <button
                      onClick={() => start(unitWords, `第${g.unit}单元全部`)}
                      className="w-full text-center p-2 text-xs underline"
                      style={{ color: 'var(--color-ink-soft)' }}
                    >
                      （考前模拟）整单元一起听写 {unitWords.length} 词
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
            智能练习
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => start(learnedWords.slice(0, 15), '已学随机抽查')}
              disabled={learnedWords.length === 0}
              className="card card-hover card-warm p-4 text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="font-bold">已学随机抽查</div>
              <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                从 {learnedWords.length} 个已学词随机抽 15
              </div>
            </button>
            <button
              onClick={() => start(mistakeWords, '错题重做')}
              disabled={mistakeWords.length === 0}
              className="card card-hover card-warm p-4 text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="font-bold">错题重做</div>
              <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                {mistakeWords.length} 个错过的词
              </div>
            </button>
          </div>

          {customLists.length > 0 && (
            <>
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-mustard)' }}>
                我导入的词单
              </div>
              <div className="space-y-2">
                {customLists.map(([name, words]) => (
                  <button
                    key={name}
                    onClick={() => start(words, name)}
                    className="card card-hover w-full text-left p-4 flex items-center justify-between"
                    style={{
                      background: 'color-mix(in srgb, var(--color-mustard) 10%, var(--color-paper))',
                      border: '0.5px solid color-mix(in srgb, var(--color-mustard) 36%, transparent)',
                    }}
                  >
                    <div>
                      <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>{name}</div>
                      <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{words.length} 个词</div>
                    </div>
                    <span style={{ color: 'var(--color-mustard)' }}>开始 →</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ---------- 完成界面 ----------
  if (done) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-8">
          <DoneScreen
            result={result}
            challenge={roundChallenge}
            onRetry={() => start(queue, queueName)}
            onExit={() => setQueue([])}
          />
        </main>
      </div>
    );
  }

  // ---------- 听写界面 ----------
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { setQueue([]); stopSpeak(); }}
            className="text-sm underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            ← 退出听写
          </button>
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            {roundChallenge && '🏆 '}{queueName}
          </div>
        </div>
        <DictationCard
          key={queue[idx].id}
          word={queue[idx]}
          index={idx}
          total={queue.length}
          onDone={handleDone}
          noHint={roundChallenge}
          srs={progress[queue[idx].id]}
        />
      </main>
    </div>
  );
}

function DoneScreen({
  result, challenge = false, onRetry, onExit,
}: { result: RoundResult[]; challenge?: boolean; onRetry: () => void; onExit: () => void }) {
  const total = result.length;
  const correct = result.filter(r => r.correct).length;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const perfect = total > 0 && correct === total;
  let comment = '继续加油！', mark = '良';
  if (challenge && perfect) { comment = '🏆 满分挑战成功！没看一条提示，全部答对 —— 太厉害了！'; mark = '满'; }
  else if (challenge) { comment = `挑战差 ${total - correct} 个就满分，再来一次冲满分！`; mark = pct >= 60 ? '良' : '中'; }
  else if (pct >= 95) { comment = '近乎完美，记忆牢得像石碑！'; mark = '优'; }
  else if (pct >= 80) { comment = '非常棒！错的几个进了错题本，明天再攻克。'; mark = '优'; }
  else if (pct >= 60) { comment = '不错，错的字都当场订正过了，会越来越熟。'; mark = '良'; }
  else { comment = '别灰心 — 错的字都找到了原因、订正过了，这就是进步。'; mark = '中'; }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
      <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '2rem' }}>
        {mark}
      </div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
        {correct} / {total} 答对
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-soft)' }}>{comment}</p>

      <div className="max-w-md mx-auto mb-8 flex flex-wrap gap-2 justify-center">
        {result.map((r, i) => (
          <span
            key={i}
            className="text-lg px-3 py-1.5 rounded border-2"
            style={{
              fontFamily: 'var(--font-serif-cn)',
              borderColor: r.correct ? 'var(--color-jade)' : 'var(--color-cinnabar)',
              color: r.correct ? 'var(--color-jade)' : 'var(--color-cinnabar)',
              background: r.correct ? 'rgba(45,138,111,0.08)' : 'rgba(212,73,61,0.08)',
            }}
          >
            {r.word}
          </span>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={onRetry} className="px-5 py-2.5 rounded-md border" style={{ borderColor: 'var(--color-stone-dark)' }}>
          再来一遍
        </button>
        <button onClick={onExit} className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
          完成
        </button>
      </div>
    </motion.div>
  );
}
