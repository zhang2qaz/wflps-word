'use client';

/**
 * 对答案 · 逐字点选写错的字
 * 把孩子手写的字（snapshot）和正确答案逐格并排显示，孩子点一下写错的格子。
 * 空着没写的格子会自动标红。全程纯本地，不联网、不接大模型。
 */

type Props = {
  target: string;                  // 正确答案文本
  empties?: boolean[];             // 每格是否空着（自动标红）
  shots?: (string | null)[];       // 孩子手写快照（本地 PNG dataURL）
  wrong: Set<number>;              // 当前被标错的格子下标
  onToggle: (i: number) => void;   // 点选/取消某一格
  readOnly?: boolean;              // 只读：用于回看（不可点选、无操作提示）
};

export default function AnswerCheck({ target, empties = [], shots = [], wrong, onToggle, readOnly = false }: Props) {
  const chars = Array.from(target);

  return (
    <div>
      {!readOnly && (
        <>
          <div className="text-xs text-center mb-1" style={{ color: 'var(--color-vermilion)' }}>
            把<b>你写的</b>和<b>正确答案</b>逐格对照
          </div>
          <div className="text-xs text-center mb-3" style={{ color: 'var(--color-ink-soft)' }}>
            点一下写错的字（写歪了、多笔少笔都算错）· 空着没写的已自动标红
          </div>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-1.5">
        {chars.map((c, i) => {
          const isEmpty = empties[i];
          const isWrong = wrong.has(i);
          const shot = shots[i];
          return (
            <button
              key={i}
              type="button"
              onClick={readOnly ? undefined : () => onToggle(i)}
              className="relative flex flex-col items-center rounded-lg overflow-hidden"
              style={{
                width: 58,
                border: `2px solid ${isWrong ? 'var(--color-cinnabar)' : 'var(--color-stone-dark)'}`,
                background: isWrong ? 'rgba(212,73,61,0.08)' : 'var(--color-paper)',
              }}
            >
              {/* 上：孩子写的 */}
              <div
                className="w-full flex items-center justify-center"
                style={{
                  height: 50,
                  borderBottom: '1px dashed var(--color-stone-dark)',
                  background: '#fff',
                }}
              >
                {isEmpty || !shot ? (
                  <span className="text-[11px] font-medium" style={{ color: 'var(--color-cinnabar)' }}>
                    没写
                  </span>
                ) : (
                  // 孩子自己的手写图，纯本地展示；禁止长按弹出图片菜单
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shot}
                    alt="你写的"
                    draggable={false}
                    style={{
                      width: 46,
                      height: 46,
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                    }}
                  />
                )}
              </div>
              {/* 下：正确答案 */}
              <div
                className="w-full flex items-center justify-center"
                style={{
                  height: 42,
                  fontFamily: 'var(--font-serif-cn)',
                  fontSize: 26,
                  fontWeight: 700,
                  color: isWrong ? 'var(--color-cinnabar)' : 'var(--color-ink)',
                }}
              >
                {c}
              </div>
              {isWrong && (
                <span
                  className="absolute top-0 right-0 text-[10px] leading-none px-1 py-0.5 rounded-bl"
                  style={{ background: 'var(--color-cinnabar)', color: 'var(--color-paper)' }}
                >
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-2 text-[11px]" style={{ color: 'var(--color-ink-soft)' }}>
        <span>↑ 上格：你写的</span>
        <span>↓ 下格：正确的字</span>
      </div>
    </div>
  );
}
