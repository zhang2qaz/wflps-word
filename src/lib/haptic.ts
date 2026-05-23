'use client';

// 触觉反馈封装 —— 关键交互时刻给一点震动,补足视觉之外的「确认感」。
// iOS Safari 目前还不支持 navigator.vibrate（静默无操作）;
// Android Chrome / 多数 PWA 容器都支持。

function fire(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    /* 浏览器拒绝 / 静音模式 —— 静默处理 */
  }
}

export const haptic = {
  tap: () => fire(8),                         // 轻点
  submit: () => fire(15),                     // 提交 / 确认
  success: () => fire([10, 60, 10]),          // 答对 · 两短一空
  error: () => fire([14, 80, 14, 80, 14]),    // 答错 · 三短
  unlock: () => fire([8, 40, 8, 40, 20]),     // 解锁 / 里程碑
};
