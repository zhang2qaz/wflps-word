'use client';

// 离线中文语音识别 —— Vosk WASM
// 首次使用从 CDN 下载 42MB 中文小模型,浏览器自动缓存(Cache Storage / PWA),
// 之后完全离线运行,不发任何网络请求。
//
// 模型源:alphacephei.com(Vosk 官方)。如要自托管,把 .tar.gz 放进 public/models/
// 然后改 MODEL_URL。

const MODEL_URL =
  process.env.NEXT_PUBLIC_VOSK_MODEL_URL ||
  'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-cn-0.3.tar.gz';

// 语音识别结果回调
export type VoskRecognizer = {
  // 中间结果(说话过程中实时更新)
  onPartial: (text: string) => void;
  // 最终结果(说完一句停顿后)
  onFinal: (text: string) => void;
  start: () => Promise<void>;
  stop: () => void;
};

// vosk-browser 的类型很弱,只取我们需要的形状
type Model = { KaldiRecognizer: new (sampleRate: number) => Recognizer };
type Recognizer = {
  on: (event: 'result' | 'partialresult', cb: (m: { result: { text?: string; partial?: string } }) => void) => void;
  acceptWaveform: (buf: AudioBuffer) => void;
  remove: () => void;
  setWords: (b: boolean) => void;
};
type VoskModule = { createModel: (url: string) => Promise<Model> };

// 模型只加载一次(整个会话共享)
let modelPromise: Promise<Model> | null = null;

export function isModelCached(): Promise<boolean> {
  if (typeof caches === 'undefined') return Promise.resolve(false);
  return caches.match(MODEL_URL).then((r) => !!r);
}

export async function loadModel(): Promise<Model> {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const vosk = (await import('vosk-browser')) as unknown as VoskModule;
    return vosk.createModel(MODEL_URL);
  })();
  return modelPromise;
}

/** 创建一个识别器,管理麦克风 + AudioContext 的生命周期 */
export async function createRecognizer(callbacks: {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
}): Promise<{ stop: () => void; start: () => Promise<void> }> {
  let audioCtx: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let processor: ScriptProcessorNode | null = null;
  let recognizer: Recognizer | null = null;

  const start = async () => {
    const model = await loadModel();
    // 麦克风权限
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    recognizer = new model.KaldiRecognizer(audioCtx.sampleRate);
    recognizer.setWords(false);

    recognizer.on('result', (m) => {
      const text = m.result.text?.replace(/\s+/g, '') ?? '';
      if (text) callbacks.onFinal(text);
    });
    recognizer.on('partialresult', (m) => {
      const text = m.result.partial?.replace(/\s+/g, '') ?? '';
      callbacks.onPartial(text);
    });

    source = audioCtx.createMediaStreamSource(stream);
    // ScriptProcessor 虽然 deprecated 但 vosk-browser 官方 demo 仍这么用,
    // 兼容性最稳。AudioWorklet 路径需要单独 worklet 文件,留作后续优化。
    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      try {
        recognizer?.acceptWaveform(e.inputBuffer);
      } catch {
        /* 录音中断 / 模型卸载 —— 静默 */
      }
    };
    source.connect(processor);
    processor.connect(audioCtx.destination);
  };

  const stop = () => {
    try { processor?.disconnect(); } catch {}
    try { source?.disconnect(); } catch {}
    try { stream?.getTracks().forEach((t) => t.stop()); } catch {}
    try { audioCtx?.close(); } catch {}
    try { recognizer?.remove(); } catch {}
    processor = null; source = null; stream = null; audioCtx = null; recognizer = null;
  };

  return { start, stop };
}
