'use client';

import { useEffect } from 'react';

/**
 * 全局触摸守卫 —— 在 iPad 上彻底拦掉孩子手写时的误触：
 *  - 长按弹出的「拷贝 / 查询 / 分享」菜单（contextmenu）
 *  - 误触选中文字 / 图片（selectstart、dragstart）
 * 输入框、文本域不受影响（导入页仍可正常输入、粘贴）。
 * 纯本地行为拦截，不联网。
 */
export default function TouchGuard() {
  useEffect(() => {
    const isField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.isContentEditable
      );
    };
    const block = (e: Event) => {
      if (isField(e.target)) return;
      e.preventDefault();
    };
    // passive:false 才能成功 preventDefault
    document.addEventListener('contextmenu', block, { passive: false });
    document.addEventListener('selectstart', block, { passive: false });
    document.addEventListener('dragstart', block, { passive: false });
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('selectstart', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);

  return null;
}
