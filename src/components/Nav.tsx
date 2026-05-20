'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: '首页' },
  { href: '/learn', label: '学新字' },
  { href: '/dictate', label: '听写' },
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
        <Link href="/" className="flex items-center gap-2 mr-2">
          <span className="seal text-sm">默写</span>
          <span className="font-serif-cn font-bold text-lg tracking-wider" style={{ fontFamily: 'var(--font-serif-cn)' }}>大师</span>
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
