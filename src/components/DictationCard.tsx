'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import WriteGrid, { type WriteGridHandle } from './WriteGrid';
import { type Word } from '@/data/vocabulary';
import { speak } from '@/lib/tts';

export type DictationResult = { correct: boolean; hintUsed: boolean; errorTags: string[] };

type Props = {
  word: Word;
  index: number;
  total: number;
  onDone: (r: DictationResult) => void;
};

// ---------- 引导式自检：生成孩子答得了的具体问题 ----------
type Check = { key: string; q: string; detail?: string; tag: string };

function buildChecks(word: Word): Check[] {
  const checks: Check[] = [];
  for (const ch of word.chars) {
    if (ch.warn) {
      checks.push({
        key: `warn-${ch.c}`,
        q: `「${ch.c}」这个字，你写对了吗？`,
        detail: ch.warn,
        tag: '形近字 / 部件写错',
      });
    }
  }
  if (checks.length === 0) {
    const meaningful = word.chars.filter(c => c.radical && c.split && c.split !== '独体字');
    if (meaningful.length > 0) {
      checks.push({
        key: 'radical',
        q: '每个字的偏旁，都和正确答案一样吗？',
        detail: meaningful.map(c => `「${c.c}」是「${c.radical}」`).join('，'),
        tag: '偏旁写错',
      });
    }
  }
  checks.push({
    key: 'whole',
    q: '你写的和正确答案，一个字一个字比，完全一样吗？',
    detail: '多一笔、少一笔、写歪了，都算不一样哦。',
    tag: '字形没记牢',
  });
  return checks;
}

type Phase = 'write' | 'check' | 'redo';

