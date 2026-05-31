'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { haptic } from '@/lib/haptic';

// 家长页轻量门槛 —— 一道两位数乘法题,挡住低龄孩子,家长几秒答出。
// 通过后写 sessionStorage,本次打开 App 期间不再重复问。
const PASS_KEY = 'moxie-parent-unlocked';

function makeProblem() {
  // 两位数 × 一位数,结果家长口算得出、孩子(8 岁)多半算不出
  const a = 11 + Math.floor(Math.random() * 89);   // 11..99
  const b = 3 + Math.floor(Math.random() * 7);      // 3..9
  return { a, b, answer: a * b };
}

export default function ParentGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [problem, setProblem] = useState({ a: 12, b: 3, answer: 36 });
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(PASS_KEY) === '1') { setUnlocked(true); return; }
    } catch { /* ignore */ }
    setProblem(makeProblem());
  }, []);

  const submit = () => {
    if (Number(input) === problem.answer) {
      haptic.success();
      try { sessionStorage.setItem(PASS_KEY, '1'); } catch { /* ignore */ }
      setUnlocked(true);
    } else {
      haptic.error();
      setWrong(true);
      setInput('');
      setProblem(makeProblem());
      setTimeout(() => setWrong(false), 1500);
    }
  };

  // SSR / 挂载前不渲染门(避免闪烁)
  if (!mounted) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div
        className="w-full max-w-sm p-7 rounded-2xl text-center"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-stone-dark)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
          这是给家长看的
        </h1>
        <p className="text-sm mb-5" style={{ color: 'var(--color-ink-soft)' }}>
          算一道题就能进 —— 小朋友先回去练习吧 🙂
        </p>

        <div className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '0.02em' }}>
          {problem.a} × {problem.b} = ?
        </div>

        <input
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="答案"
          autoFocus
          className="w-full text-center text-xl py-3 rounded-lg outline-none mb-3"
          style={{
            border: wrong ? '2px solid var(--color-cinnabar)' : '1px solid var(--color-stone-dark)',
            background: 'var(--color-paper-warm)',
          }}
        />
        {wrong && (
          <p className="text-sm mb-3" style={{ color: 'var(--color-cinnabar)' }}>
            答错啦,再算一道新的试试。
          </p>
        )}

        <button
          onClick={submit}
          className="w-full py-3 rounded-lg font-medium"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          进入家长页 →
        </button>
        <Link href="/" className="block mt-3 text-sm underline" style={{ color: 'var(--color-ink-soft)' }}>
          返回首页
        </Link>
      </div>
    </div>
  );
}
