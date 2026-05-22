'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 写错的字的手写图（base64）单独存放 ——
// 不进主学习进度、不参与云同步，避免每次保存都要序列化一大堆图片导致卡顿。
type ShotsState = {
  shots: Record<string, (string | null)[]>;   // 题目 id → 写错的字的手写图
  setShots: (id: string, shots: (string | null)[]) => void;
  resetShots: () => void;
};

export const useShots = create<ShotsState>()(
  persist(
    (set) => ({
      shots: {},
      setShots: (id, s) => set((st) => {
        const next = { ...st.shots };
        if (!s || s.length === 0 || s.every((x) => !x)) delete next[id];
        else next[id] = s;
        return { shots: next };
      }),
      resetShots: () => set({ shots: {} }),
    }),
    { name: 'moxie-shots' },
  ),
);
