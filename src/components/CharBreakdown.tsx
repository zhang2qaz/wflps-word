'use client';

import { motion } from 'framer-motion';
import { type CharInfo } from '@/data/vocabulary';
import { speak } from '@/lib/tts';

const KIND_INFO: Record<string, { label: string; desc: string; color: string }> = {
  形声: { label: '形声字', desc: '一半表意思、一半表读音', color: 'var(--color-jade)' },
  会意: { label: '会意字', desc: '几个部件合起来表示意思', color: 'var(--color-mustard)' },
  象形: { label: '象形字', desc: '像实物的样子画出来', color: 'var(--color-cinnabar)' },
  指事: { label: '指事字', desc: '用记号指出意思', color: 'var(--color-vermilion)' },
  独体: { label: '独体字', desc: '不能再拆成部件', color: 'var(--color-ink-soft)' },
};

export default function CharBreakdown({ info, index }: { info: CharInfo; index: number }) {
  const kind = info.kind ? KIND_INFO[info.kind] : null;
  const parts = (info.split ?? '').split(/\s*\+\s*/).filter(p => p && p !== '独体字');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border rounded-xl overflow-hidden"
      style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
    >
      {/* 顶部：字 + 拼音 + 造字法 */}
      <div
        className="flex items-center gap-4 p-4"
        style={{ background: 'var(--color-paper-warm)' }}
      >
        <button
          onClick={() => speak(info.c)}
          className="text-5xl font-bold leading-none flex-shrink-0 hover:scale-105 transition-transform"
          style={{ fontFamily: 'var(--font-display, var(--font-serif-cn))' }}
          title="点击发音"
        >
          {info.c}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm mb-1" style={{ color: 'var(--color-ink-soft)', letterSpacing: '0.1em' }}>
            {info.pinyin}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {kind && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: kind.color, color: 'var(--color-paper)' }}
              >
                {kind.label}
              </span>
            )}
            {info.radical && (
              <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                部首 {info.radical}
              </span>
            )}
            {info.strokes != null && (
              <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                {info.strokes} 画
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* 拆解：部件 */}
        {parts.length > 0 && (
          <div>
            <div className="text-[11px] tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
              拆开看
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {parts.map((p, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span style={{ color: 'var(--color-stone-dark)' }}>+</span>}
                  <span
                    className="text-2xl font-bold px-3 py-1.5 rounded-lg"
                    style={{
                      fontFamily: 'var(--font-serif-cn)',
                      background: 'var(--color-stone)',
                      color: 'var(--color-ink)',
                    }}
                  >
                    {p}
                  </span>
                </span>
              ))}
              <span style={{ color: 'var(--color-stone-dark)' }}>=</span>
              <span
                className="text-2xl font-bold px-3 py-1.5 rounded-lg"
                style={{ fontFamily: 'var(--font-serif-cn)', background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                {info.c}
              </span>
            </div>
          </div>
        )}

        {/* 记忆联想 hook */}
        {info.hook && (
          <div className="flex gap-2 text-sm leading-relaxed">
            <span className="flex-shrink-0">💡</span>
            <span>{info.hook}</span>
          </div>
        )}

        {/* 字族 */}
        {info.family && (
          <div
            className="flex gap-2 text-sm leading-relaxed p-2.5 rounded-lg"
            style={{ background: 'rgba(45,138,111,0.08)' }}
          >
            <span className="flex-shrink-0">🧩</span>
            <span><b style={{ color: 'var(--color-jade)' }}>字族 · 学一个会一串：</b>{info.family}</span>
          </div>
        )}

        {/* 易混字提醒 */}
        {info.warn && (
          <div
            className="flex gap-2 text-sm leading-relaxed p-2.5 rounded-lg"
            style={{ background: 'rgba(212,73,61,0.08)' }}
          >
            <span className="flex-shrink-0">⚠️</span>
            <span><b style={{ color: 'var(--color-cinnabar)' }}>小心写错：</b>{info.warn}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
