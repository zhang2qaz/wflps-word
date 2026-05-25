'use client';

import { useMemo } from 'react';
import Nav from '@/components/Nav';
import { useStore, selectStats } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { unitGroups, reciteRefs, books, getPoem, getSentence } from '@/data/vocabulary';
import { isMastered } from '@/lib/srs';

export default function ProgressPage() {
  const stats = useStore(useShallow(selectStats));
  const progress = useStore(s => s.progress);
  const history = useStore(s => s.history);
  const childName = useStore(s => s.childName);
  const customWords = useStore(useShallow(s => s.customWords));
  const selectedBook = useStore(s => s.selectedBook);
  const reset = useStore(s => s.reset);

  const last7 = useMemo(() => {
    const days: { date: string; reviewed: number; learned: number; correct: number; wrong: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const h = history.find(x => x.date === key);
      days.push({
        date: key,
        reviewed: h?.reviewed ?? 0,
        learned: h?.learned ?? 0,
        correct: h?.correct ?? 0,
        wrong: h?.wrong ?? 0,
      });
    }
    return days;
  }, [history]);

  const maxBar = Math.max(1, ...last7.map(d => d.reviewed + d.learned));

  // 家长报告也按 selectedBook 过滤 —— 只看当前课本进度,不混跨年级数据
  const bookList = useMemo(() => {
    const all = books();
    if (!selectedBook) return all;
    return all.filter(b => b.grade === selectedBook.grade && b.semester === selectedBook.semester);
  }, [selectedBook]);

  const unitProgress = useMemo(() => {
    const rows: { label: string; total: number; learned: number; mastered: number }[] = [];
    for (const b of bookList) {
      for (const g of unitGroups(b.grade, b.semester)) {
        const words = g.lessons.flatMap(l => l.words);
        const learned = words.filter(w => progress[w.id]?.lastReview).length;
        const mastered = words.filter(w => {
          const p = progress[w.id];
          return p ? isMastered(p) : false;
        }).length;
        rows.push({
          label: selectedBook
            ? `第${g.unit}单元 · ${g.unitTitle}`
            : `${b.label} 第${g.unit}单元 · ${g.unitTitle}`,
          total: words.length, learned, mastered,
        });
      }
    }
    // 自定义词单只在「全课本」视图显示(否则归不到具体课本里)
    if (!selectedBook && customWords.length > 0) {
      const learned = customWords.filter(w => progress[w.id]?.lastReview).length;
      const mastered = customWords.filter(w => {
        const p = progress[w.id];
        return p ? isMastered(p) : false;
      }).length;
      rows.push({ label: '我导入的词单', total: customWords.length, learned, mastered });
    }
    return rows;
  }, [progress, customWords, bookList, selectedBook]);

  const reciteProgress = useMemo(() => {
    return reciteRefs()
      .filter(r => {
        if (!selectedBook) return true;
        const poem = getPoem(r.id);
        const sent = poem ? undefined : getSentence(r.id);
        const ref = poem ?? sent;
        return !!ref && (ref.grade ?? 2) === selectedBook.grade && ref.semester === selectedBook.semester;
      })
      .map(r => {
        const p = progress[r.id];
        let statusLabel = '未学', statusColor = '#5b6478';
        if (p && p.lastReview !== 0) {
          if (isMastered(p)) { statusLabel = '已掌握'; statusColor = '#2d8a6f'; }
          else if (p.nextDue <= Date.now()) { statusLabel = '待复习'; statusColor = '#21348c'; }
          else { statusLabel = '学习中'; statusColor = '#e0a32a'; }
        }
        return {
          id: r.id, kind: r.kind, title: r.title,
          correct: p?.correct ?? 0, wrong: p?.wrong ?? 0,
          statusLabel, statusColor,
        };
      });
  }, [progress, selectedBook]);

  const accuracy7d = (() => {
    const c = last7.reduce((s, d) => s + d.correct, 0);
    const w = last7.reduce((s, d) => s + d.wrong, 0);
    return c + w === 0 ? null : Math.round((c / (c + w)) * 100);
  })();

  // 导出 / 导入学习存档（本地数据备份）
  const exportData = () => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('moxie-dashi') ?? '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `世外默写本-存档-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) throw new Error('bad');
        window.localStorage.setItem('moxie-dashi', text);
        alert('存档已导入，页面将刷新。');
        window.location.reload();
      } catch {
        alert('这个文件无法识别，请选择本应用导出的 .json 存档。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-vermilion)' }}>
            家长报告
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>
            {childName || '孩子'} 的学习档案
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            算法在后台跟踪每个字的「记忆强度」 — 不再让孩子背 1000 遍学过的字，只盯快要忘的。
          </p>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          <Kpi label="坚持天数" value={stats.streak} unit="天" accent="var(--color-cinnabar)" />
          <Kpi label="已学" value={stats.learned} unit={`/ ${stats.total}`} accent="var(--color-jade)" />
          <Kpi label="已掌握" value={stats.mastered} unit="字" accent="var(--color-mustard)" />
          <Kpi label="本单元待复习" value={stats.due} unit="字" accent="var(--color-vermilion)" />
          <Kpi label="近 7 日正确率" value={accuracy7d ?? '—'} unit={accuracy7d != null ? '%' : ''} accent="var(--color-ink)" />
        </section>

        {/* 7-day activity */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>近 7 日活跃度</h2>
          <div className="flex items-end gap-2 h-32 border-b pl-1" style={{ borderColor: 'var(--color-stone-dark)' }}>
            {last7.map((d, i) => {
              const total = d.reviewed + d.learned;
              const h = total === 0 ? 4 : Math.max(8, (total / maxBar) * 110);
              const day = new Date(d.date).toLocaleDateString('zh-CN', { weekday: 'short' });
              const today = i === 6;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div className="text-[10px]" style={{ color: 'var(--color-ink-soft)' }}>
                    {total > 0 ? total : ''}
                  </div>
                  <div
                    className="w-full max-w-[40px] rounded-t"
                    style={{
                      height: h,
                      background: today
                        ? 'var(--color-vermilion)'
                        : total === 0
                          ? 'var(--color-stone)'
                          : 'var(--color-jade)',
                    }}
                  />
                  <div className="text-[10px]" style={{ color: today ? 'var(--color-vermilion)' : 'var(--color-ink-soft)' }}>
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--color-ink-soft)' }}>
            柱子越高，表示当天练得越多。让孩子保持「每天少量」比「周末突击」效果好得多。
          </p>
        </section>

        {/* Per-unit mastery */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>各单元掌握情况</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {unitProgress.map(u => (
              <div
                key={u.label}
                className="p-3 rounded-lg border"
                style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
              >
                <div className="flex items-baseline justify-between mb-2 gap-2">
                  <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                    {u.label}
                  </div>
                  <div className="text-xs flex-shrink-0" style={{ color: 'var(--color-ink-soft)' }}>
                    {u.mastered}/{u.total}
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--color-stone)' }}>
                  <div style={{ width: `${(u.mastered / u.total) * 100}%`, background: 'var(--color-jade)' }} />
                  <div style={{ width: `${((u.learned - u.mastered) / u.total) * 100}%`, background: 'var(--color-mustard)' }} />
                </div>
                <div className="text-[10px] mt-1 flex gap-3" style={{ color: 'var(--color-ink-soft)' }}>
                  <span>● 已掌握 {u.mastered}</span>
                  <span>● 学习中 {u.learned - u.mastered}</span>
                  <span>○ 未学 {u.total - u.learned}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 古诗 · 句子 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>古诗 · 句子背默</h2>
          <div className="space-y-2">
            {reciteProgress.map(r => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}
              >
                <span className="text-lg flex-shrink-0">{r.kind === 'poem' ? '📜' : '✍️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-serif-cn)' }}>
                    {r.title}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--color-ink-soft)' }}>
                    {r.kind === 'poem' ? '古诗' : '句子'} · 默对 {r.correct} 次 · 默错 {r.wrong} 次
                  </div>
                </div>
                <span
                  className="text-xs flex-shrink-0 px-2 py-0.5 rounded"
                  style={{
                    background: r.statusColor + '22',
                    color: r.statusColor,
                  }}
                >
                  {r.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Insights */}
        <section className="mb-10 p-5 rounded-xl border-2" style={{ borderColor: 'var(--color-mustard)', background: 'var(--color-paper-warm)' }}>
          <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-serif-cn)' }}>给家长的建议</h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            {generateInsights({ stats, accuracy7d, last7 }).map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: 'var(--color-vermilion)' }}>·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 学习存档 */}
        <section className="mb-10 p-5 rounded-xl border" style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}>
          <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-serif-cn)' }}>学习存档</h2>
          <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            学习数据只保存在<b>这台设备的浏览器</b>里。换设备、或清理浏览器数据前，请先
            <b>导出备份</b>；到新设备打开本应用后再<b>导入</b>即可恢复。
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={exportData}
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              ⬇ 导出存档
            </button>
            <label
              className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer border"
              style={{ borderColor: 'var(--color-stone-dark)' }}
            >
              ⬆ 导入存档
              <input type="file" accept="application/json,.json" onChange={importData} className="hidden" />
            </label>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-ink-soft)' }}>
            导入会用存档<b>覆盖</b>当前设备上的全部学习数据。
          </p>
        </section>

        {/* Danger zone */}
        <section className="text-center py-6">
          <button
            onClick={() => {
              if (confirm('确定要清空所有进度吗？这会重置所有记忆数据。')) reset();
            }}
            className="text-xs underline"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            清空所有进度（重置）
          </button>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value, unit, accent }: { label: string; value: number | string; unit?: string; accent: string }) {
  return (
    <div className="border rounded-xl p-4" style={{ borderColor: 'var(--color-stone-dark)', background: 'var(--color-paper-warm)' }}>
      <div className="text-xs mb-1" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <div className="text-3xl font-bold" style={{ color: accent, fontFamily: 'var(--font-serif-cn)' }}>{value}</div>
        {unit && <div className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{unit}</div>}
      </div>
    </div>
  );
}

