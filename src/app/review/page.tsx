'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import DictationCard, { type DictationResult } from '@/components/DictationCard';
import Link from 'next/link';
import { currentPosition, unitWords, type Word } from '@/data/vocabulary';
import { useStore, selectUnitReviewDue, selectDueRecite } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { stopSpeak } from '@/lib/tts';

function ReciteDueBanner({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Link
      href="/recite"
      className="block mt-4 p-3 rounded-xl text-sm text-center"
      style={{ border: '1px solid var(--color-mustard)', background: 'rgba(224,163,42,0.1)', color: 'var(--color-ink)' }}
    >
      🔔 还有 <b>{count}</b> 项古诗 / 句子今天该复习 —— 去「古诗」页 →
    </Link>
  );
}

const GRADE_CHAR = ['', '一', '二', '三', '四', '五', '六'];
function bookLabel(grade: number, semester: '上' | '下') {
  return `${GRADE_CHAR[grade] ?? grade}年级${semester}册`;
}

export default function ReviewPage() {
  const progress = useStore(useShallow((s) => s.progress));
  const selectedBook = useStore((s) => s.selectedBook);
  const dueIds = useStore(useShallow((s) => selectUnitReviewDue(s)));
  const dueReciteCount = useStore((s) => selectDueRecite(s).length);
  const recordAnswer = useStore((s) => s.recordAnswer);
  const [queue, setQueue] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  // 当前单元 —— 优先 selectedBook 下的进度,没选过再退回全局 currentPosition
  const pos = useMemo(() => {
    const p = currentPosition((id) => !!progress[id]?.lastReview);
    if (!selectedBook) return p;
    // 用户已经声明在学这本课本 —— 强制锚定到这本
    if (p.grade === selectedBook.grade && p.semester === selectedBook.semester) return p;
    return { grade: selectedBook.grade, semester: selectedBook.semester, unit: 1 };
  }, [progress, selectedBook]);
  const unitLabel = `${bookLabel(pos.grade, pos.semester)} · 第 ${pos.unit} 单元`;
  const unitHasLearned = useMemo(
    () => unitWords(pos.grade, pos.semester, pos.unit).some((w) => progress[w.id]?.lastReview),
    [pos, progress],
  );

  // 首次加载锁定复习队列 = 当前单元里「到期该复习」的字
  useEffect(() => {
    if (queue.length > 0 || dueIds.length === 0) return;
    const map = new Map(unitWords(pos.grade, pos.semester, pos.unit).map((w) => [w.id, w]));
    const ws = dueIds.map((id) => map.get(id)).filter(Boolean) as Word[];
    if (ws.length > 0) { setQueue(ws); setIdx(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeak(), []);

  const handleDone = (r: DictationResult) => {
    const current = queue[idx];
    recordAnswer(current.id, r.correct, { hintUsed: r.hintUsed, errorTags: r.errorTags, wrongChars: r.wrongChars, wrongShots: r.wrongShots });
    if (idx >= queue.length - 1) setDone(true);
    else setIdx((i) => i + 1);
  };

  // 空状态
  if (queue.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>
            {unitHasLearned ? '净' : '空'}
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            {unitHasLearned ? '本单元的字都复习过了' : '当前单元还没有可复习的字'}
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            {unitHasLearned ? (
              <>
                <b>{unitLabel}</b> 暂时没有到点要默的字 —— 这是好事 🎉
                <br />
                到下一个复习时间会自动出现，可以先去学新字。
              </>
            ) : (
              <>
                复习内容来自你正在学的 <b>{unitLabel}</b>。
                <br />
                先去「学新字」学几个，学过的字才会进入复习。
              </>
            )}
          </p>
          <div className="flex justify-center gap-3">
            <a href="/learn" className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              去学新字
            </a>
            <a href="/dictate" className="px-5 py-2.5 rounded-md border" style={{ borderColor: 'var(--color-stone-dark)' }}>
              随机听写
            </a>
          </div>
          <div className="max-w-sm mx-auto">
            <ReciteDueBanner count={dueReciteCount} />
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
              本单元复习完成
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
              {unitLabel} 到期的字又强化了一轮。算法会根据你的表现，安排下次复习时间。
            </p>
            <a href="/" className="px-5 py-2.5 rounded-md font-medium inline-block" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              回到首页
            </a>
            <div className="max-w-sm mx-auto">
              <ReciteDueBanner count={dueReciteCount} />
            </div>
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
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>复习 · {unitLabel}</div>
        </div>
        <DictationCard
          key={queue[idx].id}
          word={queue[idx]}
          index={idx}
          total={queue.length}
          onDone={handleDone}
          srs={progress[queue[idx].id]}
        />
      </main>
    </div>
  );
}
