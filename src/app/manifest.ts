import type { MetadataRoute } from 'next';

// PWA 清单:孩子在 iPad「加到主屏」后,会得到接近原生的全屏体验。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '世外默写本',
    short_name: '默写本',
    description: '上海世外 WFLPS · 中文词语默写科学记忆 App',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#fafbfd',
    theme_color: '#21348c',
    lang: 'zh-CN',
    categories: ['education'],
    icons: [
      // SVG 在浏览器 / 现代 Android Chrome 都支持,可缩放无锯齿
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      // iOS 主屏使用 apple-icon 路由生成的 180×180 PNG(由 src/app/apple-icon.tsx 提供)
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
