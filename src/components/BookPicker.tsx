'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { books, type Book } from '@/data/vocabulary';
import { useStore, type SelectedBook } from '@/lib/store';

/**
 * 全屏课本选择卡。
 * - 首次进入(selectedBook=null):占满 main 区,作为新手关
 * - 学期末手动更换:走 /setup 路由,也复用本组件
 * onPick 选完之后做什么(默认: 写 store + 调用 onDone)
 */
export default function BookPicker({
  title = '先选这学期学的课本',
  subtitle = '挑你现在用的那本 —— 整个 App 都会按这本课本展示。学期末换课本时,导航栏「📚 课本」chip 里可以随时改。',
  showCancel = false,
  onDone,
}: {
  title?: string;
  subtitle?: string;
  showCancel?: boolean;
  onDone?: () => void;
}) {
  const setSelectedBook = useStore(s => s.setSelectedBook);
  const selectedBook = useStore(s => s.selectedBook);
  const bookList = useMemo(() => books(), []);

  const pick = (b: Book) => {
    const next: SelectedBook = { grade: b.grade, semester: b.semester };
    setSelectedBook(next);
    onDone?.();
  };

  const isActive = (b: Book) =>
    !!selectedBook && selectedBook.grade === b.grade && selectedBook.semester === b.semester;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-12">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="text-sm mb-7 leading-relaxed"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        {subtitle}
      </motion.p>

      <div className="grid grid-cols-2 gap-3">
        {bookList.map((b, i) => (
          <motion.button
            key={`${b.grade}-${b.semester}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.06 * i }}
            onClick={() => pick(b)}
            className="card-hover p-5 text-left flex flex-col gap-2"
            style={{
              borderRadius: 'var(--r-xl)',
              border: isActive(b)
                ? '2px solid var(--color-vermilion)'
                : '1px solid var(--color-stone)',
              background: isActive(b) ? 'var(--color-paper-warm)' : 'var(--color-paper)',
              boxShadow: isActive(b) ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
          >
            <div
              className="text-[42px] leading-none mb-1"
              style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink)' }}
            >
              {gradeChar(b.grade)}
            </div>
            <div className="text-base font-semibold leading-tight" style={{ color: 'var(--color-ink)' }}>
              {b.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
              {b.semester === '上' ? '秋季学期' : '春季学期'}
            </div>
            {isActive(b) && (
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--color-vermilion)' }}>
                ✓ 当前课本
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {showCancel && (
        <div className="mt-6 text-center">
          <button
            onClick={() => onDone?.()}
            className="text-sm underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            不改了,返回
          </button>
        </div>
      )}
    </div>
  );
}

const GRADE_CHAR = ['', '一', '二', '三', '四', '五', '六'];
function gradeChar(g: number): string {
  return GRADE_CHAR[g] ?? String(g);
}
