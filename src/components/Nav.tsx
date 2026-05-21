'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

type NavLink = { href: string; label: string; group: 'kid' | 'parent' };

const LINKS: NavLink[] = [
  { href: '/learn', label: '学新字', group: 'kid' },
  { href: '/dictate', label: '听写', group: 'kid' },
  { href: '/recite', label: '古诗', group: 'kid' },
  { href: '/review', label: '复习', group: 'kid' },
  { href: '/mistakes', label: '错题本', group: 'kid' },
  { href: '/import', label: '导入', group: 'parent' },
  { href: '/progress', label: '家长', group: 'parent' },
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
          {LINKS.map((l, i) => {
            const active = pathname === l.href;
            const showDivider = i > 0 && LINKS[i - 1].group === 'kid' && l.group === 'parent';
            return (
              <span key={l.href} className="flex items-center">
                {showDivider && (
                  <span
                    className="mx-1.5 hidden sm:inline-block h-4 w-px"
                    style={{ background: 'var(--color-stone-dark)' }}
                    aria-hidden
                  />
                )}
                <Link
                  href={l.href}
                  className="px-3 py-1.5 rounded-md transition-colors"
                  style={
                    active
                      ? { background: 'var(--color-ink)', color: 'var(--color-paper)' }
                      : l.group === 'parent'
                        ? { color: 'var(--color-stone-dark)' }
                        : { color: 'var(--color-ink-soft)' }
                  }
                >
                  {l.label}
                </Link>
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
