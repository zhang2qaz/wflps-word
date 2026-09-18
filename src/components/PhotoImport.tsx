'use client';

import { useRef, useState } from 'react';

// 拍照导入:拍老师的词语表 → 浏览器本地 OCR(tesseract chi_sim,资产同源自托管)
// → 解析出 课号/课文名/词语/句子 回填导入表单。识别不联网、不依赖任何外部服务。

export type PhotoExtract = {
  lessonNo: string;
  lessonName: string;
  words: string[];
  sentences: string[];
  poemNote: string;   // 「抄写《XX》全诗」提示(古诗已内置,无需导入)
  rawText: string;    // 原始识别文本,供家长核对
};

// —— OCR 行重建:中文识别会把每个字用空格隔开,词间的真实间隙无从区分。
// 解法:用字符包围盒(symbol bbox)的横向间距聚类 —— 词内间距≈0,词间是整个空格宽。
type Sym = { text: string; x0: number; x1: number; y0: number; y1: number };

export function rebuildLines(lineSymbols: Sym[][]): string[] {
  const out: string[] = [];
  for (const syms of lineSymbols) {
    const s = syms.filter(x => x.text.trim());
    if (!s.length) continue;
    s.sort((a, b) => a.x0 - b.x0);
    const widths = s.map(x => x.x1 - x.x0).sort((a, b) => a - b);
    const charW = widths[Math.floor(widths.length / 2)] || 20; // 中位字宽
    let line = s[0].text;
    for (let i = 1; i < s.length; i++) {
      const gap = s[i].x0 - s[i - 1].x1;
      line += (gap > charW * 0.30 ? ' ' : '') + s[i].text;
    }
    out.push(line.trim());
  }
  return out;
}

// 按句号/问号/叹号切句(保留标点;不用 lookbehind —— 老 iPad 的 Safari 会解析崩溃)
function splitSentences(text: string): string[] {
  const res: string[] = [];
  let cur = '';
  for (const ch of text) {
    cur += ch;
    if (ch === '。' || ch === '！' || ch === '？') { res.push(cur); cur = ''; }
  }
  if (cur.trim()) res.push(cur);
  return res.map(s => s.trim()).filter(s => /[一-龥]{4,}/.test(s));
}

// 把识别出的行按老师词语表的版式解析
export function parseSheet(lines: string[], rawText: string): PhotoExtract {
  let lessonNo = '';
  let lessonName = '';
  let poemNote = '';
  const wordChunks: string[] = [];
  const sentenceChunks: string[] = [];
  // 区域状态机:标题 → 词语 → 句子
  let region: 'none' | 'words' | 'sentences' = 'none';
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // 课头:如「5、铺满金色巴掌的水泥道」「14. 搭船的鸟」(容忍 OCR 残留空格)
    const head = line.match(/^(\d{1,2})\s*[、.,．·:：]\s*([一-龥（）()《》\s]{2,30})$/);
    if (head && !lessonName) {
      lessonNo = head[1];
      lessonName = head[2].replace(/\s/g, '');
      region = 'none';
      continue;
    }
    // 「抄写《望洞庭》《山行》全诗」→ 古诗提示
    if (/抄\s*写.*全\s*诗/.test(line)) {
      poemNote = line.replace(/\s/g, '');
      continue;
    }
    // 「词语：」标记(容忍 词/司、语/浯 等形近误识)
    const wm = line.match(/^[词司]\s*[语浯]\s*[:：](.*)$/);
    if (wm) { region = 'words'; if (wm[1]) wordChunks.push(wm[1]); continue; }
    // 「句子：」标记(句 常被误识为 旬/勾/甸)
    const sm = line.match(/^[句旬勾甸]\s*子\s*[:：](.*)$/);
    if (sm) { region = 'sentences'; if (sm[1]) sentenceChunks.push(sm[1]); continue; }
    if (region === 'sentences') sentenceChunks.push(line);
    else wordChunks.push(line); // 没有标记时默认当词语区(老师表的主体就是词)
  }
  // 词语:按 空格/顿号/逗号 拆 token,只留 1-6 个汉字的
  const words: string[] = [];
  const seen = new Set<string>();
  for (const chunk of wordChunks) {
    for (const t of chunk.split(/[\s,，、;；.。:：]+/)) {
      const w = t.replace(/[^一-龥]/g, '');
      if (w.length >= 1 && w.length <= 6 && !seen.has(w)) { seen.add(w); words.push(w); }
    }
  }
  // 句子:合并后去掉 OCR 空格再切句
  const sentences = splitSentences(sentenceChunks.join('').replace(/\s/g, ''));
  return { lessonNo, lessonName, words, sentences, poemNote, rawText };
}

