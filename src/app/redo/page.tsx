'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import DictationCard, { type DictationResult } from '@/components/DictationCard';
import { PoemStudy, SentenceStudy } from '@/app/recite/page';
import { WORDS, POEMS, SENTENCES, type Word, type Poem, type Sentence } from '@/data/vocabulary';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { stopSpeak } from '@/lib/tts';

type Item =
  | { kind: 'word'; word: Word }
  | { kind: 'sentence'; sentence: Sentence }
  | { kind: 'poem'; poem: Poem };

// 一键重做错题：词语 → 句子 → 古诗，所有错过的逐项重新默写一遍
export default function RedoPage() {
  const progress = useStore(useShallow((s) => s.progress));
  const customWords = useStore(useShallow((s) => s.customWords));
  const recordAnswer = useStore((s) => s.recordAnswer);
  const [queue, setQueue] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);

  // 首次进入锁定错题队列
  useEffect(() => {
    if (started) return;
    const isWrong = (id: string) => (progress[id]?.wrong ?? 0) > 0;
    const q: Item[] = [
      ...[...WORDS, ...customWords].filter((w) => isWrong(w.id)).map((w) => ({ kind: 'word' as const, word: w })),
      ...SENTENCES.filter((s) => isWrong(s.id)).map((s) => ({ kind: 'sentence' as const, sentence: s })),
      ...POEMS.filter((p) => isWrong(p.id)).map((p) => ({ kind: 'poem' as const, poem: p })),
    ];
    setQueue(q);
    setStarted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeak(), []);

  const advance = () => { stopSpeak(); setIdx((i) => i + 1); };

  const onWordDone = (r: DictationResult) => {
    const cur = queue[idx];
    if (cur?.kind === 'word') {
      recordAnswer(cur.word.id, r.correct, {
        hintUsed: r.hintUsed, errorTags: r.errorTags, wrongChars: r.wrongChars, wrongShots: r.wrongShots,
      });
    }
    advance();
  };

  // 没有错题
  if (started && queue.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>净</div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            没有错题需要重做
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
            词语、句子、古诗都没有写错过 —— 或者都已攻克 👏
          </p>
          <a href="/" className="px-5 py-2.5 rounded-md font-medium inline-block" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
            回到首页
          </a>
        </main>
      </div>
    );
  }

  // 全部重做完成
  if (started && idx >= queue.length) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>毕</div>
            <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              错题全部重做完成！
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
              一共重做了 {queue.length} 项。这次还写错的，已经更新进错题本，下次再练。
            </p>
            <div className="flex justify-center gap-3">
              <a href="/mistakes" className="px-5 py-2.5 rounded-md border" style={{ borderColor: 'var(--color-stone-dark)' }}>
                看错题本
              </a>
              <a href="/" className="px-5 py-2.5 rounded-md font-medium" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
                回到首页
              </a>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!started || queue.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>加载中…</div>
        </main>
      </div>
    );
  }

  const cur = queue[idx];
  const kindLabel = cur.kind === 'word' ? '词语' : cur.kind === 'sentence' ? '句子' : '古诗';

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <a href="/mistakes" className="text-sm underline" style={{ color: 'var(--color-ink-soft)' }}>← 退出</a>
          <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            错题重做 · 第 {idx + 1} / {queue.length} 项 · {kindLabel}
          </div>
        </div>

        {cur.kind === 'word' && (
          <DictationCard
            key={`w-${cur.word.id}`}
            word={cur.word}
            index={idx}
            total={queue.length}
            onDone={onWordDone}
            srs={progress[cur.word.id]}
          />
        )}
        {cur.kind === 'sentence' && (
          <SentenceStudy key={`s-${cur.sentence.id}`} sentence={cur.sentence} onExit={advance} />
        )}
        {cur.kind === 'poem' && (
          <PoemStudy key={`p-${cur.poem.id}`} poem={cur.poem} onExit={advance} startStep="recite" />
        )}
      </main>
    </div>
  );
}
