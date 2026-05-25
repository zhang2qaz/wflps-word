'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';
import DailyDoodle from '@/components/DailyDoodle';
import BookPicker from '@/components/BookPicker';
import { motion } from 'framer-motion';
import { useStore, selectStats, selectMistakeWords, selectNewWords } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';
import { useAccount } from '@/components/AccountProvider';

// 三大分组(顺序就是孩子学习的顺序):
// 1️⃣ 核心学习: 学字词 → 学句子 → 学古诗
// 2️⃣ 检验巩固: 听写 → 错题集合
// 3️⃣ 写作: 作文本 + 语音作文(独立位置)
type Entry = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  accent: string;
};

const STUDY: Entry[] = [
  {
    href: '/learn',
    emoji: '字',
    title: '学字词',
    desc: '本课新词 —— 拆字 · 形声 · 故事记忆',
    accent: 'var(--color-jade)',
  },
  {
    href: '/recite?kind=sentences',
    emoji: '句',
    title: '学句子',
    desc: '课文关键句 —— 现代汉语 + 文言文',
    accent: 'var(--color-mustard)',
  },
  {
    href: '/recite?kind=poems',
    emoji: '诗',
    title: '学古诗',
    desc: '整首背 + 一句一句默写',
    accent: 'var(--color-cinnabar)',
  },
];

const PRACTICE: Entry[] = [
  {
    href: '/dictate',
    emoji: '✎',
    title: '听写',
    desc: '老师读 · 你写 · 自动对答案',
    accent: 'var(--color-vermilion)',
  },
  {
    href: '/mistakes',
    emoji: '✗',
    title: '错题集合',
    desc: '写错的字 · 自动归集 · 重点重练',
    accent: 'var(--color-cinnabar)',
  },
];

const WRITING: Entry[] = [
  {
    href: '/write',
    emoji: '📝',
    title: '作文本',
    desc: '自由写作 + 自检清单 + 历史归档',
    accent: 'var(--color-vermilion)',
  },
  {
    href: '/voice',
    emoji: '🎙️',
    title: '语音作文',
    desc: '张嘴说,自动变文字 · 完全离线',
    accent: 'var(--color-cinnabar)',
  },
];

