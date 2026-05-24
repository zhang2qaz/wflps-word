'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import VoiceInput from '@/components/VoiceInput';
import { haptic } from '@/lib/haptic';

type GradeResult = {
  score: number;
  level: '优秀' | '良好' | '中等' | '待改进';
  overall: string;
  errors: { text: string; type: string; suggest: string }[];
  highlights: { text: string; praise: string }[];
  suggestions: string[];
  wordCount: number;
};

const LEVEL_COLOR: Record<GradeResult['level'], string> = {
  优秀: 'var(--color-jade)',
  良好: 'var(--color-vermilion)',
  中等: 'var(--color-mustard)',
  待改进: 'var(--color-cinnabar)',
};

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [interim, setInterim] = useState('');     // 语音说话中的实时显示
  const [grade, setGrade] = useState(3);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [err, setErr] = useState('');

  const count = [...content].length;

  const submit = async () => {
    if (count < 20) { setErr('作文太短啦,至少写 20 个字'); return; }
    setErr(''); setBusy(true); setResult(null);
    haptic.submit();
    try {
      const res = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, content, grade }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? `批改失败:${res.status}`);
        haptic.error();
      } else {
        setResult(data);
        haptic.success();
      }
    } catch (e) {
      setErr(`网络错:${(e as Error).message}`);
      haptic.error();
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setResult(null); setErr(''); };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-5 pt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}>
            AI 作文批改
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            写完(或说完)就交,几秒拿到老师式点评。
          </p>
        </header>

        {!result ? (
          <>
            {/* 输入区 */}
            <div className="card p-5 mb-4">
              <input
                type="text"
                placeholder="作文标题(可空)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-bold mb-3 outline-none bg-transparent"
                style={{ fontFamily: 'var(--font-serif-cn)' }}
              />
              <div className="relative">
                <textarea
                  value={content + (interim ? `[${interim}]` : '')}
                  onChange={(e) => {
                    setInterim('');
                    setContent(e.target.value.replace(/\[.*?\]$/, ''));
                  }}
                  placeholder="把你想写的写在这里... 不会打字?点下面的「🎙️ 语音输入」直接说,自动转成文字。"
                  rows={12}
                  className="w-full text-[15px] leading-relaxed outline-none resize-y bg-transparent"
                  style={{ fontFamily: 'var(--font-serif-cn)', minHeight: 240 }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mt-2 pt-3 border-t" style={{ borderColor: 'color-mix(in srgb, var(--color-ink) 8%, transparent)' }}>
                <VoiceInput
                  size="sm"
                  onText={(t) => { setContent((c) => c + t); setInterim(''); }}
                  onInterim={(t) => setInterim(t)}
                />
                <span className="text-xs tabular-nums" style={{ color: 'var(--color-ink-soft)' }}>
                  {count} 字
                </span>
              </div>
            </div>

            {/* 年级 + 提交 */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>年级:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="px-3 py-2 rounded-lg outline-none"
                style={{ background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g} 年级</option>)}
              </select>
              <button
                onClick={submit}
                disabled={busy || count < 20}
                className="btn btn-primary btn-lg flex-1 disabled:opacity-50"
              >
                {busy ? '老师正在批改…' : '让 AI 老师批改 →'}
              </button>
            </div>

            {err && (
              <div className="card p-3 text-sm text-center" style={{ color: 'var(--color-cinnabar)' }}>
                {err}
              </div>
            )}

            {/* 说明 */}
            <details className="mt-6 ios-list">
              <summary className="ios-row cursor-pointer list-none">
                <div className="flex-shrink-0 flex items-center justify-center text-white"
                  style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-vermilion)', fontSize: 18 }} aria-hidden>?</div>
                <div className="flex-1 text-[15px] font-semibold">怎么用</div>
                <span style={{ color: 'var(--color-stone-dark)', fontSize: '1.4rem', lineHeight: 1 }}>›</span>
              </summary>
              <div className="px-5 py-4 text-[13px] leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                <p className="mb-2">· <b style={{ color: 'var(--color-ink)' }}>打字写</b> —— 直接在框里打。</p>
                <p className="mb-2">· <b style={{ color: 'var(--color-ink)' }}>语音说</b> —— 点 🎙️ 直接说,边说边变文字。iOS Safari / Chrome 都支持。</p>
                <p className="mb-2">· <b style={{ color: 'var(--color-ink)' }}>批改内容</b> —— AI 老师会指出错字、病句、标点问题,圈出写得好的句子,给整体评语和改进建议。</p>
                <p>· <b style={{ color: 'var(--color-ink)' }}>不打击孩子</b> —— prompt 已要求温和鼓励,不会给特别低分。</p>
              </div>
            </details>
          </>
        ) : (
          <ResultView result={result} title={title} onBack={reset} />
        )}
      </main>
    </div>
  );
}

function ResultView({ result, title, onBack }: { result: GradeResult; title: string; onBack: () => void }) {
  const color = LEVEL_COLOR[result.level];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* 顶部分数卡 */}
      <div className="card p-6 mb-4 text-center">
        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-ink-soft)' }}>
          {title || '我的作文'} · {result.wordCount} 字
        </div>
        <div className="flex items-baseline justify-center gap-3 my-2">
          <span className="text-6xl font-bold tabular-nums" style={{ color, fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.04em' }}>
            {result.score}
          </span>
          <span className="text-xl font-bold" style={{ color }}>分</span>
        </div>
        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-medium"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          {result.level}
        </div>
        <p className="text-[15px] mt-4 leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {result.overall}
        </p>
      </div>

      {/* 写得好的句子 */}
      {result.highlights.length > 0 && (
        <section className="mb-4">
          <h3 className="text-[13px] uppercase tracking-wider mb-2 ml-4" style={{ color: 'var(--color-jade)' }}>
            ✨ 写得真好
          </h3>
          <div className="card p-4 space-y-3">
            {result.highlights.map((h, i) => (
              <div key={i}>
                <p className="text-[15px] mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>「{h.text}」</p>
                <p className="text-[13px]" style={{ color: 'var(--color-jade)' }}>{h.praise}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 可改进的地方 */}
      {result.errors.length > 0 && (
        <section className="mb-4">
          <h3 className="text-[13px] uppercase tracking-wider mb-2 ml-4" style={{ color: 'var(--color-cinnabar)' }}>
            ✏️ 可以改改
          </h3>
          <div className="card p-4 space-y-3">
            {result.errors.map((e, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: 'color-mix(in srgb, var(--color-cinnabar) 14%, transparent)', color: 'var(--color-cinnabar)' }}>
                    {e.type}
                  </span>
                  <span className="text-[14px]" style={{ fontFamily: 'var(--font-serif-cn)', color: 'var(--color-ink)' }}>「{e.text}」</span>
                </div>
                <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>{e.suggest}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 整体建议 */}
      {result.suggestions.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[13px] uppercase tracking-wider mb-2 ml-4" style={{ color: 'var(--color-vermilion)' }}>
            💡 下次试试
          </h3>
          <div className="card p-4">
            <ol className="space-y-2 text-[14px] leading-relaxed list-decimal pl-5" style={{ color: 'var(--color-ink)' }}>
              {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        </section>
      )}

      <div className="flex justify-center">
        <button onClick={onBack} className="btn btn-secondary">← 再写一篇</button>
      </div>
    </motion.div>
  );
}