// 大图缩到 ≤1600px,降内存加速识别
async function toCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PhotoImport({ onExtract }: { onExtract: (r: PhotoExtract) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');

  const run = async (file: File) => {
    setBusy(true);
    setStatus('正在读取图片…');
    setProgress(0);
    // 看门狗:任何阶段卡超过 3 分钟就判定失败,给手动输入的退路,绝不无限转
    let worker: Awaited<ReturnType<typeof import('tesseract.js').createWorker>> | null = null;
    let done = false;
    const watchdog = setTimeout(() => {
      if (done) return;
      done = true;
      setBusy(false);
      setStatus('⚠ 识别太久(可能网络慢没下完引擎)。请在 WiFi 下重试,或直接在下面手动输入。');
      try { worker?.terminate(); } catch { /* ignore */ }
    }, 180_000);
    try {
      const canvas = await toCanvas(file);
      if (done) return;
      setPreview(canvas.toDataURL('image/jpeg', 0.6));
      const { createWorker } = await import('tesseract.js');
      // 每个阶段都给中文进度 —— 下载引擎、加载字库、识别,都不再是「一动不动」
      const PHASE: Record<string, string> = {
        'loading tesseract core': '下载识别引擎(首次约 23MB)',
        'initializing tesseract': '启动识别引擎',
        'loading language traineddata': '下载中文字库',
        'loaded language traineddata': '中文字库就绪',
        'initializing api': '准备识别',
        'recognizing text': '识别文字中',
      };
      worker = await createWorker('chi_sim', 1, {
        workerPath: '/ocr/worker.min.js',
        corePath: '/ocr/core',
        langPath: '/ocr/lang',
        logger: (m: { status: string; progress: number }) => {
          if (done) return;
          const label = PHASE[m.status];
          if (label) {
            const pct = Math.round((m.progress ?? 0) * 100);
            setStatus(`${label}… ${pct}%`);
            setProgress(pct);
          }
        },
      });
      if (done) return;
      const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
      await worker.terminate();
      worker = null;
      if (done) return;
      done = true;
      clearTimeout(watchdog);
      // 从字符包围盒重建「带词间空格」的行;拿不到坐标时退回纯文本
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const lineSyms: Sym[][] = [];
      for (const b of (data as any).blocks ?? []) {
        for (const p of b.paragraphs ?? []) {
          for (const ln of p.lines ?? []) {
            lineSyms.push(
              (ln.words ?? [])
                .flatMap((w: any) => w.symbols ?? [])
                .map((s: any) => ({ text: s.text as string, x0: s.bbox.x0, x1: s.bbox.x1, y0: s.bbox.y0, y1: s.bbox.y1 })),
            );
          }
        }
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
      const lines = lineSyms.length ? rebuildLines(lineSyms) : (data.text ?? '').split('\n');
      const parsed = parseSheet(lines, data.text ?? '');
      if (!parsed.words.length && !parsed.sentences.length && !parsed.poemNote) {
        setStatus('⚠ 没识别出词句 —— 请离近一点、对正光线再拍一张,或直接手动输入。');
      } else {
        setStatus(
          `✓ 识别完成:${parsed.lessonName ? `《${parsed.lessonName}》· ` : ''}` +
          `${parsed.words.length} 个词${parsed.sentences.length ? ` · ${parsed.sentences.length} 句` : ''}` +
          ' —— 已填入下方,请逐项核对(识别难免有错字)。',
        );
        (window as unknown as { __ocr?: PhotoExtract }).__ocr = parsed; // 调试:核对识别原文
        onExtract(parsed);
      }
    } catch {
      if (!done) setStatus('⚠ 识别失败 —— 可能是识别引擎没加载出来,请刷新重试或手动输入。');
      try { worker?.terminate(); } catch { /* ignore */ }
    } finally {
      done = true;
      clearTimeout(watchdog);
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--color-jade)' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-bold mb-0.5">📷 拍照导入</div>
          <div className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            对着老师词语表的<b>一课</b>拍照,自动识别课文、词语和句子。识别在你手机上完成,不上传。
          </div>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex-shrink-0"
          style={{ background: 'var(--color-jade)', color: 'var(--color-paper)' }}
        >
          {busy ? '识别中…' : '拍照 / 选图'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) void run(f); }}
      />
      {busy && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-stone)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--color-jade)' }} />
        </div>
      )}
      {status && (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: status.startsWith('⚠') ? 'var(--color-mustard)' : 'var(--color-jade)' }}>
          {status}
        </p>
      )}
      {preview && !busy && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="拍摄的词语表" className="mt-3 rounded-lg max-h-40" />
      )}
    </div>
  );
}