// 「里程碑数列」按当前课本总字数动态生成 —— 二下 200 字 vs 六上 400 字时,顶峰高度要不同
function buildMilestones(total: number): number[] {
  if (total <= 0) return [];
  // 大致 5 档:25% / 50% / 75% / 90% / 100%,并补 10 / 25 启动档
  const seeds = [10, 25, Math.round(total * 0.25), Math.round(total * 0.5),
                 Math.round(total * 0.75), Math.round(total * 0.9), total];
  return Array.from(new Set(seeds.filter(n => n > 0))).sort((a, b) => a - b);
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const selectedBook = useStore(s => s.selectedBook);
  const stats = useStore(useShallow(selectStats));
  const dueCount = stats.due;
  const mistakeCount = useStore(s => selectMistakeWords(s).length);
  const newCount = useStore(s => selectNewWords(s).length);
  const childName = useStore(s => s.childName);
  const acc = useAccount();
  const displayName =
    acc?.children.find((c) => c.id === acc.activeChildId)?.name || childName;

  // 里程碑庆祝 —— 按当前课本总字数计算
  const milestoneSeen = useStore(s => s.milestoneSeen);
  const setMilestoneSeen = useStore(s => s.setMilestoneSeen);
  const [milestone, setMilestone] = useState<number | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const milestones = buildMilestones(stats.total);
    const reached = milestones.filter(m => stats.mastered >= m);
    const top = reached.length ? reached[reached.length - 1] : 0;
    if (top > milestoneSeen) setMilestone(top);
  }, [mounted, stats.mastered, stats.total, milestoneSeen]);

  // SSR 一致性:挂载前不读 store(zustand persist 客户端独有)
  if (!mounted) {
    return (
      <div className="min-h-screen">
        <Nav />
      </div>
    );
  }

  // 还没选课本 → 全屏选课本
  if (!selectedBook) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="pt-2">
          <BookPicker />
        </main>
      </div>
    );
  }

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
              里程碑达成!
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
              {displayName ? `${displayName},你` : '你'}已经牢牢掌握了{' '}
              <b style={{ color: 'var(--color-vermilion)' }}>{milestone}</b> 个字 ——
              这都是你自己一个一个记下来的,了不起!
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
        <DailyDoodle childName={displayName || undefined} />

        {/* Stats strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <StatCard label="本单元待复习" value={dueCount} accent="var(--color-vermilion)" hint={dueCount > 0 ? '到点该默的字' : '暂时没有到期的'} />
          <StatCard label="已学" value={stats.learned} accent="var(--color-jade)" hint={`共 ${stats.total} 字`} />
          <StatCard label="已掌握" value={stats.mastered} accent="var(--color-mustard)" hint="连续答对 4+ 次" />
          <StatCard label="坚持天数" value={stats.streak} accent="var(--color-cinnabar)" hint="🔥 加油" />
        </section>

        {/* Recommend pill */}
        <RecommendBar dueCount={dueCount} mistakeCount={mistakeCount} newCount={newCount} />

        {/* 1️⃣ 核心学习 —— 学字 · 学句 · 学诗 */}
        <FlowSection
          step="1"
          stepLabel="第一步 · 学"
          heading="核心学习"
          intro="先弄懂今天要学的内容 —— 字 → 句 → 诗。"
          entries={STUDY}
        />

        {/* 2️⃣ 检验巩固 —— 听写 + 错题 */}
        <FlowSection
          step="2"
          stepLabel="第二步 · 检验"
          heading="检验巩固"
          intro="学完之后,听写一遍看真的会了没;错的字进错题本重点重练。"
          entries={PRACTICE}
        />

        {/* 3️⃣ 写作 —— 单独位置 */}
        <FlowSection
          step="3"
          stepLabel="另起一行 · 写作"
          heading="写作"
          intro="不用每天做,但每周写一次 —— 把学过的字句变成自己的话。"
          entries={WRITING}
          accent="var(--color-vermilion)"
        />

        <details className="mb-8 ios-list">
          <summary className="ios-row cursor-pointer list-none">
            <div
              className="flex-shrink-0 flex items-center justify-center text-white"
              style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-vermilion)', fontSize: 18 }}
              aria-hidden
            >
              ?
            </div>
            <div className="flex-1 text-[17px] font-semibold">为什么这套方法管用</div>
            <span style={{ color: 'var(--color-stone-dark)', fontSize: '1.4rem', lineHeight: 1 }}>›</span>
          </summary>
          <div className="px-5 py-4 grid sm:grid-cols-2 gap-5 text-[14px] leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            <div><b style={{ color: 'var(--color-ink)' }}>精细编码 · 拆字</b><br/>把字拆成已认识的部件,把新知识挂在旧知识上 —— 记忆科学里最高效的编码。</div>
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

function FlowSection({
  step, stepLabel, heading, intro, entries, accent,
}: {
  step: string;
  stepLabel: string;
  heading: string;
  intro: string;
  entries: Entry[];
  accent?: string;
}) {
  return (
    <section className="mb-9">
      <div className="flex items-baseline gap-3 mb-1 ml-1">
        <div
          className="flex-shrink-0 flex items-center justify-center font-bold text-white"
          style={{
            width: 24, height: 24, borderRadius: 7,
            background: accent ?? 'var(--color-ink)',
            fontSize: 13,
          }}
          aria-hidden
        >
          {step}
        </div>
        <h3 className="text-[15px] font-semibold tracking-wide" style={{ color: 'var(--color-ink)' }}>
          {heading}
        </h3>
        <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-ink-soft)' }}>
          {stepLabel}
        </span>
      </div>
      <p className="text-[13px] mb-2 ml-1 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
        {intro}
      </p>
      <div className="ios-list">
        {entries.map(e => (
          <Link key={e.href} href={e.href} className="ios-row ios-chevron">
            <div
              className="flex-shrink-0 flex items-center justify-center font-bold text-white"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: e.accent, fontSize: 17,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
                fontFamily: 'var(--font-serif-cn)',
              }}
              aria-hidden
            >
              {e.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-semibold leading-tight">{e.title}</div>
              <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-ink-soft)' }}>{e.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
    action = { href: '/review', label: `去复习本单元 ${dueCount} 个到期的字 →`, reason: '本单元有字到点了,先默一遍最高效' };
  } else if (mistakeCount > 0) {
    action = { href: '/mistakes', label: `攻克 ${mistakeCount} 个错题 →`, reason: '错题本里的字需要重点强化' };
  } else if (newCount > 0) {
    action = { href: '/learn', label: '学几个新字 →', reason: '没有到期复习,正好认识新朋友' };
  } else {
    action = { href: '/progress', label: '看看进度 →', reason: '所有字都已掌握,看看战果' };
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
