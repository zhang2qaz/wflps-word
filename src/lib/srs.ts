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

export function review(state: SrsState, grade: Grade): SrsState {
  const now = Date.now();
  const passed = grade >= 3;
  let { reps, ease, interval, lapses, correct, wrong } = state;

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

  // SM-2 简易度更新
  const newEase = Math.max(
    1.3,
    ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
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

export function masteryLevel(state: SrsState): 'new' | 'learning' | 'review' | 'mastered' {
  if (state.reps === 0 && state.lastReview === 0) return 'new';
  if (state.reps < 3) return 'learning';
  if (state.interval < 21) return 'review';
  return 'mastered';
}
