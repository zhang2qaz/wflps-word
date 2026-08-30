import { NextRequest } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// 服务器端语音合成(微软 Edge-TTS,晓晓女声) —— 浏览器没有中文语音时的兜底。
// 典型场景:国内 Chrome(谷歌在线语音被墙、系统又没装中文语音包)朗读无声。
export const dynamic = 'force-dynamic';

// 简易 LRU:听写重读/复习会反复朗读同一文本,命中后不重复合成
const cache = new Map<string, Buffer>();
const CACHE_MAX = 300;

async function synth(text: string, rate: number): Promise<Buffer> {
  const key = `${rate}|${text}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const tts = new MsEdgeTTS();
  await tts.setMetadata('zh-CN-XiaoxiaoNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  try {
    const { audioStream } = tts.toStream(text, { rate });
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (c: Buffer) => chunks.push(c));
      audioStream.on('end', () => resolve());
      audioStream.on('error', reject);
    });
    const buf = Buffer.concat(chunks);
    if (!buf.length) throw new Error('empty audio');
    cache.set(key, buf);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
    return buf;
  } finally {
    tts.close();
  }
}

export async function GET(req: NextRequest) {
  const text = (req.nextUrl.searchParams.get('text') ?? '').slice(0, 300).trim();
  const rate = Math.min(1.5, Math.max(0.4, Number(req.nextUrl.searchParams.get('rate')) || 0.85));
  if (!text) return new Response('missing text', { status: 400 });
  try {
    const buf = await synth(text, rate);
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'audio/mpeg',
        // 同文本同语速的音频内容不变,可放心让浏览器缓存一周
        'Cache-Control': 'public, max-age=604800',
      },
    });
  } catch {
    return new Response('tts failed', { status: 502 });
  }
}
