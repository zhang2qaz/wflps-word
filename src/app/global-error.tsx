'use client';

// 根级错误兜底(连 layout 都崩时) —— 同样显示真实报错。
// 注意:global-error 必须自带 <html><body>。

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafbfd', color: '#1a2030' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🙈</div>
            <h1 style={{ fontSize: 20, margin: '12px 0' }}>页面出错了</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
              把下面这段红字拍照或抄给爸爸，就能修好：
            </p>
            <pre
              style={{
                textAlign: 'left', fontSize: 11, padding: 12, borderRadius: 10,
                background: 'rgba(212,73,61,0.08)', color: '#c0392b',
                overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}
            >
              {String(error?.message || error)}
              {error?.digest ? `\n\ndigest: ${error.digest}` : ''}
              {error?.stack ? `\n\n${error.stack.split('\n').slice(0, 4).join('\n')}` : ''}
            </pre>
            <button
              onClick={reset}
              style={{
                marginTop: 12, padding: '10px 22px', borderRadius: 12, border: 'none',
                background: '#d4493d', color: '#fff', fontSize: 14, fontWeight: 500,
              }}
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
