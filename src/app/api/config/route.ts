import { NextResponse } from 'next/server';

// 运行时把后端配置下发给前端。
// supabaseAnonKey 用的是 Supabase「publishable」公钥 —— 它本来就会打包进前端、
// 设计成可公开；真正的数据隔离靠数据库行级安全(RLS)。机密的 secret key 不在此处。
// 环境变量 SUPABASE_URL / SUPABASE_ANON_KEY 可覆盖下面的默认值。
export const dynamic = 'force-dynamic';

const DEFAULT_URL = 'https://qrxldkyxhobyphndwuly.supabase.co';
const DEFAULT_ANON = 'sb_publishable_5SXP16ZmAdWtYhYSMliqPQ_SrSgKu_S';

export function GET() {
  return NextResponse.json(
    {
      supabaseUrl: process.env.SUPABASE_URL ?? DEFAULT_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? DEFAULT_ANON,
    },
    // 配置几乎不变:让浏览器缓存 1 小时,全班同用时少打一大波请求(降低共享 IP 触发限流的概率)
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
