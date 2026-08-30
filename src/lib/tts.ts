'use client';

// 浏览器 TTS 封装 — 使用中文女声，模拟老师听写
//
// 关键约束(iOS/移动端 Safari)：
//   1. speechSynthesis.speak() 必须和用户点击在同一个调用栈里，
//      任何 await/setTimeout 之后再 speak 都可能被系统静音 —— 所以
//      speak() 里发声前绝不能有异步等待，voices 改为模块加载时预热。
//   2. 从后台切回来后引擎可能卡在 paused 状态，speak 前要 resume()。
//   3. voices 首次可能为空，此时不要把英文嗓音缓存死 —— 只设 lang，
//      让系统自己挑中文声；等 voiceschanged 到了再缓存中文女声。

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  // 优先级：中文女声 > 任意中文；没有中文声就返回 null(靠 u.lang 让系统选)
  const zh = voices.filter(v => /zh|cmn|Chinese/i.test(v.lang + v.name));
  const female = zh.find(v => /female|女|Tingting|Sinji|Mei-Jia|Yaoyao|普通话/i.test(v.name));
  const picked = female ?? zh[0] ?? null;
  if (picked) cachedVoice = picked; // 只缓存中文声，避免把英文嗓音缓存死
  return picked;
}

// 模块加载时就预热 voices；列表变化时清缓存重挑
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      cachedVoice = null;
      pickVoice();
    });
  } catch { /* 老浏览器没有 addEventListener 也不影响发声 */ }

  // iOS 解锁：引擎要在用户手势里"开过嗓"才肯出声。
  // 第一次全局点击/触摸时静默说一个空格,把引擎唤醒,
  // 之后哪怕 dictate() 里异步链上的 speak 也能正常发声。
  const unlock = () => {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
    window.removeEventListener('touchend', unlock);
    window.removeEventListener('click', unlock);
  };
  window.addEventListener('touchend', unlock, { once: true });
  window.addEventListener('click', unlock, { once: true });
}

export function speak(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
  if (!text || !text.trim()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const synth = window.speechSynthesis;
    // iOS：后台回来可能卡在 paused，先恢复
    try { if (synth.paused) synth.resume(); } catch { /* ignore */ }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = opts.rate ?? 0.85;
    u.pitch = opts.pitch ?? 1.0;
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    // iOS WebKit bug：引擎空闲时 cancel() 紧跟 speak() 会吞掉这次发声,
    // 所以只有确实在说/在排队时才打断。
    if (synth.speaking || synth.pending) synth.cancel();
    // 同步发声 —— 必须保持在用户点击的调用栈内(iOS 要求)
    synth.speak(u);
  });
}

export function stopSpeak() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}

// 老师听写节奏：「请听写，第 N 题：XX。XX。」
export async function dictate(word: string, index: number, total: number) {
  await speak(`第 ${index} 题，共 ${total} 题`);
  await new Promise(r => setTimeout(r, 300));
  await speak(word, { rate: 0.7 });
  await new Promise(r => setTimeout(r, 500));
  await speak(word, { rate: 0.7 });
}
