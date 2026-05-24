'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import StrokeQuiz from '@/components/StrokeQuiz';
import { WORDS, currentPosition, unitWords } from '@/data/vocabulary';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { haptic } from '@/lib/haptic';

// 笔顺挑战 —— 从当前单元随机抽字,让孩子一笔一笔写,
// 实时纠错(写错那一笔闪红 + 触觉),与三家学习机的「事后批改」
// 不同 —— 这里是真正的逐笔反馈。

type Stats = { totalChars: number; totalMistakes: number; perfect: number };

export default function StrokesPage() {
  const progress = useStore(useShallow((s) => s.progress));
  const [chars, setChars] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState<Stats>({ totalChars: 0, totalMistakes: 0, perfect: 0 });
  const [done, setDone] = useState(false);

  // 从当前单元的字里抽 10 个不同的单字(去重,按字而非词条)
  const pool = useMemo(() => {
    const pos = currentPosition((id) => (progress[id]?.lastReview ?? 0) !== 0);
    const words = unitWords(pos.grade, pos.semester, pos.unit);
    const seen = new Set<string>();
    const chars: string[] = [];
    for (const w of words) {
      for (const c of [...w.char]) {
        if (!seen.has(c) && /\p{Script=Han}/u.test(c)) {
          seen.add(c);
          chars.push(c);
        }
      }
    }
    return { chars, pos, words };
  }, [progress]);

  useEffect(() => {
    if (chars.length === 0 && pool.chars.length > 0) {
      // 洗牌抽 10 个
      const shuffled = [...pool.chars].sort(() => Math.random() - 0.5);
      setChars(shuffled.slice(0, 10));
    }
  }, [pool, chars.length]);

  if (pool.chars.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>笔</div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display-sans)' }}>还没字可练</h1>
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            先去「学新字」认几个字,再来练笔顺。
          </p>
        </main>
      </div>
    );
  }

  if (done) {
    const accuracy = stats.totalChars > 0
      ? Math.round((stats.perfect / stats.totalChars) * 100)
      : 0;
    const grade =
      accuracy >= 90 ? { mark: '优', color: 'var(--color-jade)', msg: '一笔到位,真稳!' }
      : accuracy >= 70 ? { mark: '良', color: 'var(--color-vermilion)', msg: '不错,大部分笔顺都对了' }
      : { mark: '继续', color: 'var(--color-mustard)', msg: '多练几遍就能记住笔顺' };

    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-md mx-auto px-5 py-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="seal text-2xl mx-auto mb-6" style={{ width: 88, height: 88, fontSize: '2rem', background: grade.color }}>
              {grade.mark}
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}>
              {stats.perfect} / {stats.totalChars} 个一笔不错
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--color-ink-soft)' }}>
              {grade.msg} · 共写错 {stats.totalMistakes} 笔
            </p>
            <button
              onClick={() => {
                setChars([]); setIdx(0); setDone(false);
                setStats({ totalChars: 0, totalMistakes: 0, perfect: 0 });
              }}
              className="btn btn-primary btn-lg"
            >
              再来一组 →
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  const cur = chars[idx];
  if (!cur) {
    setDone(true);
    return null;
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-md mx-auto px-5 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display-sans)' }}>
            笔顺挑战
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>
            第 {idx + 1} / {chars.length} 个 · 一笔一笔写,写错那笔会闪
          </p>
        </header>

        <motion.div key={cur} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <StrokeQuiz
            char={cur}
            size={260}
            onComplete={(s) => {
              haptic.success();
              setStats((prev) => ({
                totalChars: prev.totalChars + 1,
                totalMistakes: prev.totalMistakes + s.totalMistakes,
                perfect: prev.perfect + (s.totalMistakes === 0 ? 1 : 0),
              }));
              setTimeout(() => {
                if (idx + 1 >= chars.length) setDone(true);
                else setIdx((i) => i + 1);
              }, 1200);
            }}
          />
        </motion.div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              if (idx + 1 >= chars.length) setDone(true);
              else setIdx((i) => i + 1);
            }}
            className="text-sm underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            跳过这个字 →
          </button>
        </div>
      </main>
    </div>
  );
}
