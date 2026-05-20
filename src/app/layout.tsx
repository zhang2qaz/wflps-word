import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "默写大师 · 统编版二年级下册",
  description: "用科学的记忆方法陪孩子练中文默写：拆字 + 形声字规律 + 字族 + 故事记成语 + 艾宾浩斯间隔重复。",
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
