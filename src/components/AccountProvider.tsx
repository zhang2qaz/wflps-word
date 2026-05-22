'use client';

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { initSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

// ============================================================
// 账号系统 —— 多家庭注册登录 + 学习数据云同步
// 没配 Supabase 时自动退回「纯本地」模式，产品照常可用。
// ============================================================

type Child = { id: string; name: string };

type AccountValue = {
  cloud: boolean;                 // 是否启用了账号系统
  email: string | null;
  children: Child[];
  activeChildId: string | null;
  switchChild: (id: string) => Promise<void>;
  addChild: (name: string, importLocal: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AccountCtx = createContext<AccountValue | null>(null);
export function useAccount() { return useContext(AccountCtx); }

// ---- 学习数据 ↔ Zustand store ----
function extractStudyBlob() {
  const s = useStore.getState();
  return {
    progress: s.progress,
    history: s.history,
    childName: s.childName,
    customWords: s.customWords,
    milestoneSeen: s.milestoneSeen,
  };
}
function loadStudyBlob(data: Record<string, unknown>) {
  const s = useStore.getState();
  useStore.setState({
    progress: (data.progress as typeof s.progress) ?? {},
    history: (data.history as typeof s.history) ?? [],
    childName: (data.childName as string) ?? '',
    customWords: (data.customWords as typeof s.customWords) ?? [],
    milestoneSeen: (data.milestoneSeen as number) ?? 0,
  });
}

type Phase = 'loading' | 'local' | 'auth' | 'no-child' | 'ready';

export default function AccountProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [sb, setSb] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const loadingChild = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. 取运行时配置 → 决定走云端还是纯本地
  useEffect(() => {
    let cancelled = false;
    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cancelled) return;
        if (cfg?.supabaseUrl && cfg?.supabaseAnonKey) {
          setSb(initSupabase(cfg.supabaseUrl, cfg.supabaseAnonKey));
        } else {
          setPhase('local');
        }
      })
      .catch(() => { if (!cancelled) setPhase('local'); });
    return () => { cancelled = true; };
  }, []);

  // 把某个孩子的数据载入 store
  const activateChild = useCallback(async (client: SupabaseClient, id: string) => {
    loadingChild.current = true;
    const { data } = await client.from('children').select('data').eq('id', id).single();
    loadStudyBlob((data?.data ?? {}) as Record<string, unknown>);
    setActiveChildId(id);
    try { localStorage.setItem('moxie-active-child', id); } catch {}
    setTimeout(() => { loadingChild.current = false; }, 80);
  }, []);

  // 2. Supabase 就绪 → 跟踪登录会话
  useEffect(() => {
    if (!sb) return;
    let cancelled = false;
    const apply = async (s: Session | null) => {
      if (cancelled) return;
      setSession(s);
      if (!s) {
        setChildList([]);
        setActiveChildId(null);
        setPhase('auth');
        return;
      }
      const { data } = await sb.from('children').select('id,name').order('created_at');
      if (cancelled) return;
      const list = (data ?? []) as Child[];
      setChildList(list);
      if (list.length === 0) { setPhase('no-child'); return; }
      let saved: string | null = null;
      try { saved = localStorage.getItem('moxie-active-child'); } catch {}
      const pick = list.find((c) => c.id === saved)?.id ?? list[0].id;
      await activateChild(sb, pick);
      if (!cancelled) setPhase('ready');
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => apply(s));
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [sb, activateChild]);

  // 3. store 变化 → 防抖同步到云端
  useEffect(() => {
    if (!sb || !activeChildId) return;
    const unsub = useStore.subscribe(() => {
      if (loadingChild.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void sb
          .from('children')
          .update({ data: extractStudyBlob(), updated_at: new Date().toISOString() })
          .eq('id', activeChildId);
      }, 1500);
    });
    return () => { unsub(); if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [sb, activeChildId]);

  const switchChild = useCallback(async (id: string) => {
    if (!sb || id === activeChildId) return;
    await activateChild(sb, id);
  }, [sb, activeChildId, activateChild]);

  const addChild = useCallback(async (name: string, importLocal: boolean) => {
    if (!sb) return;
    const seed = importLocal ? extractStudyBlob() : {};
    const { data, error } = await sb
      .from('children')
      .insert({ name: name.trim() || '我的孩子', data: seed })
      .select('id,name')
      .single();
    if (error || !data) throw error ?? new Error('创建失败');
    const child = data as Child;
    setChildList((prev) => [...prev, child]);
    await activateChild(sb, child.id);
    setPhase('ready');
  }, [sb, activateChild]);

  const signOut = useCallback(async () => {
    if (!sb) return;
    try { localStorage.removeItem('moxie-active-child'); } catch {}
    await sb.auth.signOut();
  }, [sb]);

  if (phase === 'loading') return <Splash />;
  if (phase === 'auth' && sb) return <AuthForm sb={sb} />;
  if (phase === 'no-child') return <CreateChildForm firstChild onCreate={addChild} />;

  return (
    <AccountCtx.Provider
      value={{
        cloud: !!sb,
        email: session?.user?.email ?? null,
        children: childList,
        activeChildId,
        switchChild,
        addChild,
        signOut,
      }}
    >
      {children}
    </AccountCtx.Provider>
  );
}

// ============================================================
// 加载 / 登录注册 / 建孩子 —— 全屏卡片
// ============================================================

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--color-paper)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-7"
        style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-stone-dark)' }}
      >
        {children}
      </div>
    </div>
  );
}

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-paper)' }}>
      <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>加载中…</div>
    </div>
  );
}

