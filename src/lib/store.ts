'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSrs, review, isDue, isMastered, binaryToGrade, type SrsState, type Grade } from './srs';
import { WORDS, POEMS, SENTENCES, isReciteId, currentPosition, unitWords, type Word } from '@/data/vocabulary';
import { useShots } from './shots';

type WordProgress = SrsState & {
  id: string;
  errorTags?: string[];
  wrongChars?: string[];
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

// 用户当前选定的课本(年级 + 上/下册) —— 全局学习范围锚点
export type SelectedBook = { grade: number; semester: '上' | '下' };

type State = {
  progress: Record<string, WordProgress>;
  history: SessionStats[];
  childName: string;
  customWords: Word[];           // 家长导入的词语
  milestoneSeen: number;         // 已庆祝过的「掌握字数」里程碑
  selectedBook: SelectedBook | null; // null = 还没选过,展示选课本界面
  setChildName: (name: string) => void;
  setMilestoneSeen: (n: number) => void;
  setSelectedBook: (book: SelectedBook | null) => void;
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
      selectedBook: null,
      setChildName: (name) => set({ childName: name }),
      setMilestoneSeen: (n) => set({ milestoneSeen: n }),
      setSelectedBook: (book) => set({ selectedBook: book }),

      recordAnswer: (id, correct, opts = {}) => {
        const { hintUsed = false, errorTags = [], wrongChars = [], wrongShots = [], grade } = opts;
        const g: Grade = grade ?? binaryToGrade(correct, hintUsed);
        const cur = getProgress(get(), id);
        const next = review(cur, g);
        // 「对/错」计数按真实对错算 —— 古诗 / 句子即使 SRS 评分宽松通过，
        // 只要有错字，也要计为「错」，确保进错题本。
        next.correct = cur.correct + (correct ? 1 : 0);
        next.wrong = cur.wrong + (correct ? 0 : 1);
        // 手写图单独存（不进主进度、不上云同步）—— 避免保存卡顿
        useShots.getState().setShots(id, wrongShots);
        set(s => ({
          progress: {
            ...s.progress,
            // errorTags / wrongChars 直接按传入值存（调用方负责传 [] 清空）
            [id]: { id, ...next, errorTags, wrongChars },
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

      reset: () => {
        useShots.getState().resetShots();
        set({ progress: {}, history: [], milestoneSeen: 0 });
      },
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
// 优先用用户在首页选的 selectedBook 锚定单元;没选过再退回历史进度启发式
export function selectUnitReviewDue(state: State, now: number = Date.now()): string[] {
  const histPos = currentPosition(id => (state.progress[id]?.lastReview ?? 0) !== 0);
  const pos = state.selectedBook
    ? (histPos.grade === state.selectedBook.grade && histPos.semester === state.selectedBook.semester
        ? histPos
        : { grade: state.selectedBook.grade, semester: state.selectedBook.semester, unit: 1 })
    : histPos;
  return unitWords(pos.grade, pos.semester, pos.unit)
    .filter(w => {
      const p = state.progress[w.id];
      return !!p && p.lastReview !== 0 && isDue(p, now);
    })
    .sort((a, b) => (state.progress[a.id]!.nextDue - state.progress[b.id]!.nextDue))
    .map(w => w.id);
}

// 错题:也按 selectedBook 过滤 —— 跨年级旧错题不进当前视图
export function selectMistakeWords(state: State): string[] {
  const sb = state.selectedBook;
  const inBook = (id: string): boolean => {
    if (!sb) return true;
    const w = [...WORDS, ...state.customWords].find(x => x.id === id);
    if (w) return (w.grade ?? 2) === sb.grade && w.semester === sb.semester;
    const p = POEMS.find(x => x.id === id);
    if (p) return (p.grade ?? 2) === sb.grade && p.semester === sb.semester;
    const s = SENTENCES.find(x => x.id === id);
    if (s) return (s.grade ?? 2) === sb.grade && s.semester === sb.semester;
    return false;
  };
  return Object.values(state.progress)
    .filter(p => p.wrong > 0 && p.wrong >= p.correct - 1)
    .filter(p => inBook(p.id))
    .sort((a, b) => b.wrong - a.wrong)
    .map(p => p.id);
}

// 没学过的字:也按 selectedBook 过滤
export function selectNewWords(state: State): string[] {
  const sb = state.selectedBook;
  return allWords(state)
    .filter(w => !sb || ((w.grade ?? 2) === sb.grade && w.semester === sb.semester))
    .filter(w => {
      const p = state.progress[w.id];
      return !p || p.lastReview === 0;
    })
    .map(w => w.id);
}

export function selectStats(state: State) {
  // 总数 / 已学 / 已掌握 都限定在 selectedBook 范围内 —— 跨年级别的字不进当前数字
  const sb = state.selectedBook;
  const inBook = <T extends { grade?: number; semester: '上' | '下' }>(x: T): boolean =>
    !sb || ((x.grade ?? 2) === sb.grade && x.semester === sb.semester);
  const bookWords = allWords(state).filter(inBook);
  const bookPoems = POEMS.filter(inBook);
  const bookSents = SENTENCES.filter(inBook);
  const bookIds = new Set<string>([
    ...bookWords.map(w => w.id),
    ...bookPoems.map(p => p.id),
    ...bookSents.map(s => s.id),
  ]);
  const total = bookIds.size;
  const learned = Object.values(state.progress).filter(p => p.lastReview !== 0 && bookIds.has(p.id)).length;
  const mastered = Object.values(state.progress).filter(p => isMastered(p) && bookIds.has(p.id)).length;
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
