'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSrs, review, isDue, binaryToGrade, type SrsState, type Grade } from './srs';
import { WORDS, type Word } from '@/data/vocabulary';

type WordProgress = SrsState & { id: string; errorTags?: string[] };

export type AnswerOpts = { hintUsed?: boolean; errorTags?: string[] };

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
  setChildName: (name: string) => void;
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
      setChildName: (name) => set({ childName: name }),

      recordAnswer: (id, correct, opts = {}) => {
        const { hintUsed = false, errorTags = [] } = opts;
        const grade = binaryToGrade(correct, hintUsed);
        const cur = getProgress(get(), id);
        const next = review(cur, grade);
        set(s => ({
          progress: {
            ...s.progress,
            [id]: { id, ...next, errorTags: correct ? [] : errorTags },
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

      reset: () => set({ progress: {}, history: [] }),
    }),
    { name: 'moxie-dashi' },
  ),
);

// ===== Selectors =====

export function allWords(state: State): Word[] {
  return [...WORDS, ...state.customWords];
}

export function selectDueWords(state: State, now: number = Date.now()): string[] {
  return Object.values(state.progress)
    .filter(p => p.lastReview !== 0 && isDue(p, now))
    .sort((a, b) => a.nextDue - b.nextDue)
    .map(p => p.id);
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
  const total = allWords(state).length;
  const learned = Object.values(state.progress).filter(p => p.lastReview !== 0).length;
  const mastered = Object.values(state.progress).filter(p => p.reps >= 4 && p.interval >= 7).length;
  const due = selectDueWords(state).length;
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