function AuthForm({ sb }: { sb: SupabaseClient }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    setErr(''); setInfo('');
    if (!email.trim() || !pw) { setErr('请填写邮箱和密码'); return; }
    setBusy(true);
    try {
      if (mode === 'register') {
        const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pw });
        if (error) throw error;
        if (!data.session) {
          setInfo('注册成功！请到邮箱点开验证链接，然后回来登录。');
          setMode('login');
        }
        // 有 session 时 onAuthStateChange 会自动进入下一步
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) throw error;
      }
    } catch (e) {
      setErr((e as Error).message || '出错了，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className="text-center mb-6">
        <div className="seal text-2xl mx-auto mb-3" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>默</div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>世外默写本</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          {mode === 'login' ? '登录你的账号' : '注册一个新账号'}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none"
          style={{ borderColor: 'var(--color-stone-dark)' }}
        />
        <input
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'login' ? '密码' : '设置密码（至少 6 位）'}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none"
          style={{ borderColor: 'var(--color-stone-dark)' }}
        />
      </div>

      {err && <p className="text-xs mt-3" style={{ color: 'var(--color-cinnabar)' }}>{err}</p>}
      {info && <p className="text-xs mt-3" style={{ color: 'var(--color-jade)' }}>{info}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full mt-5 py-2.5 rounded-md font-medium disabled:opacity-50"
        style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
      >
        {busy ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
      </button>

      <button
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); setInfo(''); }}
        className="w-full mt-3 text-xs underline"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        {mode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
      </button>
    </Shell>
  );
}

function CreateChildForm({
  firstChild, onCreate,
}: { firstChild: boolean; onCreate: (name: string, importLocal: boolean) => Promise<void> }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [hasLocal] = useState(() => {
    try { return Object.keys(useStore.getState().progress).length > 0; } catch { return false; }
  });
  const [importLocal, setImportLocal] = useState(hasLocal);

  const create = async () => {
    if (!name.trim()) { setErr('请给孩子起个名字'); return; }
    setErr(''); setBusy(true);
    try {
      await onCreate(name, firstChild && importLocal);
    } catch (e) {
      setErr((e as Error).message || '创建失败，请重试');
      setBusy(false);
    }
  };

  return (
    <Shell>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🧒</div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>
          给孩子建一个学习档案
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
          每个孩子各自独立的进度、错题、复习计划
        </p>
      </div>

      <input
        type="text"
        placeholder="孩子的名字（如：小明）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none"
        style={{ borderColor: 'var(--color-stone-dark)', fontFamily: 'var(--font-serif-cn)' }}
      />

      {firstChild && hasLocal && (
        <label className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--color-ink-soft)' }}>
          <input type="checkbox" checked={importLocal} onChange={(e) => setImportLocal(e.target.checked)} />
          把这台设备上已有的学习记录，导入给这个孩子
        </label>
      )}

      {err && <p className="text-xs mt-3" style={{ color: 'var(--color-cinnabar)' }}>{err}</p>}

      <button
        onClick={create}
        disabled={busy}
        className="w-full mt-5 py-2.5 rounded-md font-medium disabled:opacity-50"
        style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
      >
        {busy ? '创建中…' : '开始学习 →'}
      </button>
    </Shell>
  );
}
