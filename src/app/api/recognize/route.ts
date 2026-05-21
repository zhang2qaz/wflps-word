import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const runtime = 'edge';

// 错字自动识别：用视觉模型判断孩子手写的每个字是否正确。
// 返回 { ok, results: boolean[] }（true=写对）。无 API key 或出错时 { ok:false }。
export async function POST(req: Request) {
  let line = '';
  let images: string[] = [];
  try {
    const body = await req.json();
    line = String(body.line ?? '');
    images = Array.isArray(body.images) ? body.images.map(String) : [];
  } catch {
    return Response.json({ ok: false });
  }

  if (!process.env.ANTHROPIC_API_KEY || !line || images.length === 0) {
    return Response.json({ ok: false });
  }

  const chars = Array.from(line);
  if (chars.length !== images.length) {
    return Response.json({ ok: false });
  }

  try {
    const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [
      {
        type: 'text',
        text:
          `一个小学生在默写。下面 ${images.length} 张图，依次是 TA 手写的第 1 到第 ${images.length} 个字，` +
          `每个字的正确目标依次是：${chars.map((c, i) => `第${i + 1}个=「${c}」`).join('，')}。\n` +
          `请逐张判断写得对不对：是目标字、笔画基本正确就算「对」（潦草但能认出是该字也算对）；` +
          `空白、写成别的字、明显缺笔/多笔算「错」。\n` +
          `只输出一个 JSON 布尔数组，长度恰好 ${images.length}，true=对、false=错，例如 [true,false,true]。不要输出任何别的文字。`,
      },
      ...images.map(img => ({ type: 'image' as const, image: img })),
    ];

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5'),
      maxOutputTokens: 120,
      messages: [{ role: 'user', content }],
    });

    const m = text.match(/\[[^\]]*\]/);
    if (!m) return Response.json({ ok: false });
    const arr = JSON.parse(m[0]);
    if (!Array.isArray(arr) || arr.length !== images.length) {
      return Response.json({ ok: false });
    }
    return Response.json({ ok: true, results: arr.map((x: unknown) => x === true) });
  } catch {
    return Response.json({ ok: false });
  }
}
