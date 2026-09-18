import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  // OCR 引擎 / 字库是固定大文件:长缓存 immutable,让「预下载(带进度)→ 识别引擎再取」命中 HTTP 缓存,
  // 不重复下载;首次以后彻底免下。
  async headers() {
    return [
      {
        source: '/ocr/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
