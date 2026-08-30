'use client';

// 页面级错误兜底 —— 把真实报错显示出来,方便远程排查
// (默认的「Application error」白屏什么信息都不给)。

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-5xl">🙈</div>
        <h1 className="text-xl font-bold">页面出错了</h1>
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          把下面这段红字拍照或抄给爸爸，就能修好：
        </p>
        <pre
          className="text-left text-xs p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap break-all"
          style={{ background: 'rgba(212,73,61,0.08)', color: 'var(--color-cinnabar)' }}
        >
          {String(error?.message || error)}
          {error?.digest ? `\n\ndigest: ${error.digest}` : ''}
          {error?.stack ? `\n\n${error.stack.split('\n').slice(0, 4).join('\n')}` : ''}
        </pre>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--color-vermilion)', color: '#fff' }}
          >
            重试
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: 'var(--color-stone-dark)' }}
          >
            回首页
          </button>
        </div>
      </div>
    </div>
  );
}
