'use client';

// 浏览器 TTS 封装 — 使用中文女声，模拟老师听写

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  // 优先级：中文女声 > 任意中文 > 任意
  const zh = voices.filter(v => /zh|cmn|Chinese/i.test(v.lang + v.name));
  const female = zh.find(v => /female|女|Tingting|Sinji|Mei-Jia|Yaoyao|普通话/i.test(v.name));
  cachedVoice = female ?? zh[0] ?? voices[0] ?? null;
  return cachedVoice;
}

export async function speak(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  // 等 voices 加载（首次可能为空）
  if (window.speechSynthesis.getVoices().length === 0) {
    await new Promise<void>((res) => {
      const handler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        res();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handler);
      setTimeout(() => res(), 800);
    });
  }
  return new Promise<void>((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = opts.rate ?? 0.85;
    u.pitch = opts.pitch ?? 1.0;
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeak() {
  if (typeof window === 'undefined') return;
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
