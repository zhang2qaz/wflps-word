'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { useStore, selectStats, selectDueWords, selectMistakeWords, selectNewWords } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';

const MODES = [
  {
    href: '/learn',
    title: '学新字',
    sub: '认词 → 拆字 → 记法 → 运用',
    desc: '不靠死记硬背。把陌生字拆成你已认识的部件，弄懂形声字规律、关联字族、用故事记成语 — 弄懂「为什么这样写」，记得又快又牢。',
    accent: 'var(--color-jade)',
    method: '精细编码',
  },
  {
    href: '/dictate',
    title: '听写练习',
    sub: '老师读 · 你写 · 自动批改',
    desc: '像在课堂上一样：老师读一个词，你在田字格里写，写完一对照就知道对错。',
    accent: 'var(--color-vermilion)',
    method: '主动回忆',
  },
  {
    href: '/recite',
    title: '古诗 · 句子',
    sub: '读懂诗意 · 逐句默写',
    desc: '古诗先读懂意思再一句一句默写；课文长句听一整句写下来，标点也不漏。',
    accent: 'var(--color-mustard)',
    method: '分块记忆',
  },
  {
    href: '/review',
    title: '今日复习',
    sub: '按时间到点的字，必复习',
    desc: '艾宾浩斯遗忘曲线告诉我们：复习时间点比次数更重要。每天来一会儿，比临时抱佛脚强 10 倍。',
    accent: 'var(--color-mustard)',
    method: '间隔重复',
  },
  {
    href: '/mistakes',
    title: '错题本',
    sub: '只攻克那些总忘的字',
    desc: '错过的字会被自动收进错题本，重点重复，直到熟练为止。',
    accent: 'var(--color-cinnabar)',
    method: '错误强化',
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const stats = useStore(useShallow(selectStats));
  const dueCount = useStore(s => selectDueWords(s).length);
  const mistakeCount = useStore(s => selectMistakeWords(s).length);
  const newCount = useStore(s => selectNewWords(s).length);
  const childName = useStore(s => s.childName);
  const setChildName = useStore(s => s.setChildName);
  const [editingName, setEditingName] = useState(false);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-5 py-10">
        {/* Hero */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-start gap-6 flex-wrap"
          >
            <div className="flex-1 min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <Logo size={48} />
                <div className="flex flex-col gap-1">
                  <span
                    className="text-[11px] tracking-wide px-2 py-0.5 rounded self-start"
                    style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
                  >
                    上海市世界外国语小学 · 校本版
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                    WFLPS 国际部 P2 · 二年级下册（第五、六单元）
                  </span>
                </div>
              </div>
              <h1
                className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4"
                style={{ fontFamily: 'var(--font-serif-cn)' }}
              >
                弄懂一个字，
                <br />
                <span className="brush-underline">才记得住一个字</span>。
              </h1>
              <p className="text-ink-soft text-base md:text-lg leading-relaxed max-w-xl" style={{ color: 'var(--color-ink-soft)' }}>
                这不是机械的抄写练习。<br />
                它把每个字<b>拆成你已认识的部件</b>，讲清形声字规律、关联字族、用故事记成语，
                再用 <b>艾宾浩斯间隔重复</b> 安排复习 — 让孩子用最少的时间真正记牢。
              </p>
            </div>
            {/* Right: Greeting / name */}
            <div
              className="border border-stone rounded-xl p-5 min-w-[240px]"
              style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
            >
              {!editingName && childName ? (
                <>
                  <div className="text-xs text-ink-soft mb-1" style={{ color: 'var(--color-ink-soft)' }}>欢迎回来</div>
                  <div className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                    {childName} 小朋友
                  </div>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs underline text-ink-soft"
                    style={{ color: 'var(--color-ink-soft)' }}
                  >
                    换一个名字
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs text-ink-soft mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                    叫什么名字呢？
                  </div>
                  <input
                    autoFocus={editingName}
                    type="text"
                    placeholder="比如：小明"
                    defaultValue={childName}
                    onBlur={(e) => {
                      setChildName(e.target.value.trim() || '同学');
                      setEditingName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="w-full border-b-2 border-ink bg-transparent text-2xl py-1 outline-none"
                    style={{ borderColor: 'var(--color-ink)', fontFamily: 'var(--font-serif-cn)' }}
                  />
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* Stats strip */}
        {mounted && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            <StatCard label="今日待复习" value={dueCount} accent="var(--color-vermilion)" hint={dueCount > 0 ? '到点的字' : '今天没有到期的'} />
            <StatCard label="已学" value={stats.learned} accent="var(--color-jade)" hint={`共 ${stats.total} 字`} />
            <StatCard label="已掌握" value={stats.mastered} accent="var(--color-mustard)" hint="连续答对 4+ 次" />
            <StatCard label="坚持天数" value={stats.streak} accent="var(--color-cinnabar)" hint="🔥 加油" />
          </section>
        )}

        {/* Recommend pill */}
        {mounted && (
          <RecommendBar dueCount={dueCount} mistakeCount={mistakeCount} newCount={newCount} />
        )}

        {/* Modes */}
        <section className="grid md:grid-cols-2 gap-4 mb-16">
          {MODES.map((m, i) => (
            <motion.div
              key={m.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <Link
                href={m.href}
                className="block border border-stone rounded-xl p-6 hover:shadow-lg transition-all group relative overflow-hidden"
                style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: m.accent }}
                />
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>{m.title}</h2>
                  <span
                    className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded"
                    style={{ background: m.accent, color: 'var(--color-paper)' }}
                  >
                    {m.method}
                  </span>
                </div>
                <div className="text-sm text-ink-soft mb-3 tracking-wide" style={{ color: 'var(--color-ink-soft)' }}>{m.sub}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>{m.desc}</p>
                <div className="mt-4 text-sm font-medium flex items-center gap-1 transition-transform group-hover:translate-x-1">
                  开始 →
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Method explainer */}
        <section className="border-t border-stone pt-10 mb-16" style={{ borderColor: 'var(--color-stone)' }}>
          <h3 className="text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--color-vermilion)' }}>
            为什么这套方法管用
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MethodCard
              n="01"
              title="精细编码 · 拆字"
              body="孤立地记一个字最难。把字拆成已认识的部件（堵 = 土 + 者），把新知识挂在旧知识上 — 这叫精细编码，是记忆科学里最高效的编码方式。"
            />
            <MethodCard
              n="02"
              title="形声字规律"
              body="八成汉字是形声字：一半表意思、一半表读音。教会孩子这个规律，他看到「拦、挡、摆、排」就知道都和手有关 — 学一个，会一串。"
            />
            <MethodCard
              n="03"
              title="主动回忆 + 间隔重复"
              body="读 10 遍不如回想 1 遍。听写就是主动回忆；再按艾宾浩斯曲线在快遗忘时复习。两者结合，长期保留率远超反复抄写。"
            />
            <MethodCard
              n="04"
              title="故事记成语"
              body="成语别拆字硬背。亡羊补牢、揠苗助长本身就是寓言 — 记住故事，四个字自然记住。叙事记忆是大脑最牢固的记忆。"
            />
          </div>
        </section>

        <footer className="text-center text-xs py-8" style={{ color: 'var(--color-ink-soft)' }}>
          <div className="mb-1">每天 10 分钟，胜过周末突击 2 小时。</div>
          <div style={{ color: 'var(--color-stone-dark)' }}>
            上海市世界外国语小学 · 国际部 P2 · 校本定制版
          </div>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent, hint }: { label: string; value: number; accent: string; hint?: string }) {
  return (
    <div
      className="border border-stone rounded-xl p-4"
      style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
    >
      <div className="text-xs text-ink-soft mb-1" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
      <div className="text-3xl font-bold" style={{ color: accent, fontFamily: 'var(--font-serif-cn)' }}>{value}</div>
      {hint && <div className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>{hint}</div>}
    </div>
  );
}

function RecommendBar({ dueCount, mistakeCount, newCount }: { dueCount: number; mistakeCount: number; newCount: number }) {
  let action: { href: string; label: string; reason: string };
  if (dueCount > 0) {
    action = { href: '/review', label: `去复习 ${dueCount} 个到期的字 →`, reason: '到点的字最容易忘，先复习这些最高效' };
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
      className="mb-10 flex items-center justify-between gap-4 p-5 rounded-xl border-2 hover:shadow-md transition-all"
      style={{ borderColor: 'var(--color-vermilion)', background: 'var(--color-paper-warm)' }}
    >
      <div>
        <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-vermilion)' }}>
          智能推荐
        </div>
        <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>{action.label}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>{action.reason}</div>
      </div>
      <div
        className="seal text-base flex-shrink-0 glow-vermilion"
        style={{ width: 56, height: 56, fontSize: '1.5rem' }}
      >
        开
      </div>
    </Link>
  );
}

function MethodCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-vermilion)', fontFamily: 'var(--font-serif-cn)' }}>
        {n}
      </div>
      <h4 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>{body}</p>
    </div>
  );
}
