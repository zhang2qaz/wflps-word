'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';
import DailyDoodle from '@/components/DailyDoodle';
import { motion } from 'framer-motion';
import { useStore, selectStats, selectMistakeWords, selectNewWords } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';
import { useAccount } from '@/components/AccountProvider';

// 三步主循环：学 → 写 → 复习
const FLOW = [
  {
    n: 1,
    href: '/learn',
    title: '学新字',
    tag: '第一步 · 弄懂',
    desc: '第一次认识新词——把字拆成你已认识的部件，弄懂「为什么这样写」。',
    accent: 'var(--color-jade)',
  },
  {
    n: 2,
    href: '/dictate',
    title: '听写练习',
    tag: '第二步 · 检验',
    desc: '老师读、你写、自己对答案——检验是不是真的会写了。',
    accent: 'var(--color-vermilion)',
  },
  {
    n: 3,
    href: '/review',
    title: '今日复习',
    tag: '第三步 · 巩固',
    desc: '到点的字再默一遍——按遗忘曲线安排，防止忘掉。',
    accent: 'var(--color-mustard)',
  },
];

// 掌握字数里程碑 —— 到达就给孩子一个高光时刻
const MILESTONES = [10, 25, 50, 100, 150, 200, 300];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const stats = useStore(useShallow(selectStats));
  // 待复习 = 当前学习单元里到期的字（与复习页同口径）
  const dueCount = stats.due;
  const mistakeCount = useStore(s => selectMistakeWords(s).length);
  const newCount = useStore(s => selectNewWords(s).length);
  // 孩子名字来自账号档案（账号系统已采集）；本地模式回退到 store 里的名字
  const childName = useStore(s => s.childName);
  const acc = useAccount();
  const displayName =
    acc?.children.find((c) => c.id === acc.activeChildId)?.name || childName;

  // 里程碑高光：掌握字数跨过新台阶 → 弹出庆祝
  const milestoneSeen = useStore(s => s.milestoneSeen);
  const setMilestoneSeen = useStore(s => s.setMilestoneSeen);
  const [milestone, setMilestone] = useState<number | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const reached = MILESTONES.filter(m => stats.mastered >= m);
    const top = reached.length ? reached[reached.length - 1] : 0;
    if (top > milestoneSeen) setMilestone(top);
  }, [mounted, stats.mastered, milestoneSeen]);

  return (
    <div className="min-h-screen">
      <Nav />
      {milestone !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(26,32,48,0.55)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="glass-strong p-8 text-center max-w-sm w-full"
            style={{ borderRadius: 'var(--r-2xl)', boxShadow: 'var(--shadow-xl)' }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <div className="seal text-2xl mx-auto mb-4" style={{ width: 76, height: 76, fontSize: '1.7rem' }}>
              {milestone}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              里程碑达成！
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
              {displayName ? `${displayName}，你` : '你'}已经牢牢掌握了{' '}
              <b style={{ color: 'var(--color-vermilion)' }}>{milestone}</b> 个字 ——
              这都是你自己一个一个记下来的，了不起！
            </p>
            <button
              onClick={() => { setMilestoneSeen(milestone); setMilestone(null); }}
              className="btn btn-primary btn-lg"
            >
              继续加油 →
            </button>
          </motion.div>
        </div>
      )}
      <main className="max-w-2xl mx-auto px-5 pt-8 pb-10">
        {/* 每日 Doodle Hero —— 节日 / 季节主题插画 + 与今天相关的话 */}
        <DailyDoodle childName={displayName || undefined} />

        {/* Stats strip */}
        {mounted && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            <StatCard label="本单元待复习" value={dueCount} accent="var(--color-vermilion)" hint={dueCount > 0 ? '到点该默的字' : '暂时没有到期的'} />
            <StatCard label="已学" value={stats.learned} accent="var(--color-jade)" hint={`共 ${stats.total} 字`} />
            <StatCard label="已掌握" value={stats.mastered} accent="var(--color-mustard)" hint="连续答对 4+ 次" />
            <StatCard label="坚持天数" value={stats.streak} accent="var(--color-cinnabar)" hint="🔥 加油" />
          </section>
        )}

        {/* Recommend pill */}
        {mounted && (
          <RecommendBar dueCount={dueCount} mistakeCount={mistakeCount} newCount={newCount} />
        )}

        {/* 学习入口 —— iOS Settings 风分组列表 */}
        <section className="mb-10">
          <h3 className="text-[13px] uppercase tracking-wider mb-2 ml-4" style={{ color: 'var(--color-ink-soft)' }}>
            每天三步
          </h3>
          <div className="ios-list">
            {FLOW.map((s) => (
              <Link key={s.href} href={s.href} className="ios-row ios-chevron">
                <div
                  className="flex-shrink-0 flex items-center justify-center font-bold text-white"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: s.accent, fontSize: 17,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                  }}
                  aria-hidden
                >
                  {s.n}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-semibold leading-tight">{s.title}</div>
                  <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>{s.tag}</div>
                </div>
              </Link>
            ))}
            <Link href="/mistakes" className="ios-row ios-chevron">
              <div
                className="flex-shrink-0 flex items-center justify-center text-white"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--color-cinnabar)', fontSize: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
                aria-hidden
              >
                ✗
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold leading-tight">错题本</div>
                <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>写错的字自动进来重点重练</div>
              </div>
            </Link>
          </div>
        </section>

        {/* 写字 · 写作 —— 第二组列表 */}
        <section className="mb-10">
          <h3 className="text-[13px] uppercase tracking-wider mb-2 ml-4" style={{ color: 'var(--color-ink-soft)' }}>
            写字 · 写作
          </h3>
          <div className="ios-list">
            <Link href="/voice" className="ios-row ios-chevron">
              <div
                className="flex-shrink-0 flex items-center justify-center text-white"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--color-vermilion) 0%, var(--color-cinnabar) 100%)',
                  fontSize: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
                aria-hidden
              >
                🎙️
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold leading-tight">语音作文</div>
                <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>张嘴说,自动变文字 · 完全离线</div>
              </div>
            </Link>
            <Link href="/write" className="ios-row ios-chevron">
              <div
                className="flex-shrink-0 flex items-center justify-center text-white"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--color-vermilion)', fontSize: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
                aria-hidden
              >
                📝
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold leading-tight">作文本</div>
                <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>自由写作 + 自检清单 + 历史归档</div>
              </div>
            </Link>
            <Link href="/strokes" className="ios-row ios-chevron">
              <div
                className="flex-shrink-0 flex items-center justify-center text-white"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--color-jade)', fontSize: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
                aria-hidden
              >
                ✍️
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold leading-tight">笔顺挑战</div>
                <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>一笔一笔写,写错立刻提示</div>
              </div>
            </Link>
          </div>
        </section>

        {/* 古诗 —— 第三组 */}
        <section className="mb-10">
          <h3 className="text-[13px] uppercase tracking-wider mb-2 ml-4" style={{ color: 'var(--color-ink-soft)' }}>
            另一条线
          </h3>
          <div className="ios-list">
            <Link href="/recite" className="ios-row ios-chevron">
              <div
                className="flex-shrink-0 flex items-center justify-center text-white"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--color-mustard)', fontSize: 18,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
                aria-hidden
              >
                📜
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold leading-tight">古诗 · 句子</div>
                <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>整首默写,带逐句对照</div>
              </div>
            </Link>
          </div>
        </section>

        {/* 为什么这套方法管用 —— 折叠到底部,不抢主线 */}
        <details className="mb-8 ios-list">
          <summary className="ios-row cursor-pointer list-none">
            <div
              className="flex-shrink-0 flex items-center justify-center text-white"
              style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-vermilion)', fontSize: 18 }}
              aria-hidden
            >
              ？
            </div>
            <div className="flex-1 text-[17px] font-semibold">为什么这套方法管用</div>
            <span style={{ color: 'var(--color-stone-dark)', fontSize: '1.4rem', lineHeight: 1 }}>›</span>
          </summary>
          <div className="px-5 py-4 grid sm:grid-cols-2 gap-5 text-[14px] leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            <div><b style={{ color: 'var(--color-ink)' }}>精细编码 · 拆字</b><br/>把字拆成已认识的部件,把新知识挂在旧知识上——记忆科学里最高效的编码。</div>
            <div><b style={{ color: 'var(--color-ink)' }}>形声字规律</b><br/>八成汉字是形声字,学会规律,看到「拦挡摆排」就知道都和手有关。</div>
            <div><b style={{ color: 'var(--color-ink)' }}>主动回忆 + 间隔重复</b><br/>读 10 遍不如回想 1 遍。听写 + 艾宾浩斯曲线,长期保留远超抄写。</div>
            <div><b style={{ color: 'var(--color-ink)' }}>故事记成语</b><br/>亡羊补牢、揠苗助长本身就是故事。叙事记忆最牢固。</div>
          </div>
        </details>

        <footer className="text-center text-xs py-6" style={{ color: 'var(--color-ink-soft)' }}>
          每天 10 分钟,胜过周末突击 2 小时
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent, hint }: { label: string; value: number; accent: string; hint?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          aria-hidden
          className="inline-block"
          style={{ width: 8, height: 8, borderRadius: '50%', background: accent }}
        />
        <div className="text-[12px] font-medium" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
      </div>
      <div
        className="text-[32px] font-bold leading-none"
        style={{
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-display-sans)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {hint && <div className="text-[11px] mt-1.5" style={{ color: 'var(--color-ink-soft)' }}>{hint}</div>}
    </div>
  );
}

