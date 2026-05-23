import { ImageResponse } from 'next/og';

// iOS 主屏图标 —— iOS 必须吃 PNG,所以这里用 ImageResponse 渲染。
// 设计:WFLPS 红蓝双色底 + 大白「默」字,识别度比校徽全图高。

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// 从 Google Fonts 拉一份只含「默」字的 Noto Serif SC 子集
// (整字体几 MB,只取这一个字几 KB —— 构建时拉一次就缓存)
async function loadFont(): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&text=${encodeURIComponent('默')}`;
  const css = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NextJS-Icon/1.0)' },
  }).then((r) => r.text());
  const fontUrl = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('未从 Google Fonts CSS 里解析到字体 URL');
  return fetch(fontUrl).then((r) => r.arrayBuffer());
}

export default async function AppleIcon() {
  const fontData = await loadFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#21348c',
          color: '#ffffff',
        }}
      >
        {/* 顶部 WFLPS 红横幅 */}
        <div style={{ height: 54, background: '#e3242b', display: 'flex' }} />
        {/* 下方主区:大「默」字 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Noto Serif SC',
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          默
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Noto Serif SC', data: fontData, weight: 700, style: 'normal' },
      ],
    },
  );
}
