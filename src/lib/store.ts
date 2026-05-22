'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSrs, review, isDue, isMastered, binaryToGrade, type SrsState, type Grade } from './srs';
import { WORDS, POEMS, SENTENCES, isReciteId, currentPosition, unitWords, type Word } from '@/data/vocabulary';

type WordProgress = SrsState & {
  id: string;
  errorTags?: string[];
  wrongChars?: string[];
  wrongShots?: (string | null)[];   // 写错的字 · 孩子的手写图（供错题本回看）
};

export type AnswerOpts = {
  hintUsed?: boolean;
  errorTags?: string[];
  wrongChars?: string[];
  wrongShots?: (string | null)[];
  grade?: Grade;       // 直接指定 SRS 评分（古诗/句子按错字比例评分时用）
};

type SessionStats = {
  date: string;
  learned: number;
  reviewed: number;
  correct: number;
  wrong: number;
};

type State = {
  progress: Record<string, WordProgress>;
  history: SessionStats[];
  childName: string;
  customWords: Word[];           // 家长导入的词语
  milestoneSeen: number;         // 已庆祝过的「掌握字数」里程碑
  setChildName: (name: string) => void;
  setMilestoneSeen: (n: number) => void;
  recordAnswer: (id: string, correct: boolean, opts?: AnswerOpts) => void;
  recordGrade: (id: string, grade: Grade) => void;
  markLearned: (id: string) => void;
  addCustomWords: (words: Word[]) => void;
  clearCustomWords: () => void;
  reset: () => void;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getProgress(state: State, id: string): WordProgress {
  return state.progress[id] ?? { id, ...defaultSrs() };
}

function updateTodayStats(history: SessionStats[], delta: Partial<SessionStats>): SessionStats[] {
  const today = todayKey();
  const idx = history.findIndex(h => h.date === today);
  if (idx === -1) {
    return [...history, { date: today, learned: 0, reviewed: 0, correct: 0, wrong: 0, ...delta }];
  }
  const cur = history[idx];
  const updated: SessionStats = {
    date: today,
    learned: cur.learned + (delta.learned ?? 0),
    reviewed: cur.reviewed + (delta.reviewed ?? 0),
    correct: cur.correct + (delta.correct ?? 0),
    wrong: cur.wrong + (delta.wrong ?? 0),
  };
  return history.map((h, i) => (i === idx ? updated : h));
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      progress: {},
      history: [],
      childName: '',
      customWords: [],
      milestoneSeen: 0,
      setChildName: (name) => set({ childName: name }),
      setMilestoneSeen: (n) => set({ milestoneSeen: n }),

      recordAnswer: (id, correct, opts = {}) => {
        const { hintUsed = false, errorTags = [], wrongChars = [], wrongShots = [], grade } = opts;
        const g: Grade = grade ?? binaryToGrade(correct, hintUsed);
        const cur = getProgress(get(), id);
        const next = review(cur, g);
        // 「对/错」计数按真实对错算 —— 古诗 / 句子即使 SRS 评分宽松通过，
        // 只要有错字，也要计为「错」，确保进错题本。
        next.correct = cur.correct + (correct ? 1 : 0);
        next.wrong = cur.wrong + (correct ? 0 : 1);
        set(s => ({
          progress: {
            ...s.progress,
            // errorTags / wrongChars / wrongShots 直接按传入值存（调用方负责传 [] 清空）
            [id]: { id, ...next, errorTags, wrongChars, wrongShots },
          },
          history: updateTodayStats(s.history, {
            reviewed: 1,
            correct: correct ? 1 : 0,
            wrong: correct ? 0 : 1,
          }),
        }));
      },

      recordGrade: (id, grade) => {
        const cur = getProgress(get(), id);
        const next = review(cur, grade);
        const passed = grade >= 3;
        set(s => ({
          progress: { ...s.progress, [id]: { id, ...next } },
          history: updateTodayStats(s.history, {
            reviewed: 1,
            correct: passed ? 1 : 0,
            wrong: passed ? 0 : 1,
          }),
        }));
      },

      markLearned: (id) => {
        const cur = getProgress(get(), id);
        if (cur.lastReview !== 0) return;
        set(s => ({
          progress: { ...s.progress, [id]: { id, ...defaultSrs(), lastReview: Date.now() } },
          history: updateTodayStats(s.history, { learned: 1 }),
        }));
      },

      addCustomWords: (words) => {
        set(s => {
          const existing = new Set(s.customWords.map(w => w.id));
          const fresh = words.filter(w => !existing.has(w.id));
          return { customWords: [...s.customWords, ...fresh] };
        });
      },

      clearCustomWords: () => set({ customWords: [] }),

      reset: () => set({ progress: {}, history: [], milestoneSeen: 0 }),
    }),
    { name: 'moxie-dashi' },
  ),
);

// ===== Selectors =====

export function allWords(state: State): Word[] {
  return [...WORDS, ...state.customWords];
}

function selectAllDue(state: State, now: number): string[] {
  return Object.values(state.progress)
    .filter(p => p.lastReview !== 0 && isDue(p, now))
    .sort((a, b) => a.nextDue - b.nextDue)
    .map(p => p.id);
}

// 到期的「词语」（学新字/听写跟踪的项），不含古诗句子
export function selectDueWords(state: State, now: number = Date.now()): string[] {
  return selectAllDue(state, now).filter(id => !isReciteId(id));
}

// 到期的「古诗 / 句子」
export function selectDueRecite(state: State, now: number = Date.now()): string[] {
  return selectAllDue(state, now).filter(id => isReciteId(id));
}

// 当前学习单元里「到期该复习」的字 —— 复习页 / 首页 / 家长报告统一口径
export function selectUnitReviewDue(state: State, now: number = Date.now()): string[] {
  const pos = currentPosition(id => (state.progress[id]?.lastReview ?? 0) !== 0);
  return unitWords(pos.grade, pos.semester, pos.unit)
    .filter(w => {
      const p = state.progress[w.id];
      return !!p && p.lastReview !== 0 && isDue(p, now);
    })
    .sort((a, b) => (state.progress[a.id]!.nextDue - state.progress[b.id]!.nextDue))
    .map(w => w.id);
}

export function selectMistakeWords(state: State): string[] {
  return Object.values(state.progress)
    .filter(p => p.wrong > 0 && p.wrong >= p.correct - 1)
    .sort((a, b) => b.wrong - a.wrong)
    .map(p => p.id);
}

export function selectNewWords(state: State): string[] {
  return allWords(state)
    .filter(w => {
      const p = state.progress[w.id];
      return !p || p.lastReview === 0;
    })
    .map(w => w.id);
}

export function selectStats(state: State) {
  // 总数 = 词语（含导入）+ 古诗 + 句子
  const total = allWords(state).length + POEMS.length + SENTENCES.length;
  const learned = Object.values(state.progress).filter(p => p.lastReview !== 0).length;
  const mastered = Object.values(state.progress).filter(p => isMastered(p)).length;
  const due = selectUnitReviewDue(state).length;
  const todays = state.history.find(h => h.date === todayKey());
  const streak = computeStreak(state.history);
  return { total, learned, mastered, due, todays, streak };
}

function computeStreak(history: SessionStats[]): number {
  if (history.length === 0) return 0;
  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const h of sorted) {
    const key = cursor.toISOString().slice(0, 10);
    if (h.date === key && (h.reviewed > 0 || h.learned > 0)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getProgressFor(state: State, id: string): WordProgress {
  return state.progress[id] ?? { id, ...defaultSrs() };
}
