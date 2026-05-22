import { NextResponse } from 'next/server';

// 运行时把后端配置下发给前端。
// supabaseAnonKey 是设计成可公开放在前端的「匿名公钥」，真正的数据隔离靠数据库行级安全；
// 机密的 service_role key 永远不在这里、也不需要。
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.SUPABASE_URL ?? null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? null,
  });
}
