import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, createUIMessageStreamResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { char, pinyin, meaning } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'no_key',
        fallback: defaultMnemonic(char, meaning),
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    maxOutputTokens: 300,
    system: `你是一位面向中国小学二年级（7-8 岁）孩子的中文老师，擅长用"字源记忆法"和"形象联想"帮孩子记字。\n\n要求：\n1. 用孩子能听懂的话（不超过 50 个字）\n2. 拆解汉字结构（偏旁部首+字形联想）\n3. 给一个生动的画面或小故事\n4. 不要空话，每一句都要有具体形象\n5. 用温暖、鼓励的语气`,
    prompt: `请给"${char}"（拼音：${pinyin}，意思：${meaning}）写一个 50 字以内的记忆小故事，帮孩子记住怎么写、什么意思。`,
  });

  return result.toUIMessageStreamResponse();
}

function defaultMnemonic(char: string, meaning: string): string {
  return `「${char}」的意思是"${meaning}"。多读几遍，再用它造个句子，就记住啦！`;
}
