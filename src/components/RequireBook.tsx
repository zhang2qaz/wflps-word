'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';

/**
 * 子页面统一的「先选课本」拦截。
 * 用法:
 *   const guard = useRequireBook();
 *   if (guard) return guard;  // 还没选 → 渲染引导卡;选了 → guard 为 null,正常往下走
 *
 * 不做自动 redirect —— 让用户清楚知道发生了什么。
 */
export function useRequireBook(): React.ReactElement | null {
  const selectedBook = useStore(s => s.selectedBook);
  if (selectedBook) return null;
  return <BookRequiredCard />;
}

function BookRequiredCard() {
  return (
    <div className="max-w-md mx-auto px-5 pt-16 pb-10 text-center">
      <div className="text-6xl mb-5">📚</div>
      <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
        先选你在学的课本
      </h1>
      <p className="text-sm mb-7 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
        所有功能都跟课本绑定 —— 选一本课本(年级 + 上/下册),后续的字词、句子、古诗、听写、错题都会限定在这本范围内。
      </p>
      <Link href="/setup" className="btn btn-primary btn-lg inline-block">
        去选课本 →
      </Link>
    </div>
  );
}
