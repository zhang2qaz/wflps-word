'use client';

import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import BookPicker from '@/components/BookPicker';
import { useStore } from '@/lib/store';

export default function SetupPage() {
  const router = useRouter();
  const hasSelection = useStore(s => !!s.selectedBook);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="pt-2">
        <BookPicker
          title="换一本课本"
          subtitle="学期末了?换成新一本课本 —— 整个 App 的字词 · 句子 · 古诗都会跟着切。"
          showCancel={hasSelection}
          onDone={() => router.push('/')}
        />
      </main>
    </div>
  );
}