export default function DictationCard({ word, index, total, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('write');
  const [hintLevel, setHintLevel] = useState(0);
  const [checkIdx, setCheckIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const gridRef = useRef<WriteGridHandle>(null);
  const redoRef = useRef<WriteGridHandle>(null);

  const checks = useMemo(() => buildChecks(word), [word]);
  const n = word.char.length;

  useEffect(() => {
    setPhase('write');
    setHintLevel(0);
    setCheckIdx(0);
    setAnswers({});
    gridRef.current?.clear();
    const t = setTimeout(() => speak(`第${index + 1}题。${word.char}。${word.char}`, { rate: 0.8 }), 350);
    return () => clearTimeout(t);
  }, [word, index]);

  const correct = checks.every(c => answers[c.key] === true);
  const errorTags = useMemo(
    () => Array.from(new Set(checks.filter(c => answers[c.key] === false).map(c => c.tag))),
    [checks, answers],
  );
  const allChecked = checkIdx >= checks.length;

  const answerCheck = (key: string, ok: boolean) => {
    setAnswers(a => ({ ...a, [key]: ok }));
    setTimeout(() => setCheckIdx(i => i + 1), 240);
  };

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

      {/* ---------- 顶部区域 ---------- */}
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
          <div
            className="rounded-xl p-4 mb-3 text-center"
            style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-stone-dark)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-vermilion)' }}>正确答案</div>
            <div className="text-sm mb-2" style={{ color: 'var(--color-ink-soft)', letterSpacing: '0.18em' }}>
              {word.pinyin}
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {word.chars.map((ch, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-5xl font-bold leading-none" style={{ fontFamily: 'var(--font-display, var(--font-serif-cn))' }}>
                    {ch.c}
                  </span>
                  {ch.split && ch.split !== '独体字' && (
                    <span className="text-xs mt-1.5" style={{ color: 'var(--color-ink-soft)' }}>{ch.split}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {phase === 'redo' && (
          <div className="text-center mb-3">
            <div className="text-base font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              照着浅色的字，认真订正一遍 ✍️
            </div>
            <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
              现在写一遍，比事后机械抄三遍管用得多。
            </div>
          </div>
        )}
      </motion.div>

      {/* ---------- 写字格 ----------
          write / check 共用同一个持久实例 → 孩子的笔迹不会丢
          redo 用带描红的新实例 */}
      {phase !== 'redo' ? (
        <div className={phase === 'check' ? 'mb-1 pointer-events-none' : 'mb-4'}>
          {phase === 'check' && (
            <div className="text-xs text-center mb-1" style={{ color: 'var(--color-ink-soft)' }}>
              ↓ 这是你刚才写的，和上面对照检查 ↓
            </div>
          )}
          <WriteGrid ref={gridRef} count={n} />
        </div>
      ) : (
        <div className="mb-5">
          <WriteGrid ref={redoRef} count={n} guide={word.char} />
        </div>
      )}

      {/* ---------- 底部区域 ---------- */}
      <motion.div key={`bot-${phase}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {phase === 'write' && (
          <>
            <HintLadder word={word} level={hintLevel} onMore={() => setHintLevel(l => Math.min(3, l + 1))} />
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={() => gridRef.current?.clear()}
                className="text-sm px-4 py-2 rounded-md border"
                style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
              >
                清空
              </button>
              <button
                onClick={() => { setPhase('check'); setTimeout(() => speak('对一对答案'), 200); }}
                className="px-6 py-2.5 rounded-md font-medium"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                写好了，对答案 →
              </button>
            </div>
          </>
        )}

        {phase === 'check' && (
          !allChecked ? (
            <CheckStep
              check={checks[checkIdx]}
              idx={checkIdx}
              total={checks.length}
              onAnswer={ok => answerCheck(checks[checkIdx].key, ok)}
            />
          ) : (
            <ResultPanel
              correct={correct}
              errorTags={errorTags}
              onNext={() => onDone({ correct, hintUsed: hintLevel > 0, errorTags })}
              onRedo={() => { setPhase('redo'); setTimeout(() => speak('照着正确答案，再写一遍'), 200); }}
            />
          )
        )}

        {phase === 'redo' && (
          <div className="flex justify-center">
            <button
              onClick={() => onDone({ correct: false, hintUsed: hintLevel > 0, errorTags })}
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

  const hints: { label: string; body: React.ReactNode }[] = [
    {
      label: '提示 ① 结构',
      body: (
        <>这个词有 <b>{word.char.length}</b> 个字。
        {word.chars.map((c, i) => (
          <span key={i}>{i > 0 ? '、' : ' '}第{i + 1}个字 <b>{c.strokes ?? '?'}</b> 画</span>
        ))}。</>
      ),
    },
    {
      label: '提示 ② 偏旁',
      body: (
        <>{word.chars.map((c, i) => (
          <span key={i}>{i > 0 ? '；' : ''}「{c.c}」是 <b>{c.radical ?? '独体字'}</b>
            {c.kind === '形声' ? '（形声字）' : ''}</span>
        ))}。</>
      ),
    },
    {
      label: '提示 ③ 拆开看',
      body: (
        <>{word.chars.map((c, i) => (
          <span key={i}>{i > 0 ? '；' : ''}「{c.c}」= <b>{c.split}</b></span>
        ))}。{word.tip ? <><br />{word.tip}</> : null}</>
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

// ---------- 单项检查 ----------
function CheckStep({
  check, idx, total, onAnswer,
}: { check: Check; idx: number; total: number; onAnswer: (ok: boolean) => void }) {
  return (
    <motion.div
      key={check.key}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl p-5 text-center"
      style={{ border: '2px solid var(--color-vermilion)', background: 'var(--color-paper)' }}
    >
      <div className="text-xs mb-2" style={{ color: 'var(--color-vermilion)' }}>
        检查 {idx + 1} / {total}
      </div>
      <p className="text-base font-bold mb-1.5" style={{ fontFamily: 'var(--font-serif-cn)' }}>
        {check.q}
      </p>
      {check.detail && (
        <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>{check.detail}</p>
      )}
      <div className="flex justify-center gap-3 mt-3">
        <button
          onClick={() => onAnswer(false)}
          className="px-6 py-3 rounded-md font-medium"
          style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
        >
          ✗ 这里不对
        </button>
        <button
          onClick={() => onAnswer(true)}
          className="px-6 py-3 rounded-md font-medium"
          style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
        >
          ✓ 这里写对了
        </button>
      </div>
    </motion.div>
  );
}

// ---------- 结果 ----------
function ResultPanel({
  correct, errorTags, onNext, onRedo,
}: { correct: boolean; errorTags: string[]; onNext: () => void; onRedo: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
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
            找到问题啦，没关系！
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {errorTags.map(t => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(212,73,61,0.12)', color: 'var(--color-cinnabar)' }}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--color-ink-soft)' }}>
            知道错在哪，就成功了一半。现在订正一遍 —— 这个字会进错题本。
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
