'use client';

import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptic';

// 语音转文字 —— Web Speech API ASR(浏览器自带,无 API key,完全前端)
// iOS Safari 14.5+ / Chrome / Edge 都支持中文识别。
// 用法:
//   <VoiceInput onText={(t) => setText(prev => prev + t)} />
// onText 回调返回「这次识别到的最终文本片段」,使用方自己决定追加还是替换。

type SRType = { new (): SR };
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (e: SREvent) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SREvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type Props = {
  onText: (text: string) => void;
  onInterim?: (text: string) => void;  // 实时显示中间结果(说话中)
  lang?: string;                         // 默认 zh-CN
  size?: 'sm' | 'md' | 'lg';
  label?: string;                        // 按钮文字,默认仅图标
};

export default function VoiceInput({
  onText, onInterim, lang = 'zh-CN', size = 'md', label,
}: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    const w = window as unknown as { webkitSpeechRecognition?: SRType; SpeechRecognition?: SRType };
    const SR: SRType | undefined = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const start = () => {
    setError(null);
    const w = window as unknown as { webkitSpeechRecognition?: SRType; SpeechRecognition?: SRType };
    const SR: SRType | undefined = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interimChunk += r[0].transcript;
      }
      if (finalChunk) {
        onText(finalChunk);
        haptic.tap();
      }
      if (interimChunk && onInterim) onInterim(interimChunk);
    };

    rec.onerror = (e) => {
      const msg = e.error === 'not-allowed'
        ? '麦克风权限被拒,去浏览器设置开一下'
        : e.error === 'no-speech'
        ? '没听到声音,再说一次'
        : `识别出错:${e.error}`;
      setError(msg);
      setListening(false);
    };

    rec.onend = () => setListening(false);

    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
      haptic.submit();
    } catch (e) {
      setError(`启动失败:${(e as Error).message}`);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setListening(false);
    haptic.tap();
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        className="opacity-40 inline-flex items-center gap-1.5 text-sm"
        title="这个浏览器不支持语音识别"
      >
        🎙️ 不支持
      </button>
    );
  }

  const sizeCls = size === 'sm' ? 'text-sm px-3 py-1.5' : size === 'lg' ? 'text-base px-5 py-2.5' : 'text-sm px-4 py-2';

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeCls}`}
        style={{
          background: listening ? 'var(--color-cinnabar)' : 'color-mix(in srgb, var(--color-vermilion) 14%, transparent)',
          color: listening ? '#ffffff' : 'var(--color-vermilion)',
          boxShadow: listening ? '0 0 0 4px color-mix(in srgb, var(--color-cinnabar) 25%, transparent)' : undefined,
        }}
        aria-label={listening ? '停止录音' : '开始语音输入'}
      >
        <span className={listening ? 'animate-pulse' : ''}>🎙️</span>
        {label ?? (listening ? '说话中... 点停' : '语音输入')}
      </button>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-cinnabar)' }}>{error}</p>
      )}
    </div>
  );
}
