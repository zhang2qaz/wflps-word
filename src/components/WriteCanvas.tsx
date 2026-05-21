'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

export type WriteCanvasHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  snapshot: () => string | null;  // 导出孩子手写的图（本地 PNG，不上传）
};

type Props = {
  size?: number;
  guideChar?: string; // 灰色描红字
  className?: string;
};

const INK = '#1a2030';
const BASE_WIDTH = 4;

// —— 手写一笔进行中时锁住整页 ——
// 防止孩子的手 / 手掌误触：页面滚动、选中文字、弹出「复制·查询」菜单。
let writeLockCount = 0;
function lockPageForWriting() {
  if (typeof document === 'undefined') return;
  if (writeLockCount === 0) document.body.classList.add('writing-lock');
  writeLockCount += 1;
}
function unlockPageForWriting() {
  if (typeof document === 'undefined') return;
  writeLockCount = Math.max(0, writeLockCount - 1);
  if (writeLockCount === 0) document.body.classList.remove('writing-lock');
}

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
    snapshot: () => {
      const c = canvasRef.current;
      if (!c || empty) return null;
      try { return c.toDataURL('image/png'); } catch { return null; }
    },
  }), [empty]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    // 高 DPI（iPad 通常 dpr=2）
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    c.style.width = `${size}px`;
    c.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    // —— iPad / Apple Pencil 适配 ——
    let drawing = false;
    let activeId: number | null = null;  // 一次只跟踪一个指针
    let penSeen = false;                 // 用过手写笔后，忽略手指/手掌（防误触）
    let gesturing = false;               // 双指缩放手势进行中 → 不写字
    let moved = false;                   // 这一笔有没有移动过（区分「点」和「划」）
    let lastX = 0;
    let lastY = 0;

    const getPos = (e: PointerEvent) => {
      const rect = c.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    // 笔压决定笔画粗细（Apple Pencil 有压感，手指/鼠标用固定值）
    const lineW = (e: PointerEvent) => {
      if (e.pointerType === 'pen' && e.pressure > 0) {
        return BASE_WIDTH * (0.7 + e.pressure * 0.6); // 约 0.7x ~ 1.3x
      }
      return BASE_WIDTH;
    };

    // 数手指（不含 Apple Pencil）—— 用来区分「双指缩放」和「笔+手掌」
    const fingerCount = (e: TouchEvent) => {
      let n = 0;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i] as Touch & { touchType?: string };
        if (t.touchType !== 'stylus') n += 1;
      }
      return n;
    };

    // 放弃当前这一笔（双指缩放时调用）
    const abortStroke = () => {
      if (!drawing) return;
      drawing = false;
      moved = false;
      unlockPageForWriting();
      if (activeId !== null) {
        try { c.releasePointerCapture(activeId); } catch {}
        activeId = null;
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'pen') penSeen = true;
      if (gesturing) return;                              // 双指缩放中，不写字
      if (penSeen && e.pointerType !== 'pen') return;     // 用笔后拒绝手指/手掌
      if (activeId !== null) return;                      // 已经在写了

      e.preventDefault();
      drawing = true;
      moved = false;
      lockPageForWriting();
      activeId = e.pointerId;
      const { x, y } = getPos(e);
      lastX = x; lastY = y;
      try { c.setPointerCapture(e.pointerId); } catch {}
    };

    const drawSeg = (e: PointerEvent) => {
      const { x, y } = getPos(e);
      ctx.lineWidth = lineW(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x; lastY = y;
    };

    const onMove = (e: PointerEvent) => {
      if (!drawing || e.pointerId !== activeId) return;
      e.preventDefault();
      if (!moved) { moved = true; setEmpty(false); }
      // 用 coalesced events 取出手写笔的高频采样点 → 笔画更顺滑
      const evs = typeof e.getCoalescedEvents === 'function'
        ? e.getCoalescedEvents()
        : [e];
      for (const ev of (evs.length ? evs : [e])) drawSeg(ev as PointerEvent);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activeId) return;
      // 没有移动过 → 是一个「点」，补一个圆点
      if (drawing && !moved) {
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.arc(x, y, lineW(e) / 2, 0, Math.PI * 2);
        ctx.fill();
        setEmpty(false);
      }
      drawing = false;
      moved = false;
      unlockPageForWriting();
      activeId = null;
      try { c.releasePointerCapture(e.pointerId); } catch {}
    };

    // —— touch 事件层：区分「双指缩放」和「单指写字」——
    // 双指 → 放行给浏览器缩放田字格；单指 → 拦掉 iOS 选字 / 复制菜单 / 放大镜。
    const onTouchStart = (e: TouchEvent) => {
      if (fingerCount(e) >= 2) {
        gesturing = true;
        abortStroke();   // 放弃这一笔，把屏幕让给缩放
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (gesturing || fingerCount(e) >= 2) return;  // 双指 → 放行缩放
      e.preventDefault();                            // 单指写字 → 拦掉选字/复制
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) gesturing = false;
    };

    c.addEventListener('pointerdown', onDown);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerup', onUp);
    c.addEventListener('pointercancel', onUp);
    c.addEventListener('touchstart', onTouchStart, { passive: true });
    c.addEventListener('touchmove', onTouchMove, { passive: false });
    c.addEventListener('touchend', onTouchEnd, { passive: true });
    c.addEventListener('touchcancel', onTouchEnd, { passive: true });
    // 注意：不监听 pointerleave —— 写字时笔尖常会划到格子边缘外，
    // setPointerCapture 已保证继续收到事件，不能因离开就断笔。
    return () => {
      c.removeEventListener('pointerdown', onDown);
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerup', onUp);
      c.removeEventListener('pointercancel', onUp);
      c.removeEventListener('touchstart', onTouchStart);
      c.removeEventListener('touchmove', onTouchMove);
      c.removeEventListener('touchend', onTouchEnd);
      c.removeEventListener('touchcancel', onTouchEnd);
      // 写到一半被卸载（切页面）时，别把整页锁死了
      if (drawing) unlockPageForWriting();
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
            color: '#dfe3ec',
            lineHeight: 1,
            zIndex: 5,
          }}
        >
          {guideChar}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 brush-cursor select-none"
        style={{
          zIndex: 10,
          touchAction: 'pinch-zoom',  // 单指写字、双指可缩放田字格
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      />
    </div>
  );
});

export default WriteCanvas;
