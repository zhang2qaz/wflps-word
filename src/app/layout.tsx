import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "世外默写 · 上海世界外国语小学校本版",
  description: "上海市世界外国语小学（WFLPS）国际部 P2 校本定制 · 中文词语默写科学记忆 App：拆字 + 形声字规律 + 字族 + 故事记成语 + 艾宾浩斯间隔重复。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&family=Ma+Shan+Zheng&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
