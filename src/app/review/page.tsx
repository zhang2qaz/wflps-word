'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import DictationCard, { type DictationResult } from '@/components/DictationCard';
import { WORDS, type Word } from '@/data/vocabulary';
import { useStore, selectDueWords } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { stopSpeak } from '@/lib/tts';

export default function ReviewPage() {
  const dueIds = useStore(useShallow((s) => selectDueWords(s)));
  const customWords = useStore(useShallow(s => s.customWords));
  const recordAnswer = useStore(s => s.recordAnswer);
  const [queue, setQueue] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  // 首次加载锁定 due 队列
  useEffect(() => {
    if (queue.length === 0 && dueIds.length > 0) {
      const lookup = new Map<string, Word>([...WORDS, ...customWords].map(w => [w.id, w]));
      const ws = dueIds.map(id => lookup.get(id)).filter(Boolean) as Word[];
      if (ws.length > 0) { setQueue(ws); setIdx(0); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeak(), []);

  const handleDone = (r: DictationResult) => {
    const current = queue[idx];
    recordAnswer(current.id, r.correct, { hintUsed: r.hintUsed, errorTags: r.errorTags });
    if (idx >= queue.length - 1) setDone(true);
    else setIdx(i => i + 1);
  };

  // 空状态
  if (queue.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>空</div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            今天没有到期的字
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
            之前学的字都还在记忆窗口里 — 这是好事 🎉
            <br />
            可以去「学新字」继续，或者明天再来。
          </p>
          <div className="flex justify-center gap-3">
            <a href="/learn" className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              去学新字
            </a>
            <a href="/dictate" className="px-5 py-2.5 rounded-md border" style={{ borderColor: 'var(--color-stone-dark)' }}>
              随机听写
            </a>
          </div>
        </main>
      </div>
    );
  }

  // 完成
  if (done) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>毕</div>
            <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              今日复习全部完成
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
              记忆又强化了一轮。算法会根据你的表现，安排下次复习时间。
            </p>
            <a href="/" className="px-5 py-2.5 rounded-md font-medium inline-block" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              回到首页
            </a>
          </motion.div>
        </main>
      </div>
    );
  }

  // 复习界面
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <a href="/" className="text-sm underline" style={{ color: 'var(--color-ink-soft)' }}>← 退出</a>
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>今日复习</div>
        </div>
        <DictationCard
          key={queue[idx].id}
          word={queue[idx]}
          index={idx}
          total={queue.length}
          onDone={handleDone}
        />
      </main>
    </div>
  );
}
