'use client';

import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptic';

// 笔顺实时纠错 —— 基于 hanzi-writer 的 quiz 模式
// 孩子用手指 / Pencil 一笔一笔写,写错那一笔会闪红 + 触觉反馈,
// 写对每一笔变绿,全部写完给打分。
// 三家学习机都只做「事后批改」或「拖拽拼图」,这里是真正的实时纠错。

type HanziWriterType = typeof import('hanzi-writer').default;
type WriterInstance = ReturnType<HanziWriterType['create']>;

type Props = {
  char: string;
  size?: number;
  onComplete?: (summary: { totalMistakes: number; strokes: number }) => void;
};

export default function StrokeQuiz({ char, size = 220, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<WriterInstance | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMistakes(0);
    setCurrentStroke(0);
    setDone(false);
    setHint(null);
    setErr(false);

    (async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      try {
        const mod = await import('hanzi-writer');
        const HanziWriter = mod.default;
        const w = HanziWriter.create(containerRef.current, char, {
          width: size,
          height: size,
          padding: 8,
          showOutline: true,
          showCharacter: false,
          strokeColor: '#1c1c1e',
          outlineColor: '#cdd4e0',
          radicalColor: '#21348c',
          highlightColor: '#34a853',
          drawingColor: '#21348c',
          drawingWidth: 24,
          strokeFadeDuration: 200,
        });
        if (cancelled) return;
        writerRef.current = w;

        // hanzi-writer 数据里有 strokes 数组
        const data = (w as unknown as { _character?: { strokes: unknown[] } })._character;
        if (data?.strokes) setTotalStrokes(data.strokes.length);

        w.quiz({
          // 写错那一笔:闪红 + 触觉反馈
          onMistake: (sd) => {
            if (cancelled) return;
            setMistakes((m) => m + 1);
            haptic.error();
            setHint(`第 ${sd.strokeNum + 1} 笔写错啦,再来`);
            setTimeout(() => setHint(null), 1500);
          },
          // 写对:绿 + 推进
          onCorrectStroke: (sd) => {
            if (cancelled) return;
            setCurrentStroke(sd.strokeNum + 1);
            haptic.tap();
          },
          // 全部写完:打分
          onComplete: (summary) => {
            if (cancelled) return;
            setDone(true);
            haptic.success();
            onComplete?.({
              totalMistakes: summary.totalMistakes,
              strokes: totalStrokes,
            });
          },
          // 错 3 次自动给一个高亮提示
          showHintAfterMisses: 3,
          highlightOnComplete: true,
        });
      } catch {
        if (!cancelled) setErr(true);
      }
    })();

    return () => {
      cancelled = true;
      try { writerRef.current?.cancelQuiz?.(); } catch {}
      writerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, size]);

  const reset = () => {
    // 重写 —— 简单粗暴:重新 mount,触发 useEffect
    const c = containerRef.current;
    if (!c) return;
    setMistakes(0);
    setCurrentStroke(0);
    setDone(false);
    setHint(null);
    // 触发 useEffect 重做
    c.innerHTML = '';
    (async () => {
      const mod = await import('hanzi-writer');
      const w = mod.default.create(c, char, {
        width: size, height: size, padding: 8,
        showOutline: true, showCharacter: false,
        strokeColor: '#1c1c1e', outlineColor: '#cdd4e0',
        radicalColor: '#21348c', highlightColor: '#34a853',
        drawingColor: '#21348c', drawingWidth: 24,
      });
      writerRef.current = w;
      w.quiz({
        onMistake: (sd) => { setMistakes(m => m + 1); haptic.error(); setHint(`第 ${sd.strokeNum + 1} 笔再来`); setTimeout(()=>setHint(null), 1500); },
        onCorrectStroke: (sd) => { setCurrentStroke(sd.strokeNum + 1); haptic.tap(); },
        onComplete: (s) => { setDone(true); haptic.success(); onComplete?.({ totalMistakes: s.totalMistakes, strokes: totalStrokes }); },
        showHintAfterMisses: 3,
        highlightOnComplete: true,
      });
    })();
  };

  if (err) {
    return (
      <div className="card p-4 text-center" style={{ color: 'var(--color-ink-soft)' }}>
        无法加载笔顺数据,这个字暂时不支持笔顺练习。
      </div>
    );
  }

  const grade =
    !done ? null :
    mistakes === 0 ? '满分!一笔不错' :
    mistakes <= 2 ? `不错,${mistakes} 次小失误` :
    mistakes <= 5 ? '继续练,熟能生巧' :
    '再来一遍,会更好';

  return (
    <div className="text-center">
      {/* 进度 */}
      <div className="flex items-center justify-center gap-3 mb-3 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
        <span>第 <b style={{ color: 'var(--color-vermilion)' }}>{currentStroke}</b> / {totalStrokes || '?'} 笔</span>
        {mistakes > 0 && <span>· 错 <b style={{ color: 'var(--color-cinnabar)' }}>{mistakes}</b></span>}
      </div>

      {/* 字 */}
      <div className="mizige mx-auto" style={{ width: size, height: size }}>
        <div ref={containerRef} className="relative z-10" style={{ width: size, height: size }} />
      </div>

      {/* 提示 */}
      <div className="h-6 mt-3 text-sm" style={{ color: 'var(--color-cinnabar)' }}>
        {hint || (done && grade) || ' '}
      </div>

      {/* 完成 / 重写 */}
      {done && (
        <div className="mt-2 flex justify-center gap-2">
          <button onClick={reset} className="btn btn-secondary">↻ 再写一遍</button>
        </div>
      )}
    </div>
  );
}
