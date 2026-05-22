-- ============================================================
-- 世外默写本 · 账号系统建表脚本
-- 用法：打开 Supabase 项目 → 左侧 SQL Editor → 整段粘贴 → Run
-- ============================================================

-- 每个账号（一个家庭）下的孩子；该孩子的全部学习数据整存为一个 JSON。
create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists children_account_idx on public.children(account_id);

-- ---- 行级安全：每个账号只能读写自己的孩子，家庭之间数据完全隔离 ----
alter table public.children enable row level security;

drop policy if exists "children_select_own" on public.children;
create policy "children_select_own" on public.children
  for select using (account_id = auth.uid());

drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own" on public.children
  for insert with check (account_id = auth.uid());

drop policy if exists "children_update_own" on public.children;
create policy "children_update_own" on public.children
  for update using (account_id = auth.uid()) with check (account_id = auth.uid());

drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own" on public.children
  for delete using (account_id = auth.uid());
