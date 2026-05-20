---
title: 世外默写本
emoji: 🖌️
colorFrom: red
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: 上海世界外国语小学校本版 · 中文默写科学记忆 App
---

# 世外默写本 · 上海市世界外国语小学校本版

为 **上海市世界外国语小学（WFLPS）国际部 P2** 定制的中文词语默写科学记忆 App。
内置二年级下册第五单元「办法」（《寓言二则》《画杨桃》《小马过河》共 38 词），
按 WFL 国际部默写卷逐词核对。

## 科学记忆方法

- **学新字四步法**：认词 → 拆字 → 记法 → 运用。把陌生字拆成已认识的部件，
  讲清形声字规律、关联字族、用寓言故事记成语。
- **听写斩断失败循环**：卡住有三级提示阶梯，写错能引导诊断，错了当场描红订正。
- **艾宾浩斯间隔重复**：SM-2 算法安排复习时间，错因自动归类进错题本。
- **导入词单**：贴任意单元词语，自动生成拼音，覆盖后续单元。

## 技术栈

Next.js 16 · TailwindCSS v4 · Framer Motion · hanzi-writer · pinyin-pro ·
Vercel AI SDK v6（AI 助记，可选）。数据存浏览器 localStorage，无需登录。