function RecommendBar({ dueCount, mistakeCount, newCount }: { dueCount: number; mistakeCount: number; newCount: number }) {
  let action: { href: string; label: string; reason: string };
  if (dueCount > 0) {
    action = { href: '/review', label: `去复习本单元 ${dueCount} 个到期的字 →`, reason: '本单元有字到点了，先默一遍最高效' };
  } else if (mistakeCount > 0) {
    action = { href: '/mistakes', label: `攻克 ${mistakeCount} 个错题 →`, reason: '错题本里的字需要重点强化' };
  } else if (newCount > 0) {
    action = { href: '/learn', label: '学几个新字 →', reason: '没有到期复习，正好认识新朋友' };
  } else {
    action = { href: '/progress', label: '看看进度 →', reason: '所有字都已掌握，看看战果' };
  }

  return (
    <Link
      href={action.href}
      className="card-hover mb-10 flex items-center justify-between gap-4 p-5"
      style={{
        background: 'linear-gradient(135deg, var(--color-vermilion) 0%, #2e4ab8 100%)',
        color: '#ffffff',
        borderRadius: 'var(--r-2xl)',
        boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      <div>
        <div className="text-[12px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          推荐 · 现在做这个
        </div>
        <div className="text-[19px] font-semibold leading-tight">{action.label}</div>
        <div className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{action.reason}</div>
      </div>
      <div
        className="flex-shrink-0 flex items-center justify-center font-bold"
        style={{
          width: 56, height: 56, borderRadius: 18,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          fontSize: 28,
          fontFamily: 'var(--font-serif-cn)',
        }}
      >
        →
      </div>
    </Link>
  );
}

