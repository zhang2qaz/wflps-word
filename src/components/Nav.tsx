'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const LINKS = [
  { href: '/', label: '首页' },
  { href: '/learn', label: '学新字' },
  { href: '/dictate', label: '听写' },
  { href: '/recite', label: '古诗句子' },
  { href: '/review', label: '复习' },
  { href: '/mistakes', label: '错题本' },
  { href: '/import', label: '导入' },
  { href: '/progress', label: '家长报告' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone bg-paper-warm/70 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 mr-2">
          <Logo size={34} />
          <span className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-wider" style={{ fontFamily: 'var(--font-serif-cn)' }}>世外默写本</span>
            <span className="text-[9px] tracking-wide mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>WFLPS · 国际部 P2</span>
          </span>
        </Link>
        <nav className="flex-1 flex flex-wrap items-center gap-1 text-sm">
          {LINKS.slice(1).map(l => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  active
                    ? 'bg-ink text-paper'
                    : 'text-ink-soft hover:bg-stone/50 hover:text-ink'
                }`}
                style={active ? { background: 'var(--color-ink)', color: 'var(--color-paper)' } : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
