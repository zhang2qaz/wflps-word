'use client';

import { useState } from 'react';
import { pinyin } from 'pinyin-pro';
import Nav from '@/components/Nav';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import type { Word, CharInfo } from '@/data/vocabulary';

type Draft = { char: string; pinyin: string };

export default function ImportPage() {
  const [raw, setRaw] = useState('');
  const [listName, setListName] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saved, setSaved] = useState(false);
  const addCustomWords = useStore(s => s.addCustomWords);
  const clearCustomWords = useStore(s => s.clearCustomWords);
  const customWords = useStore(useShallow(s => s.customWords));

  const parse = () => {
    // 支持换行 / 空格 / 逗号 / 顿号 分隔
    const tokens = raw
      .split(/[\s,，、;；]+/)
      .map(t => t.trim())
      .filter(t => /[一-龥]/.test(t));
    const seen = new Set<string>();
    const list: Draft[] = [];
    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      list.push({ char: t, pinyin: pinyin(t, { toneType: 'symbol', type: 'string' }) });
    }
    setDrafts(list);
    setSaved(false);
  };

  const save = () => {
    if (drafts.length === 0) return;
    const name = listName.trim() || `导入词单 ${new Date().toLocaleDateString('zh-CN')}`;
    const ts = Date.now();
    const words: Word[] = drafts.map((d, i) => {
      const chars: CharInfo[] = Array.from(d.char).map(c => ({
        c,
        pinyin: pinyin(c, { toneType: 'symbol', type: 'string' }),
      }));
      return {
        id: `custom-${ts}-${i}`,
        char: d.char,
        pinyin: d.pinyin,
        meaning: '',
        semester: '下',
        unit: 99,
        unitTitle: '我的导入',
        lesson: name,
        type: d.char.length >= 4 ? 'idiom' : 'word',
        examples: [],
        sentence: '',
        tip: '把这个词拆成单个字记，再用它造个句子。',
        chars,
        custom: true,
      };
    });
    addCustomWords(words);
    setSaved(true);
    setRaw('');
    setDrafts([]);
    setListName('');
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
          导入词单
        </h1>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
          这个 App 内置的是<b>世外小学国际部 P2 · 二下第五单元</b>（按 WFL 默写卷逐词核对，带科学记忆拆解）。
          其他单元 / 其他学校的词单，把词语贴进来就能练 — 拼音会自动生成（<b>多音字请检查一下</b>）。
        </p>

        {saved && (
          <div
            className="mb-5 p-3 rounded-lg text-sm"
            style={{ background: 'rgba(45,138,111,0.12)', color: 'var(--color-jade)' }}
          >
            ✓ 已保存！可以去「听写」或「复习」里练这份词单了。
          </div>
        )}

        {/* 输入 */}
        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={listName}
            onChange={e => setListName(e.target.value)}
            placeholder="给这份词单起个名字（如：二下第六单元）"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent outline-none"
            style={{ borderColor: 'var(--color-stone-dark)' }}
          />
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            rows={6}
            placeholder="把词语贴进来，用空格、逗号或换行分开。例如：&#10;雷雨　乌云　闪电　窗户　彩虹"
            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none resize-y"
            style={{ borderColor: 'var(--color-stone-dark)', fontFamily: 'var(--font-serif-cn)' }}
          />
          <button
            onClick={parse}
            disabled={!raw.trim()}
            className="px-5 py-2.5 rounded-md font-medium disabled:opacity-40"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            生成拼音 →
          </button>
        </div>

        {/* 预览 + 编辑 */}
        {drafts.length > 0 && (
          <div className="mb-6">
            <div className="text-sm mb-2" style={{ color: 'var(--color-ink-soft)' }}>
            共 {drafts.length} 个词 · 检查并修正拼音（多音字尤其注意）
            </div>
            <div className="space-y-2">
              {drafts.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg border"
                  style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
                >
                  <span className="text-xl font-bold w-24 flex-shrink-0" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                    {d.char}
                  </span>
                  <input
                    type="text"
                    value={d.pinyin}
                    onChange={e => {
                      const v = e.target.value;
                      setDrafts(ds => ds.map((x, j) => (j === i ? { ...x, pinyin: v } : x)));
                    }}
                    className="flex-1 border-b bg-transparent text-sm py-1 outline-none"
                    style={{ borderColor: 'var(--color-stone-dark)', letterSpacing: '0.08em' }}
                  />
                  <button
                    onClick={() => setDrafts(ds => ds.filter((_, j) => j !== i))}
                    className="text-xs px-2 py-1"
                    style={{ color: 'var(--color-cinnabar)' }}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={save}
              className="mt-4 px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
            >
              保存这份词单（{drafts.length} 个词）
            </button>
          </div>
        )}

        {/* 已导入的词单 */}
        {customWords.length > 0 && (
          <div className="border-t pt-5" style={{ borderColor: 'var(--color-stone)' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold">已导入 {customWords.length} 个词</h2>
              <button
                onClick={() => { if (confirm('清空所有导入的词单？')) clearCustomWords(); }}
                className="text-xs underline"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                清空导入
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {customWords.map(w => (
                <span
                  key={w.id}
                  className="text-sm px-2.5 py-1 rounded"
                  style={{ background: 'var(--color-stone)', fontFamily: 'var(--font-serif-cn)' }}
                >
                  {w.char}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
