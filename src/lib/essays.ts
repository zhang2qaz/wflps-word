'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 作文本本地存储 —— 单独的 store,不进主进度、不上云,纯本机。
// 跟 useShots 一个套路,避免每次保存都序列化主进度。

export type Essay = {
  id: string;
  date: string;            // YYYY-MM-DD
  grade: number;
  title: string;
  content: string;
  wordCount: number;
  uniqueChars: number;
  selfReviewDone: boolean;
};

type EssaysState = {
  essays: Essay[];
  draft: { title: string; content: string; grade: number } | null;
  saveDraft: (d: { title: string; content: string; grade: number } | null) => void;
  saveEssay: (e: Omit<Essay, 'id' | 'date'>) => string;
  deleteEssay: (id: string) => void;
  resetEssays: () => void;
};

export const useEssays = create<EssaysState>()(
  persist(
    (set) => ({
      essays: [],
      draft: null,
      saveDraft: (d) => set({ draft: d }),
      saveEssay: (e) => {
        const id = `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        const date = new Date().toISOString().slice(0, 10);
        set((st) => ({
          essays: [{ id, date, ...e }, ...st.essays].slice(0, 200),  // 留最多 200 篇
          draft: null,
        }));
        return id;
      },
      deleteEssay: (id) => set((st) => ({ essays: st.essays.filter((x) => x.id !== id) })),
      resetEssays: () => set({ essays: [], draft: null }),
    }),
    { name: 'moxie-essays' },
  ),
);

// ───── 本地写作题目库(无 API,按年级随机抽) ─────

export const PROMPTS: Record<number, string[]> = {
  1: [
    '我最喜欢的玩具',
    '我的爸爸 / 妈妈',
    '今天最开心的事',
    '我喜欢的小动物',
    '一次下雨天',
    '我学会了一件事',
  ],
  2: [
    '我的好朋友',
    '一次有趣的活动',
    '我家附近的公园',
    '我最爱吃的食物 + 为什么',
    '一次帮妈妈做家务',
    '看到的一个小昆虫',
    '我的书包里都有什么',
  ],
  3: [
    '一次难忘的旅行',
    '我学会的一个本领',
    '我家的一个小习惯',
    '校园的早晨',
    '一次失败的尝试 + 学到了什么',
    '想象一下,如果我是…',
    '介绍一种水果(从颜色 / 味道 / 怎么吃 写)',
  ],
  4: [
    '我最喜欢的一本书',
    '一次帮助别人的事',
    '我观察了一棵树 / 一朵花一周',
    '介绍一道菜怎么做',
    '一次和家人争吵后和好',
    '我心中的英雄',
    '如果时间可以倒流,我想…',
  ],
  5: [
    '一次后悔的事 + 我的反思',
    '我最敬佩的一个人',
    '关于「成长」我想说的',
    '一个让我改变想法的瞬间',
    '我们家的传统',
    '介绍一种我热爱的运动 / 兴趣',
    '一封写给十年后自己的信',
  ],
  6: [
    '六年小学最难忘的一件事',
    '我和「读书」这件事',
    '面对压力时我会怎么做',
    '介绍一位让我成长的老师 / 朋友',
    '关于「时间」的思考',
    '十年后的我',
    '我心中的故乡',
  ],
};

// 自检清单 —— 按年级显示不同问题
export const REVIEW_CHECKLIST: Record<number, string[]> = {
  1: [
    '我每一句都有标点(句号 / 问号 / 感叹号)吗?',
    '有没有错字?再看一遍',
    '我最喜欢自己写的哪一句?',
  ],
  2: [
    '我每一句都有标点(句号 / 问号 / 感叹号)吗?',
    '有没有错字?再看一遍',
    '我最喜欢自己写的哪一句?',
    '我有没有用上 至少一个 学过的好词?',
  ],
  3: [
    '开头有没有吸引人想往下读?',
    '中间有没有具体的例子,不是空话?',
    '有没有错字 / 错的标点?',
    '我有没有用上「比喻」「拟人」之类的修辞?',
    '结尾有没有把意思讲完?',
  ],
  4: [
    '我的中心(想表达什么)别人一眼能看出吗?',
    '段落分得合理吗?(不是一长段)',
    '有没有具体的细节描写,而不只是「很好看 / 很开心」?',
    '有没有错字 / 病句?',
    '至少用了一个修辞手法吗?',
  ],
  5: [
    '我的主线 / 中心清楚吗?',
    '有没有过于「流水账」的部分可以删?',
    '细节描写够具体吗?(动作 / 表情 / 心理 / 环境)',
    '至少用了两种修辞或写作手法吗?',
    '结尾有没有提升或留余味?',
    '错字、病句、标点都对了吗?',
  ],
  6: [
    '主旨深刻不只是停留在表面叙事吗?',
    '结构清晰(总-分-总 / 时间线 / 对比 / 等)吗?',
    '细节有没有打动自己的画面?',
    '语言风格统一吗(不要又口语又书面跳来跳去)?',
    '修辞有没有用得自然不刻意?',
    '错字、病句、标点都对了吗?',
  ],
};

export function randomPrompt(grade: number): string {
  const arr = PROMPTS[grade] || PROMPTS[3];
  return arr[Math.floor(Math.random() * arr.length)];
}

export function reviewFor(grade: number): string[] {
  return REVIEW_CHECKLIST[grade] || REVIEW_CHECKLIST[3];
}

// ───── 本地文本统计(无 API)─────

export function statsOf(content: string) {
  const chars = [...content].filter((c) => !/\s/.test(c));
  const unique = new Set(chars.filter((c) => /\p{Script=Han}/u.test(c))).size;
  const punctuation = chars.filter((c) => /[,。、;:!?「」"'"":《》()\.,;:!?]/.test(c)).length;
  return {
    chars: chars.length,
    unique,
    punctuation,
  };
}
