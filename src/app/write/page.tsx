'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import VoiceInput from '@/components/VoiceInput';
import { haptic } from '@/lib/haptic';
import { useEssays, randomPrompt, reviewFor, statsOf, type Essay } from '@/lib/essays';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

const GRADE_CHAR = ['', '一', '二', '三', '四', '五', '六'];

// 作文本 —— 完全离线,无 API。
// · 写作时自动存草稿(关掉网页不丢)
// · 完成后走自检清单 → 存进本机作文本
// · 提供按年级随机抽题、字数/不重复字数/标点数 本地统计
// · 历史作文按日期排列,可以回看 / 删除

type View = 'write' | 'review' | 'archive';

export default function WritePage() {
  const { essays, draft, saveDraft, saveEssay, deleteEssay } = useEssays(
    useShallow((s) => ({
      essays: s.essays,
      draft: s.draft,
      saveDraft: s.saveDraft,
      saveEssay: s.saveEssay,
      deleteEssay: s.deleteEssay,
    })),
  );

  const selectedBook = useStore(s => s.selectedBook);
  const [view, setView] = useState<View>('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [interimVoice, setInterimVoice] = useState('');     // 语音说话中的实时显示
  // 年级锁定到首页选的课本 —— 不再让用户在写作页里挑别的年级
  const grade = selectedBook?.grade ?? 2;
  const [prompt, setPrompt] = useState<string | null>(null);
  const [reviewChecks, setReviewChecks] = useState<boolean[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 挂载时载入草稿(只复原标题 + 内容,不再吃旧草稿里的 grade)
  useEffect(() => {
    setMounted(true);
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动存草稿(防抖)
  useEffect(() => {
    if (!mounted) return;
    if (!title && !content) { saveDraft(null); return; }
    const t = setTimeout(() => saveDraft({ title, content, grade }), 500);
    return () => clearTimeout(t);
  }, [title, content, grade, mounted, saveDraft]);

  const stats = statsOf(content);
  const canFinish = stats.chars >= 20;

  // ───── 写作视图 ─────
  if (view === 'write') {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-2xl mx-auto px-5 pt-8 pb-10">
          <header className="mb-6 flex items-baseline justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}>
                作文本
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                自由写 · 自动存草稿 · 写完自检
              </p>
            </div>
            {essays.length > 0 && (
              <button onClick={() => setView('archive')} className="text-sm" style={{ color: 'var(--color-vermilion)' }}>
                以前的 {essays.length} 篇 →
              </button>
            )}
          </header>

          {/* 当前年级标签(只读) + 来一个题目 */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)', color: 'var(--color-ink-soft)' }}
            >
              {GRADE_CHAR[grade] ?? grade} 年级 · 适配你选的课本
            </span>
            <button
              onClick={() => { haptic.tap(); setPrompt(randomPrompt(grade)); }}
              className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--color-mustard) 18%, transparent)', color: 'var(--color-mustard)' }}
            >
              🎲 来个题目
            </button>
          </div>

          {prompt && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="card p-4 mb-3 flex items-center gap-3"
              style={{ background: 'color-mix(in srgb, var(--color-mustard) 8%, var(--color-paper-warm))' }}
            >
              <span className="text-xl">📝</span>
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-mustard)' }}>今天的题目</div>
                <div className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-serif-cn)' }}>{prompt}</div>
              </div>
              <button onClick={() => { setTitle(prompt); haptic.tap(); }} className="text-xs underline" style={{ color: 'var(--color-vermilion)' }}>用这个标题</button>
              <button onClick={() => setPrompt(null)} className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>✕</button>
            </motion.div>
          )}

          {/* 输入区 */}
          <div className="card p-5">
            <input
              type="text"
              placeholder="作文标题(可空)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold mb-3 outline-none bg-transparent"
              style={{ fontFamily: 'var(--font-serif-cn)' }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写吧... 自动保存,关掉浏览器再回来也不会丢。"
              rows={14}
              className="w-full text-[15px] leading-relaxed outline-none resize-y bg-transparent"
              style={{ fontFamily: 'var(--font-serif-cn)', minHeight: 280 }}
            />
            {/* 语音中间结果显示 */}
            {interimVoice && (
              <div
                className="mt-2 text-[14px] italic"
                style={{
                  color: 'var(--color-ink-soft)',
                  fontFamily: 'var(--font-serif-cn)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'color-mix(in srgb, var(--color-vermilion) 6%, transparent)',
                }}
              >
                🎙️ {interimVoice}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 mt-3 pt-3"
              style={{ borderTop: '0.5px solid color-mix(in srgb, var(--color-ink) 10%, transparent)' }}
            >
              <VoiceInput
                size="sm"
                onText={(t) => { setContent((c) => c + t); setInterimVoice(''); }}
                onInterim={(t) => setInterimVoice(t)}
              />
              <div className="flex gap-3 text-xs tabular-nums" style={{ color: 'var(--color-ink-soft)' }}>
                <span>字数 <b style={{ color: 'var(--color-ink)' }}>{stats.chars}</b></span>
                <span>不重复 <b style={{ color: 'var(--color-vermilion)' }}>{stats.unique}</b></span>
                <span>标点 <b style={{ color: 'var(--color-jade)' }}>{stats.punctuation}</b></span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => {
                if (!canFinish) { haptic.error(); return; }
                haptic.submit();
                setReviewChecks(reviewFor(grade).map(() => false));
                setView('review');
              }}
              disabled={!canFinish}
              className="btn btn-primary btn-lg flex-1 disabled:opacity-50"
            >
              {canFinish ? '写完了,自检一下 →' : `还差 ${20 - stats.chars} 字`}
            </button>
            {(title || content) && (
              <button
                onClick={() => {
                  if (window.confirm('清空当前草稿,从头写?')) {
                    setTitle(''); setContent(''); setPrompt(null); saveDraft(null);
                    haptic.tap();
                  }
                }}
                className="btn btn-secondary"
              >
                清空
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ───── 自检视图 ─────
  if (view === 'review') {
    const checklist = reviewFor(grade);
    const allDone = reviewChecks.every(Boolean);
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="max-w-md mx-auto px-5 pt-8 pb-10">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display-sans)' }}>
              自检一遍
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>
              交之前自己读一遍,把这些都过一过
            </p>
          </header>

          <div className="ios-list mb-5">
            {checklist.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setReviewChecks((arr) => arr.map((v, j) => j === i ? !v : v));
                  haptic.tap();
                }}
                className="ios-row text-left w-full"
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center text-white"
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: reviewChecks[i] ? 'var(--color-jade)' : 'color-mix(in srgb, var(--color-ink) 8%, transparent)',
                    color: reviewChecks[i] ? '#fff' : 'var(--color-ink-soft)',
                    fontSize: 16, fontWeight: 700,
                  }}
                >
                  {reviewChecks[i] ? '✓' : ''}
                </div>
                <span className="flex-1 text-[15px]" style={{ color: reviewChecks[i] ? 'var(--color-ink-soft)' : 'var(--color-ink)', textDecoration: reviewChecks[i] ? 'line-through' : undefined }}>
                  {q}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setView('write')} className="btn btn-secondary">
              ← 回去改改
            </button>
            <button
              onClick={() => {
                const id = saveEssay({
                  grade, title: title || '(无标题)', content,
                  wordCount: stats.chars, uniqueChars: stats.unique,
                  selfReviewDone: allDone,
                });
                haptic.success();
                setSavedId(id);
                setTitle(''); setContent(''); setPrompt(null);
                setReviewChecks([]);
                setView('archive');
              }}
              className="btn btn-primary btn-lg flex-1"
            >
              {allDone ? '都自检过了,存进作文本 →' : '直接存 →'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ───── 作文本视图 ─────
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 pt-8 pb-10">
        <header className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}>
              我的作文本
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
              {essays.length} 篇 · 本机保存,不联网
            </p>
          </div>
          <button onClick={() => setView('write')} className="btn btn-primary">+ 写新的</button>
        </header>

        {essays.length === 0 ? (
          <div className="card p-8 text-center" style={{ color: 'var(--color-ink-soft)' }}>
            还没存过作文。点上面「写新的」开始。
          </div>
        ) : (
          <div className="space-y-3">
            {essays.map((e) => (
              <EssayCard key={e.id} essay={e} highlighted={e.id === savedId} onDelete={() => {
                if (window.confirm(`删掉「${e.title}」?这个动作不能撤销。`)) deleteEssay(e.id);
              }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EssayCard({ essay, highlighted, onDelete }: { essay: Essay; highlighted: boolean; onDelete: () => void }) {
  const [open, setOpen] = useState(highlighted);
  return (
    <motion.div
      initial={highlighted ? { scale: 0.98, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="card p-4"
      style={highlighted ? { boxShadow: 'var(--shadow-lg), 0 0 0 2px var(--color-vermilion)' } : undefined}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-ink-soft)' }}>{essay.date}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--color-vermilion) 10%, transparent)', color: 'var(--color-vermilion)' }}>
          {essay.grade} 年级
        </span>
        {essay.selfReviewDone && (
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--color-jade) 14%, transparent)', color: 'var(--color-jade)' }}>
            ✓ 自检过
          </span>
        )}
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="block w-full text-left"
      >
        <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
          {essay.title}
        </h3>
        <p className="text-[13px] line-clamp-2" style={{ color: 'var(--color-ink-soft)' }}>
          {essay.content.slice(0, 100)}{essay.content.length > 100 ? '...' : ''}
        </p>
        <div className="text-[11px] mt-1.5 tabular-nums" style={{ color: 'var(--color-ink-soft)' }}>
          {essay.wordCount} 字 · 用了 {essay.uniqueChars} 个不重复字
        </div>
      </button>
      {open && (
        <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid color-mix(in srgb, var(--color-ink) 10%, transparent)' }}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            {essay.content}
          </p>
          <div className="mt-3 flex justify-end">
            <button onClick={onDelete} className="text-xs" style={{ color: 'var(--color-cinnabar)' }}>删除</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
