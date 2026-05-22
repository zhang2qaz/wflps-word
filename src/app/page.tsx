'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { useStore, selectStats, selectMistakeWords, selectNewWords } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';

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
  const childName = useStore(s => s.childName);
  const setChildName = useStore(s => s.setChildName);
  const [editingName, setEditingName] = useState(false);

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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-8 text-center max-w-sm w-full"
            style={{ background: 'var(--color-paper)' }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <div className="seal text-2xl mx-auto mb-4" style={{ width: 76, height: 76, fontSize: '1.7rem' }}>
              {milestone}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif-cn)' }}>
              里程碑达成！
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
              {childName ? `${childName}，你` : '你'}已经牢牢掌握了{' '}
              <b style={{ color: 'var(--color-vermilion)' }}>{milestone}</b> 个字 ——
              这都是你自己一个一个记下来的，了不起！
            </p>
            <button
              onClick={() => { setMilestoneSeen(milestone); setMilestone(null); }}
              className="px-6 py-2.5 rounded-md font-medium"
              style={{ background: 'var(--color-vermilion)', color: 'var(--color-paper)' }}
            >
              继续加油 →
            </button>
          </motion.div>
        </div>
      )}
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
                    WFLPS 国际部 P2 · 二下（已核对）· 三上 / 三下（统编版）
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

        {/* 学习路线图 */}
        <section className="mb-16">
          <h3 className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-vermilion)' }}>
            怎么学 · 学习路线
          </h3>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            这几个功能不是并排的、各管各的——它们是<b>一个循环</b>：
            刚学的新单元先点①，学过了用②检验，之后<b>每天打开先做③</b>。错的字会自动进错题本。
          </p>

          <div>
            {FLOW.map((s, i) => (
              <div key={s.href}>
                <Link
                  href={s.href}
                  className="flex items-center gap-4 border rounded-xl p-4 hover:shadow-md transition-all group"
                  style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper)' }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center text-2xl font-bold"
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: s.accent, color: 'var(--color-paper)',
                      fontFamily: 'var(--font-serif-cn)',
                    }}
                  >
                    {s.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>{s.title}</h2>
                      <span className="text-[11px]" style={{ color: s.accent }}>{s.tag}</span>
                    </div>
                    <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--color-ink-soft)' }}>{s.desc}</p>
                  </div>
                  <span className="flex-shrink-0 text-sm transition-transform group-hover:translate-x-1">开始 →</span>
                </Link>

                {/* 错题本 —— 听写之后的分支 */}
                {i === 1 && (
                  <div className="pl-8 mt-1">
                    <Link
                      href="/mistakes"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:shadow transition-all"
                      style={{ background: 'rgba(227,36,43,0.07)', border: '1px solid rgba(227,36,43,0.3)' }}
                    >
                      <span style={{ color: 'var(--color-cinnabar)' }}>↳ 错题本</span>
                      <span className="flex-1" style={{ color: 'var(--color-ink-soft)' }}>
                        听写、复习里写错的字自动收进来，重点重练
                      </span>
                      <span className="flex-shrink-0" style={{ color: 'var(--color-cinnabar)' }}>开始 →</span>
                    </Link>
                  </div>
                )}

                {i < FLOW.length - 1 && (
                  <div className="flex justify-center py-1.5">
                    <span style={{ color: 'var(--color-stone-dark)' }}>↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-xs mt-3" style={{ color: 'var(--color-ink-soft)' }}>
            🔁 学过的字会一次次循环回来，直到牢牢记住——这就是科学记忆。
          </div>

          {/* 古诗 · 句子 —— 平行轨道 */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--color-stone)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--color-ink-soft)' }}>另一类内容 · 同样三步</div>
            <Link
              href="/recite"
              className="flex items-center gap-4 border rounded-xl p-4 hover:shadow-md transition-all group"
              style={{ borderColor: 'var(--color-mustard)', background: 'rgba(224,163,42,0.07)' }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center text-2xl"
                style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-mustard)' }}
              >
                📜
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>古诗 · 句子</h2>
                <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--color-ink-soft)' }}>
                  古诗、课文长句——也是「学 → 默写 → 复习」，只是单独一页练。
                </p>
              </div>
              <span className="flex-shrink-0 text-sm transition-transform group-hover:translate-x-1">开始 →</span>
            </Link>
          </div>
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
