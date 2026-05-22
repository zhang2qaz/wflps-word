'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useStore } from '@/lib/store';
import { useShots } from '@/lib/shots';
import { useShallow } from 'zustand/react/shallow';
import { WORDS, getReciteRef } from '@/data/vocabulary';
import { masteryLevel } from '@/lib/srs';

type Row = {
  id: string;
  kind: 'word' | 'recite';
  title: string;        // 词语 / 《诗题》 / 句子
  pinyin?: string;
  meaning?: string;
  lesson: string;
  wrong: number;
  correct: number;
  accuracy: number;
  errorTags?: string[];
  wrongChars?: string[];
  wrongShots?: (string | null)[];
  level: 'new' | 'learning' | 'review' | 'mastered';
};

export default function MistakesPage() {
  const router = useRouter();
  const progress = useStore(s => s.progress);
  const customWords = useStore(useShallow(s => s.customWords));
  const shotsMap = useShots(useShallow(s => s.shots));

  const sorted = useMemo<Row[]>(() => {
    const wordMap = new Map([...WORDS, ...customWords].map(w => [w.id, w]));
    const rows: Row[] = [];
    for (const p of Object.values(progress)) {
      // 错题 = 累计默错过，或本次记录里仍有写错的字
      if ((p.wrong ?? 0) <= 0 && (p.wrongChars?.length ?? 0) === 0) continue;
      const accuracy = p.correct + p.wrong === 0 ? 0 : p.correct / (p.correct + p.wrong);
      const level = masteryLevel(p);
      const w = wordMap.get(p.id);
      if (w) {
        rows.push({
          id: p.id, kind: 'word', title: w.char, pinyin: w.pinyin, meaning: w.meaning,
          lesson: w.lesson, wrong: p.wrong, correct: p.correct, accuracy,
          errorTags: p.errorTags, wrongChars: p.wrongChars, wrongShots: shotsMap[p.id], level,
        });
        continue;
      }
      const r = getReciteRef(p.id);
      if (r) {
        rows.push({
          id: p.id, kind: 'recite', title: r.title, lesson: r.lesson,
          wrong: p.wrong, correct: p.correct, accuracy,
          errorTags: p.errorTags, wrongChars: p.wrongChars, wrongShots: shotsMap[p.id], level,
        });
      }
    }
    return rows.sort((a, b) => (a.accuracy !== b.accuracy ? a.accuracy - b.accuracy : b.wrong - a.wrong));
  }, [progress, customWords, shotsMap]);

  if (sorted.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>
            净
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            错题本是空的
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-ink-soft)' }}>
            还没有写错过的字词，或者你都已经把它们攻克了！👏
          </p>
          <a href="/dictate" className="px-5 py-2.5 rounded-md font-medium inline-block" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
            去练听写
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>错题本</h1>
            <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
              错过的字词，按「正确率最低」排序 · 共 {sorted.length} 项
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/redo')}
            className="px-5 py-2.5 rounded-md font-medium"
            style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
          >
            一键重做错题 →
          </button>
        </div>

        <div className="space-y-2">
          {sorted.map(item => {
            const acc = Math.round(item.accuracy * 100);
            const accColor = acc < 50 ? 'var(--color-cinnabar)' : acc < 80 ? 'var(--color-mustard)' : 'var(--color-jade)';
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg border"
                style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
              >
                {item.kind === 'word' ? (
                  <div
                    className="text-3xl font-bold flex-shrink-0 w-16 text-center"
                    style={{ fontFamily: 'var(--font-serif-cn)' }}
                  >
                    {item.title}
                  </div>
                ) : (
                  <div className="text-2xl flex-shrink-0 w-16 text-center">📜</div>
                )}
                <div className="flex-1 min-w-0">
                  {item.kind === 'word' ? (
                    <>
                      <div className="text-xs mb-0.5" style={{ color: 'var(--color-ink-soft)', letterSpacing: '0.1em' }}>
                        {item.pinyin}
                      </div>
                      {item.meaning && (
                        <div className="text-sm truncate" style={{ color: 'var(--color-ink)' }}>
                          {item.meaning}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm font-bold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif-cn)' }}>
                      {item.title}
                    </div>
                  )}
                  {item.wrongChars && item.wrongChars.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px]" style={{ color: 'var(--color-cinnabar)' }}>✗ 写错的字：</span>
                      {item.wrongChars.map((c, i) => {
                        const shot = item.wrongShots?.[i] ?? null;
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded px-1 py-0.5"
                            style={{ background: 'rgba(227,36,43,0.1)' }}
                          >
                            {shot && (
                              // 孩子当时的手写，回看用
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={shot}
                                alt="你写的"
                                draggable={false}
                                style={{ width: 30, height: 30, objectFit: 'contain', background: '#fff', borderRadius: 3 }}
                              />
                            )}
                            <span
                              className="text-base font-bold"
                              style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-cinnabar)' }}
                            >
                              {c}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {item.errorTags && item.errorTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.errorTags.map(t => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-stone)', color: 'var(--color-ink-soft)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {(!item.wrongChars || item.wrongChars.length === 0) &&
                    (!item.errorTags || item.errorTags.length === 0) && (
                      <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                        《{item.lesson}》
                      </div>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold" style={{ color: accColor }}>{acc}%</div>
                  <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                    错 {item.wrong} · 对 {item.correct}
                  </div>
                  <div className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: 'var(--color-vermilion)' }}>
                    {{ new: '新', learning: '学习中', review: '复习中', mastered: '已掌握' }[item.level]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
