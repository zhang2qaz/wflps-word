'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import WriteGrid, { type WriteGridHandle } from './WriteGrid';
import AnswerCheck from './AnswerCheck';
import { type Word } from '@/data/vocabulary';
import { speak } from '@/lib/tts';

export type DictationResult = {
  correct: boolean;
  hintUsed: boolean;
  errorTags: string[];
  wrongChars: string[];
};

type Props = {
  word: Word;
  index: number;
  total: number;
  onDone: (r: DictationResult) => void;
};

type Phase = 'write' | 'check' | 'redo';

// 从「点选的错字」推断错因标签，进错题本
function deriveTags(word: Word, wrong: Set<number>, empties: boolean[]): string[] {
  const tags = new Set<string>();
  wrong.forEach((i) => {
    if (empties[i]) { tags.add('没默出来'); return; }
    const ci = word.chars[i];
    if (ci?.warn) tags.add('形近易错字');
    else tags.add('字形没记牢');
  });
  return Array.from(tags);
}

export default function DictationCard({ word, index, total, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('write');
  const [hintLevel, setHintLevel] = useState(0);
  const [shots, setShots] = useState<(string | null)[]>([]);
  const [empties, setEmpties] = useState<boolean[]>([]);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const gridRef = useRef<WriteGridHandle>(null);
  const redoRef = useRef<WriteGridHandle>(null);

  const chars = Array.from(word.char);
  const n = chars.length;

  useEffect(() => {
    setPhase('write');
    setHintLevel(0);
    setShots([]);
    setEmpties([]);
    setWrong(new Set());
    setConfirmed(false);
    gridRef.current?.clear();
    const t = setTimeout(() => speak(`第${index + 1}题。${word.char}。${word.char}`, { rate: 0.8 }), 350);
    return () => clearTimeout(t);
  }, [word, index]);

  // 写好了 → 对答案：抓快照、空格自动标红
  const toCheck = () => {
    const e = gridRef.current?.emptyFlags() ?? chars.map(() => true);
    const s = gridRef.current?.snapshots() ?? chars.map(() => null);
    const auto = new Set<number>();
    e.forEach((isEmpty, i) => { if (isEmpty) auto.add(i); });
    setEmpties(e);
    setShots(s);
    setWrong(auto);
    setPhase('check');
    setTimeout(() => speak('对一对答案'), 200);
  };

  const toggle = (i: number) => {
    setWrong((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const correct = wrong.size === 0;
  const wrongChars = chars.filter((_, i) => wrong.has(i));
  const errorTags = deriveTags(word, wrong, empties);

  return (
    <div>
      {/* 进度 */}
      <div className="flex items-center justify-between mb-2 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
        <span>第 {index + 1} / {total} 题</span>
        <span>{n} 个字</span>
      </div>
      <div className="h-1 rounded-full mb-5" style={{ background: 'var(--color-stone)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--color-vermilion)' }}
          animate={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* ---------- 顶部 ---------- */}
      <motion.div key={`top-${phase}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {phase === 'write' && (
          <div className="text-center mb-4">
            <button
              onClick={() => speak(word.char, { rate: 0.7 })}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-lg font-medium hover:shadow-md transition-shadow"
              style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
            >
              🔊 再听一遍
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
              在格子里写出听到的词
            </p>
          </div>
        )}
        {phase === 'check' && (
          <div className="text-center mb-3">
            <div className="text-sm" style={{ color: 'var(--color-ink-soft)', letterSpacing: '0.18em' }}>
              {word.pinyin}
            </div>
          </div>
        )}
        {phase === 'redo' && (
          <div className="text-center mb-3">
            <div className="text-base font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              照着浅色的字，把写错的 {wrongChars.length} 个字订正一遍 ✍️
            </div>
            <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
              现在写一遍，比事后机械抄三遍管用得多。
            </div>
          </div>
        )}
      </motion.div>

      {/* ---------- 中间 ----------
          write / check 共用同一个写字格实例 → 点「回去改」不丢笔迹 */}
      {phase !== 'redo' && (
        <div className="mb-4">
          <div style={{ display: phase === 'check' ? 'none' : 'block' }}>
            <WriteGrid ref={gridRef} count={n} />
          </div>
          {phase === 'check' && (
            <AnswerCheck target={word.char} empties={empties} shots={shots} wrong={wrong} onToggle={toggle} />
          )}
        </div>
      )}
      {phase === 'redo' && (
        <div className="mb-5">
          <WriteGrid ref={redoRef} count={Math.max(1, wrongChars.length)} guide={wrongChars.join('')} />
        </div>
      )}

      {/* ---------- 底部 ---------- */}
      <motion.div key={`bot-${phase}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {phase === 'write' && (
          <>
            <HintLadder word={word} level={hintLevel} onMore={() => setHintLevel((l) => Math.min(3, l + 1))} />
            <div className="flex justify-center gap-2 mt-5">
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
                写好了，对答案 →
              </button>
            </div>
          </>
        )}

        {phase === 'check' && (
          !confirmed ? (
            <div className="text-center mt-5">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPhase('write')}
                  className="text-sm px-4 py-2 rounded-md border"
                  style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
                >
                  ← 回去改改
                </button>
                <button
                  onClick={() => setConfirmed(true)}
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
          ) : (
            <ResultPanel
              correct={correct}
              errorTags={errorTags}
              wrongChars={wrongChars}
              onNext={() => onDone({ correct, hintUsed: hintLevel > 0, errorTags, wrongChars })}
              onRedo={() => { setPhase('redo'); setTimeout(() => speak('照着正确答案，再写一遍'), 200); }}
            />
          )
        )}

        {phase === 'redo' && (
          <div className="flex justify-center">
            <button
              onClick={() => onDone({ correct: false, hintUsed: hintLevel > 0, errorTags, wrongChars })}
              className="px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
            >
              订正好了，下一题 →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ---------- 三级提示阶梯 ----------
function HintLadder({ word, level, onMore }: { word: Word; level: number; onMore: () => void }) {
  if (level === 0) {
    return (
      <div className="text-center">
        <button
          onClick={onMore}
          className="text-sm px-4 py-2 rounded-full border-2 border-dashed"
          style={{ borderColor: 'var(--color-mustard)', color: 'var(--color-mustard)' }}
        >
          💡 卡住了？给点提示
        </button>
        <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
          先自己努力想 —— 想不起来再看提示，记得更牢。
        </p>
      </div>
    );
  }

  // 注意：听写提示绝不能显示要写的字本身，只能用「第 N 个字」指代。
  const hints: { label: string; body: React.ReactNode }[] = [
    {
      label: '提示 ① 几个字、各几画',
      body: (
        <>这个词有 <b>{word.char.length}</b> 个字。
        {word.chars.map((c, i) => (
          <span key={i}>{i > 0 ? '、' : ' '}第 {i + 1} 个字大约 <b>{c.strokes ?? '?'}</b> 画</span>
        ))}。</>
      ),
    },
    {
      label: '提示 ② 每个字的偏旁',
      body: (
        <>{word.chars.map((c, i) => {
          const solo = !c.radical || c.kind === '独体' || c.radical === c.c;
          return (
            <span key={i}>
              {i > 0 ? '；' : ''}第 {i + 1} 个字
              {solo
                ? '：独体字，没有偏旁'
                : <>：「<b>{c.radical}</b>」旁{c.kind === '形声' ? '（形声字）' : ''}</>}
            </span>
          );
        })}。</>
      ),
    },
    {
      label: '提示 ③ 把字拆成部件',
      body: (
        <>{word.chars.map((c, i) => {
          const noSplit = !c.split || c.split === '独体字' || c.split === c.c;
          return (
            <span key={i}>
              {i > 0 ? '；' : ''}第 {i + 1} 个字
              {noSplit ? '是独体字，要靠记忆' : <> 由「<b>{c.split}</b>」组成</>}
            </span>
          );
        })}。<br />
        <span style={{ color: 'var(--color-ink-soft)' }}>把这些部件在脑子里拼起来，就是要写的字。</span></>
      ),
    },
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(212,167,44,0.1)', border: '1px solid var(--color-mustard)' }}
    >
      {hints.slice(0, level).map((h, i) => (
        <div
          key={i}
          className={i > 0 ? 'mt-2 pt-2 border-t' : ''}
          style={i > 0 ? { borderColor: 'rgba(212,167,44,0.3)' } : undefined}
        >
          <div className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--color-mustard)' }}>{h.label}</div>
          <div className="text-sm leading-relaxed">{h.body}</div>
        </div>
      ))}
      {level < 3 && (
        <button
          onClick={onMore}
          className="mt-3 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'var(--color-mustard)', color: 'var(--color-paper)' }}
        >
          还想不起来？再给一点提示 →
        </button>
      )}
    </div>
  );
}

// ---------- 结果 ----------
function ResultPanel({
  correct, errorTags, wrongChars, onNext, onRedo,
}: {
  correct: boolean;
  errorTags: string[];
  wrongChars: string[];
  onNext: () => void;
  onRedo: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-5">
      {correct ? (
        <>
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-jade)' }}>
            全对，写得真好！
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--color-ink-soft)' }}>
            这个词记牢了，继续下一个。
          </p>
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-md font-medium"
            style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
          >
            下一题 →
          </button>
        </>
      ) : (
        <>
          <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-cinnabar)' }}>
            找到 {wrongChars.length} 个要订正的字
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {wrongChars.map((c, i) => (
              <span
                key={i}
                className="text-xl font-bold px-2.5 py-1 rounded"
                style={{
                  fontFamily: 'var(--font-serif-cn)',
                  background: 'rgba(212,73,61,0.12)',
                  color: 'var(--color-cinnabar)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
          {errorTags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {errorTags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-stone)', color: 'var(--color-ink-soft)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm mb-5" style={{ color: 'var(--color-ink-soft)' }}>
            知道错在哪，就成功了一半。现在订正一遍 —— 这些字会进错题本。
          </p>
          <button
            onClick={onRedo}
            className="px-8 py-3 rounded-md font-medium"
            style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
          >
            ✍️ 当场订正一遍
          </button>
        </>
      )}
    </motion.div>
  );
}
