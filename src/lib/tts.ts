'use client';

// 浏览器 TTS 封装 — 使用中文女声，模拟老师听写
//
// 双通道设计：
//   ① 首选浏览器 speechSynthesis(免费、离线、iPad 上质量好)。
//   ② 兜底 /api/tts 服务器合成(微软晓晓声) —— 浏览器没有可用中文语音时
//      (典型:国内 Chrome,谷歌在线语音被墙、系统没装中文语音包)自动切换:
//      发声 1.2 秒内没开口或报错,即判定浏览器 TTS 哑了,当次会话改走服务器。
//
// 关键约束(iOS/移动端 Safari)：
//   1. speechSynthesis.speak() 必须和用户点击在同一个调用栈里，
//      任何 await/setTimeout 之后再 speak 都可能被系统静音 —— 所以
//      speak() 里发声前绝不能有异步等待，voices 在模块加载时预热。
//   2. 引擎空闲时 cancel() 紧跟 speak() 会吞掉发声(WebKit bug)，
//      只有确实在说/在排队时才 cancel。
//   3. 从后台切回来后引擎可能卡在 paused 状态，speak 前要 resume()。
//   4. <audio> 兜底同样要在首次用户手势里"解锁"过才允许后续程序化播放。

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

// ---- 服务器语音兜底 ----
let browserBroken = false; // 探测到浏览器 TTS 哑了 → 当次会话直接走服务器
let sharedAudio: HTMLAudioElement | null = null;
// 极小的无声 wav,用于在用户手势里解锁 <audio>
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

function getAudio(): HTMLAudioElement {
  if (!sharedAudio) sharedAudio = new Audio();
  return sharedAudio;
}

function speakViaServer(text: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      const a = getAudio();
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.src = `/api/tts?text=${encodeURIComponent(text)}&rate=${rate}`;
      void a.play().catch(() => resolve());
    } catch {
      resolve();
    }
  });
}

// 模块加载时预热 voices；首次用户手势解锁两套发声通道
if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        cachedVoice = null;
        pickVoice();
      });
    } catch { /* 老浏览器没有 addEventListener 也不影响发声 */ }
  }
  const unlock = () => {
    // ① 解锁 speechSynthesis(iOS 要求引擎在手势里"开过嗓")
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
    } catch { /* ignore */ }
    // ② 解锁 <audio> 兜底(播一段无声 wav)
    try {
      const a = getAudio();
      a.muted = true;
      a.src = SILENT_WAV;
      void a.play().then(() => { a.muted = false; }).catch(() => { a.muted = false; });
    } catch { /* ignore */ }
    window.removeEventListener('touchend', unlock);
    window.removeEventListener('click', unlock);
  };
  window.addEventListener('touchend', unlock, { once: true });
  window.addEventListener('click', unlock, { once: true });
}

export function speak(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!text || !text.trim()) return Promise.resolve();
  const rate = opts.rate ?? 0.85;
  if (!('speechSynthesis' in window) || browserBroken) return speakViaServer(text, rate);
  return new Promise<void>((resolve) => {
    const synth = window.speechSynthesis;
    // iOS：后台回来可能卡在 paused，先恢复
    try { if (synth.paused) synth.resume(); } catch { /* ignore */ }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = rate;
    u.pitch = opts.pitch ?? 1.0;
    const v = pickVoice();
    if (v) u.voice = v;
    let started = false;
    let settled = false;
    u.onstart = () => { started = true; };
    u.onend = () => { if (!settled) { settled = true; resolve(); } };
    u.onerror = () => {
      // 引擎报错(常见:在线语音被墙) → 立刻切服务器兜底
      if (settled) return;
      settled = true;
      browserBroken = true;
      void speakViaServer(text, rate).then(resolve);
    };
    // WebKit bug：引擎空闲时 cancel() 紧跟 speak() 会吞掉发声
    if (synth.speaking || synth.pending) synth.cancel();
    // 同步发声 —— 必须保持在用户点击的调用栈内(iOS 要求)
    synth.speak(u);
    // 看门狗：1.2 秒没开口 → 判定浏览器没有可用中文语音 → 服务器兜底
    setTimeout(() => {
      if (started || settled) return;
      settled = true;
      browserBroken = true;
      try { synth.cancel(); } catch { /* ignore */ }
      void speakViaServer(text, rate).then(resolve);
    }, 1200);
  });
}

export function stopSpeak() {
  if (typeof window === 'undefined') return;
  try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* ignore */ }
  if (sharedAudio) {
    try { sharedAudio.pause(); sharedAudio.currentTime = 0; } catch { /* ignore */ }
  }
}

// 老师听写节奏：「请听写，第 N 题：XX。XX。」
export async function dictate(word: string, index: number, total: number) {
  await speak(`第 ${index} 题，共 ${total} 题`);
  await new Promise(r => setTimeout(r, 300));
  await speak(word, { rate: 0.7 });
  await new Promise(r => setTimeout(r, 500));
  await speak(word, { rate: 0.7 });
}
