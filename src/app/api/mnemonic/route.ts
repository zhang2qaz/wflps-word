import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const runtime = 'edge';

// 返回统一格式 { text: string }。无 API key 或出错时返回 { text: '' }，
// 前端据此优雅降级（不显示「AI 联想」一栏）。
export async function POST(req: Request) {
  let char = '', pinyin = '', meaning = '';
  try {
    const body = await req.json();
    char = String(body.char ?? '');
    pinyin = String(body.pinyin ?? '');
    meaning = String(body.meaning ?? '');
  } catch {
    return Response.json({ text: '' });
  }

  if (!process.env.ANTHROPIC_API_KEY || !char) {
    return Response.json({ text: '' });
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5'),
      maxOutputTokens: 300,
      system:
        '你是一位面向中国小学二年级（7-8 岁）孩子的中文老师，擅长用「字源记忆法」和「形象联想」帮孩子记字。\n' +
        '要求：1) 用孩子能听懂的话（不超过 50 个字）；2) 拆解汉字结构（偏旁部首 + 字形联想）；' +
        '3) 给一个生动的画面或小故事；4) 每一句都要有具体形象；5) 语气温暖、鼓励。只输出故事本身，不要前缀。',
      prompt: `请给"${char}"（拼音：${pinyin}，意思：${meaning}）写一个 50 字以内的记忆小故事，帮孩子记住怎么写、什么意思。`,
    });
    return Response.json({ text: text.trim() });
  } catch {
    return Response.json({ text: '' });
  }
}
