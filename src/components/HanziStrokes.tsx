'use client';

import { useEffect, useRef, useState } from 'react';

// hanzi-writer 是 ESM/UMD 库，动态导入避免 SSR 报错
type HanziWriterType = typeof import('hanzi-writer').default;
type WriterInstance = ReturnType<HanziWriterType['create']>;

type Props = {
  char: string;
  size?: number;
  showOutline?: boolean;
  autoPlay?: boolean;
  delay?: number;
};

export default function HanziStrokes({ char, size = 180, showOutline = true, autoPlay = true, delay = 300 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<WriterInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setErr(false);

    (async () => {
      if (!ref.current) return;
      ref.current.innerHTML = '';
      try {
        const mod = await import('hanzi-writer');
        const HanziWriter = mod.default;
        const w = HanziWriter.create(ref.current, char, {
          width: size,
          height: size,
          padding: 8,
          showOutline,
          strokeColor: '#1a2030',
          outlineColor: '#cdd4e0',
          radicalColor: '#1e50a2',
          delayBetweenStrokes: 200,
          strokeAnimationSpeed: 1,
        });
        if (cancelled) return;
        writerRef.current = w;
        setReady(true);
        if (autoPlay) {
          setTimeout(() => {
            if (!cancelled) w.animateCharacter();
          }, delay);
        }
      } catch (e) {
        if (!cancelled) setErr(true);
      }
    })();

    return () => {
      cancelled = true;
      writerRef.current = null;
    };
  }, [char, size, showOutline, autoPlay, delay]);

  const replay = () => {
    if (writerRef.current) writerRef.current.animateCharacter();
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="mizige" style={{ width: size, height: size }}>
        <div ref={ref} className="relative z-10" style={{ width: size, height: size }} />
      </div>
      <button
        onClick={replay}
        disabled={!ready}
        className="text-xs px-3 py-1 rounded border border-stone text-ink-soft hover:bg-stone/40 disabled:opacity-40"
        style={{ borderColor: 'var(--color-stone-dark)', color: 'var(--color-ink-soft)' }}
      >
        {err ? '加载失败' : ready ? '↻ 再演示一次笔顺' : '加载中...'}
      </button>
    </div>
  );
}
