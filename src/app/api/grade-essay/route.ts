import { NextRequest, NextResponse } from 'next/server';

// AI 作文批改 —— 接 Anthropic Claude API
// 需要在 HF Space 后台配 ANTHROPIC_API_KEY secret;
// 没配的话 API 优雅降级,给前端清楚的提示。

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'claude-sonnet-4-5-20250929';

type GradeResult = {
  score: number;
  level: '优秀' | '良好' | '中等' | '待改进';
  overall: string;
  errors: { text: string; type: string; suggest: string }[];
  highlights: { text: string; praise: string }[];
  suggestions: string[];
  wordCount: number;
};

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'AI 批改未启用 —— 需在 HF Space Secrets 里配置 ANTHROPIC_API_KEY 才能用' },
      { status: 503 },
    );
  }

  let body: { title?: string; content?: string; grade?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: '请求格式错' }, { status: 400 }); }

  const title = (body.title ?? '').trim();
  const content = (body.content ?? '').trim();
  const grade = Math.max(1, Math.min(6, Math.floor(Number(body.grade) || 3)));

  if (!content || content.length < 20) {
    return NextResponse.json({ error: '作文太短了,至少 20 个字' }, { status: 400 });
  }
  if (content.length > 4000) {
    return NextResponse.json({ error: '一次最多 4000 字' }, { status: 400 });
  }

  const prompt = buildPrompt(title, content, grade);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `Claude API ${res.status}:${t.slice(0, 200)}` }, { status: 502 });
    }
    const data = await res.json() as { content?: { type: string; text: string }[] };
    const text = data.content?.find((b) => b.type === 'text')?.text ?? '';

    // 模型输出 ```json ... ``` 形式,把里面 JSON 拎出来
    const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (!m) return NextResponse.json({ error: 'AI 返回格式异常,试试重新批改' }, { status: 502 });

    let parsed: Partial<GradeResult>;
    try { parsed = JSON.parse(m[1]); } catch { return NextResponse.json({ error: 'AI 返回的不是合法 JSON' }, { status: 502 }); }

    const result: GradeResult = {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      level: (['优秀', '良好', '中等', '待改进'].includes(parsed.level as string) ? parsed.level : '中等') as GradeResult['level'],
      overall: String(parsed.overall ?? ''),
      errors: Array.isArray(parsed.errors) ? parsed.errors.slice(0, 20).map((e) => ({
        text: String(e?.text ?? ''),
        type: String(e?.type ?? '错字'),
        suggest: String(e?.suggest ?? ''),
      })) : [],
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 8).map((h) => ({
        text: String(h?.text ?? ''),
        praise: String(h?.praise ?? ''),
      })) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5).map((s) => String(s)) : [],
      wordCount: [...content].length,
    };

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: `网络错误:${(e as Error).message}` }, { status: 502 });
  }
}

function buildPrompt(title: string, content: string, grade: number): string {
  return `你是一位有 20 年经验的小学语文老师,正在批改 ${grade} 年级孩子的作文。请用温和、鼓励、具体的口吻批改,不要打击孩子。

要求:
1. score 给 0-100 整数(${grade} 年级标准,不要给低于 50,鼓励为主)
2. level 必须是这四个之一:优秀(85+)/ 良好(70-84)/ 中等(60-69)/ 待改进(<60)
3. overall 整体评语 2-3 句,先肯定再点出 1 个最该改的方向
4. errors 列出最多 8 个具体错误(每个错误 text 摘原文短语 / type 必须是「错字」「病句」「标点」「用词不当」之一 / suggest 给出修改建议),不要凑数,没有就空
5. highlights 列出最多 5 个写得好的句子,praise 说为什么好(具体到修辞 / 用词 / 观察 / 情感)
6. suggestions 给 2-3 条整体改进方向,要具体可操作

只输出 JSON,不要任何其他说明。格式:
\`\`\`json
{
  "score": 0,
  "level": "良好",
  "overall": "...",
  "errors": [{"text":"...","type":"错字","suggest":"..."}],
  "highlights": [{"text":"...","praise":"..."}],
  "suggestions": ["...","..."]
}
\`\`\`

作文标题:${title || '(无标题)'}
作文内容:
${content}`;
}
