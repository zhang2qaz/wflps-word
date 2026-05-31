'use client';

import { useMemo, useState } from 'react';
import { useEssays } from '@/lib/essays';
import { useShots } from '@/lib/shots';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { WORDS, getReciteRef } from '@/data/vocabulary';

// 家长后台「孩子写的内容」—— 把孩子实际写出来的东西集中给家长看:
// 1) 作文 / 语音作文 全文(可展开)
// 2) 听写里写错的字 —— 孩子的手写截图 + 对应的标准字
export default function ChildWork() {
  const essays = useEssays(useShallow((s) => s.essays));
  const shots = useShots(useShallow((s) => s.shots));
  const customWords = useStore(useShallow((s) => s.customWords));

  // 手写图:把 shots(题目 id → 每格图)摊平成「孩子写错的某个字 + 它的手写图」
  const handwrites = useMemo(() => {
    const wordMap = new Map([...WORDS, ...customWords].map((w) => [w.id, w]));
    const out: { key: string; label: string; lesson: string; img: string }[] = [];
    for (const [id, imgs] of Object.entries(shots)) {
      if (!imgs || imgs.length === 0) continue;
      const w = wordMap.get(id);
      const ref = w ? null : getReciteRef(id);
      const label = w?.char ?? ref?.title ?? id;
      const lesson = w?.lesson ?? ref?.lesson ?? '';
      imgs.forEach((img, i) => {
        if (img) out.push({ key: `${id}-${i}`, label, lesson, img });
      });
    }
    return out;
  }, [shots, customWords]);

  const [openId, setOpenId] = useState<string | null>(null);

  if (essays.length === 0 && handwrites.length === 0) {
    return (
      <section className="mb-10 p-5 rounded-xl border" style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}>
        <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>孩子写的内容</h2>
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          还没有作文,也还没有听写留下的手写记录。孩子在「作文本」「语音作文」写的文章、以及「听写」里写错的字,都会出现在这里。
        </p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>孩子写的内容</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
        孩子亲手写下的作文和听写手迹 —— 点开看全文 / 看手写。
      </p>

      {/* 作文 */}
      {essays.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
            作文 · {essays.length} 篇
          </div>
          <div className="space-y-2">
            {essays.map((e) => {
              const open = openId === e.id;
              return (
                <div
                  key={e.id}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
                >
                  <button
                    onClick={() => setOpenId(open ? null : e.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold truncate" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                        {e.title || '(无标题)'}
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                        {e.date} · {e.wordCount} 字 · 不重复 {e.uniqueChars} 字
                        {e.selfReviewDone ? ' · ✓ 已自检' : ''}
                      </div>
                    </div>
                    <span style={{ color: 'var(--color-stone-dark)', fontSize: '1.3rem', lineHeight: 1 }}>
                      {open ? '▾' : '›'}
                    </span>
                  </button>
                  {open && (
                    <div
                      className="px-4 pb-4 text-[15px] leading-relaxed whitespace-pre-wrap"
                      style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink)', borderTop: '0.5px solid var(--color-stone)' }}
                    >
                      <div className="pt-3">{e.content || '(空)'}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 听写手迹 */}
      {handwrites.length > 0 && (
        <div>
          <div className="text-[11px] tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
            听写手迹 · {handwrites.length} 个写错的字
          </div>
          <p className="text-[12px] mb-3" style={{ color: 'var(--color-ink-soft)' }}>
            这些是孩子在听写里写错、被记下来的手写图 —— 标准字写在每张图下面。
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {handwrites.map((h) => (
              <div key={h.key} className="flex flex-col items-center">
                <div
                  className="rounded-lg overflow-hidden border w-full aspect-square flex items-center justify-center"
                  style={{ borderColor: 'var(--color-stone-dark)', background: '#fff' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.img} alt={`手写:${h.label}`} className="w-full h-full object-contain" />
                </div>
                <div className="text-sm mt-1 font-bold" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink)' }}>
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