function generateInsights(args: {
  stats: ReturnType<typeof selectStats>;
  accuracy7d: number | null;
  last7: { reviewed: number; learned: number }[];
}): string[] {
  const tips: string[] = [];
  const { stats, accuracy7d, last7 } = args;
  const recentActive = last7.filter(d => d.reviewed + d.learned > 0).length;

  if (stats.learned === 0) {
    tips.push('还没开始学习。从「学新字」选一个单元，每次 5-8 个字就好，不要贪多。');
  }
  if (stats.due > 12) {
    tips.push(`本单元有 ${stats.due} 个字到期复习 — 可以分两次默，先复习再学新字。`);
  }
  if (accuracy7d !== null && accuracy7d < 60) {
    tips.push(`近 7 日正确率 ${accuracy7d}% 偏低。建议放慢学新字的速度，先把错题本里的字攻克。`);
  }
  if (accuracy7d !== null && accuracy7d >= 90) {
    tips.push(`正确率 ${accuracy7d}% 非常高 — 可以适当增加每天学新字的数量（不超过 10 个）。`);
  }
  if (recentActive < 3) {
    tips.push('近 7 天活跃天数偏少。记忆是「时间的函数」，每天 10 分钟 > 周末 1 小时。');
  }
  if (stats.streak >= 7) {
    tips.push(`已经连续 ${stats.streak} 天坚持了 — 这正是科学记忆最难也最关键的部分。`);
  }
  if (stats.mastered > 0 && stats.mastered === stats.learned && stats.learned >= 10) {
    tips.push('所有学过的字都已掌握，可以放心进入下一个单元。');
  }
  if (tips.length === 0) {
    tips.push('节奏不错，保持每天少量、按时复习的习惯。');
  }
  return tips;
}
