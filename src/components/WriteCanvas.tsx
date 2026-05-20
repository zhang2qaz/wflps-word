'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

export type WriteCanvasHandle = {
  clear: () => void;
  isEmpty: () => boolean;
};

type Props = {
  size?: number;
  guideChar?: string; // 灰色描红字
  className?: string;
};

const WriteCanvas = forwardRef<WriteCanvasHandle, Props>(function WriteCanvas(
  { size = 260, guideChar, className = '' },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [empty, setEmpty] = useState(true);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      setEmpty(true);
    },
    isEmpty: () => empty,
  }), [empty]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    // 高 DPI 支持
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    c.style.width = `${size}px`;
    c.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    const getPos = (e: PointerEvent) => {
      const rect = c.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      drawing = true;
      const { x, y } = getPos(e);
      lastX = x; lastY = y;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      setEmpty(false);
      c.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing) return;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x; lastY = y;
    };
    const onUp = (e: PointerEvent) => {
      drawing = false;
      try { c.releasePointerCapture(e.pointerId); } catch {}
    };
    c.addEventListener('pointerdown', onDown);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerup', onUp);
    c.addEventListener('pointercancel', onUp);
    c.addEventListener('pointerleave', onUp);
    return () => {
      c.removeEventListener('pointerdown', onDown);
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerup', onUp);
      c.removeEventListener('pointercancel', onUp);
      c.removeEventListener('pointerleave', onUp);
    };
  }, [size]);

  return (
    <div className={`relative mizige inline-block ${className}`} style={{ width: size, height: size }}>
      {guideChar && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            fontFamily: 'var(--font-display, var(--font-serif-cn))',
            fontSize: size * 0.6,
            color: '#e8e2d0',
            lineHeight: 1,
            zIndex: 5,
          }}
        >
          {guideChar}
        </div>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 brush-cursor touch-none" style={{ zIndex: 10 }} />
    </div>
  );
});

export default WriteCanvas;
