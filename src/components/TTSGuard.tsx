'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { stopSpeak } from '@/lib/tts';

/**
 * 全局 TTS 路由守卫:每次 pathname 改变就 stopSpeak()。
 * 单点挂在 layout/AccountProvider 树里,免得每个页面自己写 cleanup,
 * 也避免某个页面忘了 cleanup 导致语音跨页跟着孩子。
 */
export default function TTSGuard() {
  const pathname = usePathname();
  useEffect(() => {
    // 切换到新页面时立即停止任何正在播报的 TTS
    stopSpeak();
    return () => stopSpeak();
  }, [pathname]);
  return null;
}
