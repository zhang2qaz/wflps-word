import { NextResponse } from 'next/server';

// 运行时把后端配置下发给前端。
// supabaseAnonKey 用的是 Supabase「publishable」公钥 —— 它本来就会打包进前端、
// 设计成可公开；真正的数据隔离靠数据库行级安全(RLS)。机密的 secret key 不在此处。
// 环境变量 SUPABASE_URL / SUPABASE_ANON_KEY 可覆盖下面的默认值。
export const dynamic = 'force-dynamic';

const DEFAULT_URL = 'https://qrxldkyxhobyphndwuly.supabase.co';
const DEFAULT_ANON = 'sb_publishable_5SXP16ZmAdWtYhYSMliqPQ_SrSgKu_S';

export function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.SUPABASE_URL ?? DEFAULT_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? DEFAULT_ANON,
  });
}
