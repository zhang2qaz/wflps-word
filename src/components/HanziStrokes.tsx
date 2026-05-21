'use client';

import { useEffect, useRef, useState } from 'react';

// hanzi-writer 是 ESM/UMD 库，动态导入避免 SSR 报错
type HanziWriterType = typeof import('hanzi-writer').default;
type WriterInstance = ReturnType<HanziWriterType['create']>;

type Props = {
  char: string;
  size?: number;
  showOutline?: boolean;
};

// 笔顺演示：默认循环不断重复播放
export default function HanziStrokes({ char, size = 180, showOutline = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const writerRef = useRef<WriterInstance | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
          radicalColor: '#21348c',
          delayBetweenStrokes: 200,
          delayBetweenLoops: 900,
          strokeAnimationSpeed: 1,
        });
        if (cancelled) return;
        writerRef.current = w;
        // 循环不断重复演示笔顺
        w.loopCharacterAnimation();
      } catch {
        if (!cancelled) setErr(true);
      }
    })();

    return () => {
      cancelled = true;
      writerRef.current = null;
    };
  }, [char, size, showOutline]);

  return (
    <div className="mizige" style={{ width: size, height: size }}>
      {err ? (
        <div
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ fontFamily: 'var(--font-serif-cn)', fontSize: size * 0.55 }}
        >
          {char}
        </div>
      ) : (
        <div ref={ref} className="relative z-10" style={{ width: size, height: size }} />
      )}
    </div>
  );
}
