'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import WriteCanvas, { type WriteCanvasHandle } from './WriteCanvas';

export type WriteGridHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  emptyFlags: () => boolean[];        // 每格是否空着（自动标出漏写的字）
  snapshots: () => (string | null)[]; // 每格孩子手写的图，用来对答案
};

type Props = {
  count: number;        // 词语的字数 = 田字格数量
  guide?: string;       // 描红字（可选，逐字对应）
  maxWidth?: number;    // 整行最大宽度
};

// 按词语字数排出对应数量的米字格，像真实的默写本。
// 每格下方有独立「擦」按钮，可单独擦掉这一个字。
const WriteGrid = forwardRef<WriteGridHandle, Props>(function WriteGrid(
  { count, guide, maxWidth = 580 },
  ref,
) {
  const refs = useRef<(WriteCanvasHandle | null)[]>([]);
  const n = Math.max(1, count);

  // 每格大小：尽量放大方便孩子手写；字数多了再换行。
  const gap = 10;
  const size = Math.min(300, Math.max(140, Math.floor((maxWidth - gap * (n - 1)) / n)));

  useImperativeHandle(ref, () => ({
    clear: () => refs.current.forEach(r => r?.clear()),
    isEmpty: () => refs.current.every(r => r?.isEmpty() ?? true),
    emptyFlags: () => Array.from({ length: n }).map((_, i) => refs.current[i]?.isEmpty() ?? true),
    snapshots: () => Array.from({ length: n }).map((_, i) => refs.current[i]?.snapshot() ?? null),
  }), [n]);

  return (
    <div
      className="flex flex-wrap justify-center"
      style={{
        gap,
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'manipulation',  // 双指可缩放田字格
      }}
    >
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex flex-col items-center" style={{ gap: 4 }}>
          <WriteCanvas
            ref={el => { refs.current[i] = el; }}
            size={size}
            guideChar={guide ? Array.from(guide)[i] : undefined}
          />
          <button
            type="button"
            onClick={() => refs.current[i]?.clear()}
            className="erase-btn text-[11px] px-2 py-0.5 rounded"
            style={{
              border: '1px solid var(--color-stone-dark)',
              color: 'var(--color-ink-soft)',
              touchAction: 'manipulation',
            }}
          >
            ⌫ 擦这个
          </button>
        </div>
      ))}
    </div>
  );
});

export default WriteGrid;
