'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { haptic } from '@/lib/haptic';
import { createRecognizer, isModelCached } from '@/lib/voice';
import { useEssays, statsOf } from '@/lib/essays';
import { useStore } from '@/lib/store';

const GRADE_CHAR = ['', '一', '二', '三', '四', '五', '六'];

// 语音作文 —— 专为「不会打字 / 不想打字」的孩子设计:
// · 大麦克风 + 实时显示中间结果
// · 一句话一句话变成正文,可手动编辑
// · 完全离线(Vosk WASM)

type Phase = 'idle' | 'loading' | 'listening' | 'error';

export default function VoiceWritePage() {
  const router = useRouter();
  const saveEssay = useEssays((s) => s.saveEssay);
  const [phase, setPhase] = useState<Phase>('idle');
  const [firstUse, setFirstUse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState('');
  const [text, setText] = useState('');
  const selectedBook = useStore(s => s.selectedBook);
  const grade = selectedBook?.grade ?? 2;
  const [savedToast, setSavedToast] = useState(false);
  const recRef = useRef<{ start: () => Promise<void>; stop: () => void } | null>(null);
  const lastFinalRef = useRef('');

  useEffect(() => {
    isModelCached().then((c) => setFirstUse(!c));
  }, []);

  const start = async () => {
    setError(null);
    setPhase('loading');
    haptic.submit();
    try {
      const rec = await createRecognizer({
        onPartial: (t) => setInterim(t),
        onFinal: (t) => {
          if (t && t !== lastFinalRef.current) {
            lastFinalRef.current = t;
            // 智能加标点:如果上一句结尾不是标点,且这段不以标点开头,
            // 默认加个逗号(让长段口语更通顺)
            setText((cur) => {
              const last = cur.slice(-1);
              const sep = !cur || /[,。!?;:、 \n]/.test(last) ? '' : ',';
              return cur + sep + t;
            });
            setInterim('');
            haptic.tap();
          }
        },
      });
      await rec.start();
      recRef.current = rec;
      setPhase('listening');
      setFirstUse(false);
    } catch (e) {
      const msg = (e as Error).message || '出错';
      setError(
        /Permission|denied|NotAllowed/i.test(msg)
          ? '麦克风权限被拒,去浏览器设置打开'
          : /model|fetch|Failed/i.test(msg)
            ? '模型还没装好,刷新页面再试'
            : `启动失败:${msg}`,
      );
      setPhase('error');
      haptic.error();
    }
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
    setPhase('idle');
    setInterim('');
    haptic.tap();
  };

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const save = () => {
    if (text.length < 10) {
      haptic.error();
      return;
    }
    const s = statsOf(text);
    saveEssay({
      grade,
      title: '语音作文 · ' + text.slice(0, 12) + (text.length > 12 ? '…' : ''),
      content: text,
      wordCount: s.chars,
      uniqueChars: s.unique,
      selfReviewDone: false,
    });
    haptic.success();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
    setText('');
    setInterim('');
    lastFinalRef.current = '';
  };

  const sendToWrite = () => {
    // 把当前文字塞进 essays 草稿,跳到作文页继续编辑
    useEssays.getState().saveDraft({ title: '', content: text, grade });
    router.push('/write');
  };

  const stats = statsOf(text);
  const listening = phase === 'listening';
  const loading = phase === 'loading';

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-md mx-auto px-5 pt-8 pb-10">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}>
            语音作文
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>
            张嘴说,自动变文字 · 完全离线
          </p>
        </header>

        {/* 大麦克风 */}
        <div className="flex flex-col items-center mb-6">
          <motion.button
            onClick={listening ? stop : start}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center rounded-full select-none"
            style={{
              width: 140, height: 140,
              background: listening
                ? 'var(--color-cinnabar)'
                : 'linear-gradient(135deg, var(--color-vermilion) 0%, #2e4ab8 100%)',
              boxShadow: listening
                ? '0 0 0 0 color-mix(in srgb, var(--color-cinnabar) 50%, transparent), var(--shadow-lg)'
                : 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontSize: 56,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
            animate={listening ? {
              boxShadow: [
                '0 0 0 0 color-mix(in srgb, var(--color-cinnabar) 50%, transparent), var(--shadow-lg)',
                '0 0 0 24px color-mix(in srgb, var(--color-cinnabar) 0%, transparent), var(--shadow-lg)',
              ],
            } : {}}
            transition={listening ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' } : {}}
            aria-label={listening ? '停止录音' : '开始录音'}
          >
            🎙️
          </motion.button>

          <div className="mt-4 h-6 text-sm text-center">
            {phase === 'idle' && (
              <span style={{ color: 'var(--color-ink-soft)' }}>
                {firstUse ? '首次需联网下载模型 · 之后纯离线' : '点麦克风开始'}
              </span>
            )}
            {loading && (
              <span style={{ color: 'var(--color-ink-soft)' }}>
                {firstUse ? '加载模型...(首次约 32 MB)' : '准备中...'}
              </span>
            )}
            {listening && (
              <span style={{ color: 'var(--color-cinnabar)' }} className="animate-pulse">
                听着呢,说吧...
              </span>
            )}
            {error && <span style={{ color: 'var(--color-cinnabar)' }}>{error}</span>}
          </div>
        </div>

        {/* 实时中间结果 */}
        <AnimatePresence>
          {interim && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg mb-3 italic px-4 py-2 rounded-lg"
              style={{
                color: 'var(--color-ink-soft)',
                fontFamily: 'var(--font-serif-cn)',
                background: 'color-mix(in srgb, var(--color-vermilion) 6%, transparent)',
              }}
            >
              {interim}…
            </motion.div>
          )}
        </AnimatePresence>

        {/* 已识别文字(可编辑) */}
        <div className="card p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={listening ? '识别结果会出现在这里...' : '点上面麦克风开始,或直接打字'}
            rows={10}
            className="w-full text-[15px] leading-relaxed outline-none resize-y bg-transparent"
            style={{ fontFamily: 'var(--font-serif-cn)', minHeight: 200 }}
          />
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 text-xs tabular-nums"
            style={{ color: 'var(--color-ink-soft)', borderTop: '0.5px solid color-mix(in srgb, var(--color-ink) 10%, transparent)' }}
          >
            <span
              className="px-2 py-1 rounded text-[12px]"
              style={{ background: 'color-mix(in srgb, var(--color-ink) 5%, transparent)' }}
            >
              {GRADE_CHAR[grade] ?? grade} 年级
            </span>
            <div className="flex gap-3">
              <span>字数 <b style={{ color: 'var(--color-ink)' }}>{stats.chars}</b></span>
              <span>不重复 <b style={{ color: 'var(--color-vermilion)' }}>{stats.unique}</b></span>
            </div>
          </div>
        </div>

        {/* 动作 */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => { setText(''); setInterim(''); lastFinalRef.current = ''; haptic.tap(); }}
            disabled={!text}
            className="btn btn-secondary disabled:opacity-40"
          >
            清空
          </button>
          <button
            onClick={sendToWrite}
            disabled={text.length < 10}
            className="btn btn-secondary disabled:opacity-40"
          >
            转去作文本编辑
          </button>
          <button
            onClick={save}
            disabled={text.length < 10}
            className="btn btn-primary btn-lg flex-1 disabled:opacity-50"
          >
            存进作文本 →
          </button>
        </div>

        {/* Saved toast */}
        <AnimatePresence>
          {savedToast && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--color-jade)', color: '#fff', boxShadow: 'var(--shadow-lg)' }}
            >
              ✓ 已存进作文本
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
