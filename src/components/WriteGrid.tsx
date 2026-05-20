'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import WriteCanvas, { type WriteCanvasHandle } from './WriteCanvas';

export type WriteGridHandle = {
  clear: () => void;
  isEmpty: () => boolean;
};

type Props = {
  count: number;        // 词语的字数 = 田字格数量
  guide?: string;       // 描红字（可选，逐字对应）
  maxWidth?: number;    // 整行最大宽度
};

// 按词语字数排出对应数量的米字格，像真实的默写本
const WriteGrid = forwardRef<WriteGridHandle, Props>(function WriteGrid(
  { count, guide, maxWidth = 440 },
  ref,
) {
  const refs = useRef<(WriteCanvasHandle | null)[]>([]);
  const n = Math.max(1, count);

  // 每格大小：字数越多格子越小，单字最大
  const gap = 10;
  const size = Math.min(240, Math.max(84, Math.floor((maxWidth - gap * (n - 1)) / n)));

  useImperativeHandle(ref, () => ({
    clear: () => refs.current.forEach(r => r?.clear()),
    isEmpty: () => refs.current.every(r => r?.isEmpty() ?? true),
  }), []);

  return (
    <div className="flex flex-wrap justify-center" style={{ gap }}>
      {Array.from({ length: n }).map((_, i) => (
        <WriteCanvas
          key={i}
          ref={el => { refs.current[i] = el; }}
          size={size}
          guideChar={guide ? Array.from(guide)[i] : undefined}
        />
      ))}
    </div>
  );
});

export default WriteGrid;
