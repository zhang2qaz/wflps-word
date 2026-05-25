'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useStore } from '@/lib/store';
import { useShots } from '@/lib/shots';
import { useShallow } from 'zustand/react/shallow';
import { WORDS, getReciteRef, getPoem, getSentence } from '@/data/vocabulary';
import { masteryLevel } from '@/lib/srs';
import { useRequireBook } from '@/components/RequireBook';

type Row = {
  id: string;
  kind: 'word' | 'recite';
  title: string;
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

const LEVEL_LABEL: Record<Row['level'], string> = {
  new: '新', learning: '学习中', review: '复习中', mastered: '已掌握',
};

// 单行错题。手写图默认不渲染（点「看手写」才加载）—— 否则一进错题本要一次性
// 解码几十上百张 base64 图，页面会卡。
function MistakeRow({ item }: { item: Row }) {
  const [showShots, setShowShots] = useState(false);
  const acc = Math.round(item.accuracy * 100);
  const accColor = acc < 50 ? 'var(--color-cinnabar)' : acc < 80 ? 'var(--color-mustard)' : 'var(--color-jade)';
  const hasShots = !!item.wrongShots && item.wrongShots.some((s) => !!s);

  return (
    <div className="card card-warm flex items-center gap-4 p-3">
      {item.kind === 'word' ? (
        <div className="text-3xl font-bold flex-shrink-0 w-16 text-center" style={{ fontFamily: 'var(--font-serif-cn)' }}>
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
              <div className="text-sm truncate" style={{ color: 'var(--color-ink)' }}>{item.meaning}</div>
            )}
          </>
        ) : (
          <div className="text-sm font-bold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-serif-cn)' }}>
            {item.title}
          </div>
        )}

        {item.wrongChars && item.wrongChars.length > 0 && (
          <div className="mt-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px]" style={{ color: 'var(--color-cinnabar)' }}>✗ 写错：</span>
              {item.wrongChars.map((c, i) => (
                <span
                  key={i}
                  className="text-sm font-bold px-1.5 rounded"
                  style={{ fontFamily: 'var(--font-serif-cn)', background: 'rgba(227,36,43,0.12)', color: 'var(--color-cinnabar)' }}
                >
                  {c}
                </span>
              ))}
              {hasShots && (
                <button
                  type="button"
                  onClick={() => setShowShots((v) => !v)}
                  className="text-xs underline ml-1 px-2 py-1 rounded min-h-[28px]"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  {showShots ? '收起手写' : '✍️ 看手写'}
                </button>
              )}
            </div>
            {showShots && hasShots && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.wrongChars.map((c, i) => {
                  const shot = item.wrongShots?.[i] ?? null;
                  return (
                    <span key={i} className="inline-flex flex-col items-center">
                      {shot ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={shot}
                          alt="你写的"
                          draggable={false}
                          style={{ width: 38, height: 38, objectFit: 'contain', background: '#fff', borderRadius: 4, border: '1px solid var(--color-stone-dark)' }}
                        />
                      ) : (
                        <span className="text-[10px]" style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-soft)' }}>没写</span>
                      )}
                      <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-cinnabar)' }}>{c}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {item.errorTags && item.errorTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.errorTags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--color-stone)', color: 'var(--color-ink-soft)' }}>
                {t}
              </span>
            ))}
          </div>
        )}
        {(!item.wrongChars || item.wrongChars.length === 0) && (!item.errorTags || item.errorTags.length === 0) && (
          <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>《{item.lesson}》</div>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-xl font-bold" style={{ color: accColor }}>{acc}%</div>
        <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>错 {item.wrong} · 对 {item.correct}</div>
        <div className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: 'var(--color-vermilion)' }}>
          {LEVEL_LABEL[item.level]}
        </div>
      </div>
    </div>
  );
}

export default function MistakesPage() {
  const guard = useRequireBook();
  const router = useRouter();
  const progress = useStore(s => s.progress);
  const customWords = useStore(useShallow(s => s.customWords));
  const selectedBook = useStore(s => s.selectedBook);
  const shotsMap = useShots(useShallow(s => s.shots));

  const sorted = useMemo<Row[]>(() => {
    const wordMap = new Map([...WORDS, ...customWords].map(w => [w.id, w]));
    // 只显示当前课本范围内的错题 —— 跨年级旧错题不掺进来干扰
    const inBook = (item: { grade?: number; semester: '上' | '下' } | undefined): boolean => {
      if (!selectedBook) return true;
      if (!item) return false;
      return (item.grade ?? 2) === selectedBook.grade && item.semester === selectedBook.semester;
    };
    const rows: Row[] = [];
    for (const p of Object.values(progress)) {
      if ((p.wrong ?? 0) <= 0 && (p.wrongChars?.length ?? 0) === 0) continue;
      const accuracy = p.correct + p.wrong === 0 ? 0 : p.correct / (p.correct + p.wrong);
      const level = masteryLevel(p);
      const w = wordMap.get(p.id);
      if (w) {
        if (!inBook(w)) continue;
        rows.push({
          id: p.id, kind: 'word', title: w.char, pinyin: w.pinyin, meaning: w.meaning,
          lesson: w.lesson, wrong: p.wrong, correct: p.correct, accuracy,
          errorTags: p.errorTags, wrongChars: p.wrongChars, wrongShots: shotsMap[p.id], level,
        });
        continue;
      }
      const r = getReciteRef(p.id);
      if (r) {
        // recite 的 grade/semester 在原始 POEMS/SENTENCES 里查
        const poem = getPoem(p.id);
        const sent = poem ? undefined : getSentence(p.id);
        const ref = poem ?? sent;
        if (!inBook(ref)) continue;
        rows.push({
          id: p.id, kind: 'recite', title: r.title, lesson: r.lesson,
          wrong: p.wrong, correct: p.correct, accuracy,
          errorTags: p.errorTags, wrongChars: p.wrongChars, wrongShots: shotsMap[p.id], level,
        });
      }
    }
    return rows.sort((a, b) => (a.accuracy !== b.accuracy ? a.accuracy - b.accuracy : b.wrong - a.wrong));
  }, [progress, customWords, shotsMap, selectedBook]);

  if (guard) return <div className="min-h-screen"><Nav />{guard}</div>;

  if (sorted.length === 0) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="seal text-2xl mx-auto mb-6" style={{ width: 80, height: 80, fontSize: '1.8rem' }}>净</div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>这本课本暂时没有错题</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-ink-soft)' }}>
            还没在当前课本里写错过字词,或者你都已经把它们攻克了!👏
          </p>
          <a href="/dictate" className="btn btn-lg inline-flex" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)', boxShadow: 'var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
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
            onClick={() => {
              if (window.confirm(`要把这 ${sorted.length} 道错题全部重新听写一遍吗？\n（中途可以随时退出，不会丢进度。）`)) {
                router.push('/redo');
              }
            }}
            className="btn btn-danger btn-lg"
          >
            一键重做错题 →
          </button>
        </div>

        <div className="space-y-2">
          {sorted.map((item) => <MistakeRow key={item.id} item={item} />)}
        </div>
      </main>
    </div>
  );
}
