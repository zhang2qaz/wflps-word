'use client';

import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptic';
import { createRecognizer, isModelCached } from '@/lib/voice';

// 离线语音输入按钮 —— 基于 Vosk WASM
// · 首次点击:下载 42MB 中文模型(浏览器自动缓存)
// · 之后完全离线,不联网

type Props = {
  onText: (text: string) => void;
  onInterim?: (text: string) => void;
  size?: 'sm' | 'md' | 'lg';
};

type Phase = 'idle' | 'loading' | 'listening' | 'error';

export default function VoiceInput({ onText, onInterim, size = 'md' }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [firstUse, setFirstUse] = useState(false);   // 是否首次(没缓存)
  const recRef = useRef<{ start: () => Promise<void>; stop: () => void } | null>(null);
  const lastFinalRef = useRef<string>('');

  useEffect(() => {
    // 启动时探一下模型是否已缓存,提示首次下载提示语
    isModelCached().then((cached) => setFirstUse(!cached));
  }, []);

  const start = async () => {
    setError(null);
    setPhase('loading');
    haptic.submit();
    try {
      const rec = await createRecognizer({
        onPartial: (t) => {
          if (t && onInterim) onInterim(t);
        },
        onFinal: (t) => {
          // 防止 Vosk 偶尔重复推一次最终结果
          if (t && t !== lastFinalRef.current) {
            lastFinalRef.current = t;
            onText(t);
            haptic.tap();
            // 清掉中间显示
            onInterim?.('');
          }
        },
      });
      await rec.start();
      recRef.current = rec;
      setPhase('listening');
      setFirstUse(false);   // 已经下完了
    } catch (e) {
      const msg = (e as Error).message || '出错';
      setError(
        /Permission|denied|NotAllowed/i.test(msg)
          ? '麦克风权限被拒,去浏览器设置开一下'
          : /model|fetch|network|Failed to fetch/i.test(msg)
            ? '模型下载失败,检查首次连接是否能访问 CDN'
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
    haptic.tap();
  };

  // 卸载时一定要停
  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const sizeCls =
    size === 'sm' ? 'text-sm px-3 py-1.5' :
    size === 'lg' ? 'text-base px-5 py-2.5' :
    'text-sm px-4 py-2';

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={phase === 'listening' ? stop : start}
        disabled={phase === 'loading'}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeCls} disabled:opacity-60`}
        style={{
          background:
            phase === 'listening' ? 'var(--color-cinnabar)' :
            phase === 'loading'   ? 'color-mix(in srgb, var(--color-vermilion) 22%, transparent)' :
            'color-mix(in srgb, var(--color-vermilion) 14%, transparent)',
          color: phase === 'listening' ? '#ffffff' : 'var(--color-vermilion)',
          boxShadow: phase === 'listening'
            ? '0 0 0 4px color-mix(in srgb, var(--color-cinnabar) 25%, transparent)'
            : undefined,
        }}
        aria-label={phase === 'listening' ? '停止录音' : '开始语音输入'}
      >
        <span className={phase === 'listening' ? 'animate-pulse' : ''}>🎙️</span>
        {phase === 'listening' ? '说话中... 点停' :
         phase === 'loading' && firstUse ? '加载模型...(首次约 42MB)' :
         phase === 'loading' ? '准备中...' :
         '语音输入'}
      </button>

      {firstUse && phase === 'idle' && !error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          首次需联网下载语音模型(42MB),之后完全离线
        </p>
      )}
      {error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-cinnabar)' }}>{error}</p>
      )}
    </div>
  );
}
