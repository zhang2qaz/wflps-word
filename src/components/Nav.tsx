'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Logo from './Logo';
import { useAccount } from './AccountProvider';
import { useStore } from '@/lib/store';

type NavLink = { href: string; label: string; group: 'kid' | 'parent' };

const LINKS: NavLink[] = [
  { href: '/learn', label: '学字词', group: 'kid' },
  { href: '/recite?kind=sentences', label: '学句子', group: 'kid' },
  { href: '/recite?kind=poems', label: '学古诗', group: 'kid' },
  { href: '/dictate', label: '听写', group: 'kid' },
  { href: '/mistakes', label: '错题集合', group: 'kid' },
  { href: '/write', label: '写作', group: 'kid' },
  { href: '/import', label: '导入', group: 'parent' },
  { href: '/progress', label: '家长', group: 'parent' },
];

// Nav 副标题 —— 显示当前课本(没选过就空白,不再写死「WFLPS · 国际部 P2」)
const GRADE_CHAR = ['', '一', '二', '三', '四', '五', '六'];
function NavBookSubtitle() {
  const selectedBook = useStore(s => s.selectedBook);
  if (!selectedBook) return null;
  const label = `${GRADE_CHAR[selectedBook.grade] ?? selectedBook.grade}年级${selectedBook.semester}册`;
  return (
    <span className="text-[9px] tracking-wide mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
      {label}
    </span>
  );
}

// 当前课本 chip —— 显示「二下 ▾」,点开跳 /setup 换课本
function BookChip() {
  const selectedBook = useStore(s => s.selectedBook);
  // 未选过课本时也显示一个入口 chip,让用户随时能进 /setup
  const label = selectedBook
    ? `${GRADE_CHAR[selectedBook.grade] ?? selectedBook.grade}${selectedBook.semester}`
    : '选课本';
  return (
    <Link
      href="/setup"
      className="btn btn-glass btn-sm flex-shrink-0"
      style={{ color: 'var(--color-ink)' }}
      title="切换课本"
    >
      📚 {label} ▾
    </Link>
  );
}

// 账号 / 孩子切换 —— 只在启用了账号系统时显示
function AccountChip() {
  const acc = useAccount();
  const [open, setOpen] = useState(false);
  if (!acc || !acc.cloud) return null;

  const active = acc.children.find(c => c.id === acc.activeChildId);

  const onAdd = async () => {
    setOpen(false);
    const name = window.prompt('再添加一个孩子，他/她叫什么名字？');
    if (name && name.trim()) {
      try { await acc.addChild(name.trim(), false); } catch { /* 忽略 */ }
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-glass btn-sm"
        style={{ color: 'var(--color-ink)' }}
      >
        👤 {active?.name ?? '账号'} ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="glass-strong absolute right-0 top-full mt-2 z-50 overflow-hidden min-w-[180px]"
            style={{ borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-xl)' }}
          >
            {acc.children.map(c => (
              <button
                key={c.id}
                onClick={() => { acc.switchChild(c.id); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm"
                style={{
                  background: c.id === acc.activeChildId ? 'var(--color-paper-warm)' : 'transparent',
                  fontWeight: c.id === acc.activeChildId ? 700 : 400,
                }}
              >
                {c.id === acc.activeChildId ? '● ' : '○ '}{c.name}
              </button>
            ))}
            <button
              onClick={onAdd}
              className="w-full text-left px-3 py-2 text-sm border-t"
              style={{ borderColor: 'var(--color-stone)', color: 'var(--color-vermilion)' }}
            >
              + 添加孩子
            </button>
            <button
              onClick={() => { setOpen(false); acc.signOut(); }}
              className="w-full text-left px-3 py-2 text-sm border-t"
              style={{ borderColor: 'var(--color-stone)', color: 'var(--color-ink-soft)' }}
            >
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Nav() {
  return (
    <Suspense fallback={<NavShell />}>
      <NavInner />
    </Suspense>
  );
}

function NavShell() {
  return (
    <header className="glass-warm sticky top-0 z-30 safe-top">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-3" />
    </header>
  );
}

function NavInner() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const currentKind = sp.get('kind');
  return (
    <header className="glass-warm sticky top-0 z-30 safe-top">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 mr-2">
          <Logo size={34} />
          <span className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-wider" style={{ fontFamily: 'var(--font-serif-cn)' }}>世外默写本</span>
            <NavBookSubtitle />
          </span>
        </Link>
        <nav className="flex-1 flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((l, i) => {
            // 拆 pathname + query 判 active —— /recite?kind=poems 与 /recite?kind=sentences 共用 pathname
            const [linkPath, linkQuery = ''] = l.href.split('?');
            const linkKind = new URLSearchParams(linkQuery).get('kind');
            const pathMatch = pathname === linkPath;
            const active = linkKind
              ? pathMatch && currentKind === linkKind
              : pathMatch && !(linkPath === '/recite' && currentKind);
            const showDivider = i > 0 && LINKS[i - 1].group === 'kid' && l.group === 'parent';
            return (
              <span key={l.href} className="flex items-center">
                {showDivider && (
                  <span
                    className="mx-1.5 hidden sm:inline-block h-4 w-px"
                    style={{ background: 'color-mix(in srgb, var(--color-ink) 12%, transparent)' }}
                    aria-hidden
                  />
                )}
                <Link
                  href={l.href}
                  className="px-3.5 py-1.5 rounded-full transition-all"
                  style={
                    active
                      ? {
                          background: 'var(--color-ink)',
                          color: 'var(--color-paper)',
                          boxShadow: 'var(--shadow-md)',
                        }
                      : { color: 'var(--color-ink-soft)' }
                  }
                >
                  {l.label}
                </Link>
              </span>
            );
          })}
        </nav>
        <BookChip />
        <AccountChip />
      </div>
    </header>
  );
}
