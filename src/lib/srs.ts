// SM-2 算法变种 — 艾宾浩斯遗忘曲线驱动的间隔重复
// 参考 Anki 的 SuperMemo 2 算法，针对小学生稍作简化

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = 完全忘了, 3 = 想起来了但费劲, 5 = 一下就想起来

export type SrsState = {
  reps: number;        // 连续答对次数
  ease: number;        // 简易度 1.3 - 2.8
  interval: number;    // 距离下次复习的天数（首日为分钟分数计）
  nextDue: number;     // 下次到期时间戳 (ms)
  lapses: number;      // 答错的累计次数
  lastReview: number;  // 上次复习时间戳 (ms)
  correct: number;     // 累计答对
  wrong: number;       // 累计答错
};

export function defaultSrs(): SrsState {
  return {
    reps: 0,
    ease: 2.5,
    interval: 0,
    nextDue: Date.now(),
    lapses: 0,
    lastReview: 0,
    correct: 0,
    wrong: 0,
  };
}

// 首次学习的短间隔（分钟）— 模拟艾宾浩斯曲线
const LEARNING_STEPS_MIN = [5, 30, 720]; // 5 分钟、30 分钟、12 小时

// 安全上限 —— 防止极端情况下数值失控（连续答对几百次会让 interval 溢出成 Infinity）
const MAX_INTERVAL = 365; // 复习间隔上限：一年（小学生场景，再久没有意义）
const MAX_EASE = 2.8;     // 简易度上限（与 SrsState.ease 注释一致）
const SAFE_EASE = 2.5;    // 数据损坏时的回退简易度

// 把可能损坏的数值（NaN / Infinity / 负数）拉回安全范围，避免脏值扩散到进度里
function num(v: number, fallback: number): number {
  return Number.isFinite(v) ? v : fallback;
}

export function review(state: SrsState, grade: Grade): SrsState {
  const now = Date.now();
  const passed = grade >= 3;
  // 输入净化：persisted 进度万一损坏，回退到安全值，保证输出永远有限、合法
  let reps = Math.max(0, Math.floor(num(state.reps, 0)));
  let ease = Math.min(MAX_EASE, Math.max(1.3, num(state.ease, SAFE_EASE)));
  let interval = Math.max(0, num(state.interval, 0));
  let lapses = Math.max(0, num(state.lapses, 0));
  let correct = Math.max(0, num(state.correct, 0));
  let wrong = Math.max(0, num(state.wrong, 0));

  if (!passed) {
    // 答错：重置 reps，进入"再学习"队列
    wrong += 1;
    lapses += 1;
    reps = 0;
    interval = 0;
    // 10 分钟后再来一次
    return {
      reps,
      ease: Math.max(1.3, ease - 0.2),
      interval: 0,
      nextDue: now + 10 * 60_000,
      lapses,
      lastReview: now,
      correct,
      wrong,
    };
  }

  correct += 1;

  // 答对：决定下一步间隔
  if (reps < LEARNING_STEPS_MIN.length) {
    // 还在"短期记忆固化"阶段
    const minutes = LEARNING_STEPS_MIN[reps];
    reps += 1;
    return {
      reps,
      ease,
      interval: 0,
      nextDue: now + minutes * 60_000,
      lapses,
      lastReview: now,
      correct,
      wrong,
    };
  }

  // 进入"长期复习"阶段
  let newInterval: number;
  if (reps === LEARNING_STEPS_MIN.length) {
    newInterval = 1; // 第一天
  } else if (interval === 1) {
    newInterval = 3;
  } else {
    newInterval = Math.round(interval * ease);
  }
  // 钳进 [1, MAX_INTERVAL] —— 否则连续满分会让间隔指数膨胀直至溢出
  newInterval = Math.min(MAX_INTERVAL, Math.max(1, newInterval));

  // SM-2 简易度更新（上下都有界）
  const newEase = Math.min(
    MAX_EASE,
    Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))),
  );

  reps += 1;
  return {
    reps,
    ease: newEase,
    interval: newInterval,
    nextDue: now + newInterval * 24 * 60 * 60_000,
    lapses,
    lastReview: now,
    correct,
    wrong,
  };
}

export function isDue(state: SrsState, now: number = Date.now()): boolean {
  return state.nextDue <= now;
}

// 把"对/错"二元结果映射成 Grade（默认值）
export function binaryToGrade(correct: boolean, hintUsed = false): Grade {
  if (!correct) return 1;
  return hintUsed ? 3 : 5;
}

// 「已掌握」的统一判定 —— 全 App 只此一处定义
export function isMastered(state: SrsState): boolean {
  return state.reps >= 4 && state.interval >= 7;
}

// 记忆强度 0–5 —— 给孩子看的「养成」指标，复习时看着它一格格变强
export function memoryStrength(state: SrsState | undefined): number {
  if (!state || state.lastReview === 0) return 0;
  if (isMastered(state)) return 5;
  if (state.interval >= 7) return 4;
  if (state.interval >= 1) return 3;
  if (state.reps >= 2) return 2;
  return 1;
}

export function masteryLevel(state: SrsState): 'new' | 'learning' | 'review' | 'mastered' {
  if (state.reps === 0 && state.lastReview === 0) return 'new';
  if (isMastered(state)) return 'mastered';
  if (state.reps < 3) return 'learning';
  return 'review';
}
