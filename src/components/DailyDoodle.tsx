'use client';

import { useEffect, useState } from 'react';

// ============================================================
// 每日 Doodle Hero —— 像 Google Doodle 一样,根据当前日期切换
// 主题插画 + 与「今天」相关的文字。
// 节日临近会自动倒计时;没特别日子时也有当季节默认彩蛋画面。
// ============================================================

type Theme = {
  name: string;
  match: (now: Date) => boolean;
  title: (now: Date, childName?: string) => string;
  subtitle?: (now: Date) => string;
  chip?: (now: Date) => string;
  chipBg?: string;
  chipColor?: string;
  illustration: () => React.ReactElement;
};

// ───────── 工具函数 ─────────

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function todayString(now: Date) {
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${WEEKDAYS[now.getDay()]}`;
}

function daysUntilFixed(now: Date, month: number, day: number): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(now.getFullYear(), month - 1, day);
  if (target < today) target = new Date(now.getFullYear() + 1, month - 1, day);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

// 农历节日:存几个年份的对应阳历日期(简化,实用)
const LUNAR: Record<number, Record<string, [number, number]>> = {
  2026: { spring: [2, 17], lantern: [3, 3],  qingming: [4, 5], dragonBoat: [6, 19], midAutumn: [9, 25] },
  2027: { spring: [2, 6],  lantern: [2, 20], qingming: [4, 5], dragonBoat: [6, 9],  midAutumn: [9, 15] },
  2028: { spring: [1, 26], lantern: [2, 9],  qingming: [4, 4], dragonBoat: [5, 28], midAutumn: [10, 3] },
  2029: { spring: [2, 13], lantern: [2, 27], qingming: [4, 5], dragonBoat: [6, 16], midAutumn: [9, 22] },
};

function daysUntilLunar(now: Date, key: 'spring' | 'lantern' | 'qingming' | 'dragonBoat' | 'midAutumn'): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yr = LUNAR[now.getFullYear()] ?? LUNAR[2026];
  const [m1, d1] = yr[key];
  let target = new Date(now.getFullYear(), m1 - 1, d1);
  if (target < today) {
    const nx = LUNAR[now.getFullYear() + 1] ?? LUNAR[2026];
    const [m2, d2] = nx[key];
    target = new Date(now.getFullYear() + 1, m2 - 1, d2);
  }
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

// ───────── 插画(纯内联 SVG) ─────────

function BalloonsIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 装饰星点 */}
      <circle cx="14"  cy="22" r="2"   fill="#21348c" opacity=".5"/>
      <circle cx="105" cy="28" r="1.8" fill="#e3242b" opacity=".55"/>
      <circle cx="22"  cy="78" r="1.5" fill="#ff9f0a" opacity=".55"/>
      <circle cx="100" cy="92" r="1.8" fill="#34a853" opacity=".55"/>
      <circle cx="6"   cy="56" r="1.2" fill="#e3242b" opacity=".4"/>
      <circle cx="112" cy="62" r="1.5" fill="#21348c" opacity=".4"/>
      {/* 气球线 */}
      <path d="M 38 70 Q 52 92 60 110" stroke="#6b7280" strokeWidth="1"   fill="none"/>
      <path d="M 60 60 Q 56 86 60 110" stroke="#6b7280" strokeWidth="1"   fill="none"/>
      <path d="M 82 75 Q 70 94 60 110" stroke="#6b7280" strokeWidth="1"   fill="none"/>
      {/* 三只气球 */}
      <ellipse cx="38" cy="50" rx="14" ry="17" fill="#e3242b"/>
      <path d="M 38 67 L 35 70 L 41 70 Z" fill="#a01a22"/>
      <ellipse cx="60" cy="40" rx="14" ry="17" fill="#ff9f0a"/>
      <path d="M 60 57 L 57 60 L 63 60 Z" fill="#c4790a"/>
      <ellipse cx="82" cy="55" rx="14" ry="17" fill="#21348c"/>
      <path d="M 82 72 L 79 75 L 85 75 Z" fill="#15226b"/>
      {/* 高光 */}
      <ellipse cx="33" cy="46" rx="2.5" ry="4" fill="#fff" opacity=".55"/>
      <ellipse cx="55" cy="36" rx="2.5" ry="4" fill="#fff" opacity=".55"/>
      <ellipse cx="77" cy="51" rx="2.5" ry="4" fill="#fff" opacity=".55"/>
      {/* 底部打结点 */}
      <circle cx="60" cy="110" r="2.5" fill="#6b7280"/>
    </svg>
  );
}

function ZongziIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 粽子三角主体(竹叶绿) */}
      <path d="M 60 18 L 100 96 L 20 96 Z" fill="#2d8a6f" stroke="#1d6b54" strokeWidth="1.4"/>
      {/* 叶纹 */}
      <path d="M 60 18 L 75 60" stroke="#1d6b54" strokeWidth="1.2" fill="none" opacity=".6"/>
      <path d="M 60 18 L 45 60" stroke="#1d6b54" strokeWidth="1.2" fill="none" opacity=".6"/>
      <path d="M 30 82 Q 60 72 90 82" stroke="#1d6b54" strokeWidth="1" fill="none" opacity=".5"/>
      {/* 红色丝带 */}
      <path d="M 32 76 Q 60 60 88 76 L 88 80 Q 60 65 32 80 Z" fill="#e3242b"/>
      <path d="M 50 70 L 44 58 L 56 64 Z" fill="#e3242b"/>
      <path d="M 70 70 L 76 58 L 64 64 Z" fill="#e3242b"/>
      {/* 装饰星 */}
      <text x="10" y="40" fontSize="14" fill="#ff9f0a">✦</text>
      <text x="98" y="42" fontSize="14" fill="#ff9f0a">✦</text>
      <text x="6"  y="86" fontSize="10" fill="#21348c">✦</text>
    </svg>
  );
}

function SummerSunIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 太阳 */}
      <circle cx="58" cy="50" r="28" fill="#ff9f0a"/>
      <g stroke="#ff9f0a" strokeWidth="2.4" strokeLinecap="round">
        <line x1="58" y1="12" x2="58" y2="4"/>
        <line x1="18" y1="50" x2="10" y2="50"/>
        <line x1="98" y1="50" x2="106" y2="50"/>
        <line x1="28" y1="20" x2="22" y2="14"/>
        <line x1="88" y1="20" x2="94" y2="14"/>
        <line x1="28" y1="80" x2="22" y2="86"/>
        <line x1="88" y1="80" x2="94" y2="86"/>
      </g>
      {/* 墨镜 */}
      <ellipse cx="47" cy="50" rx="9" ry="7" fill="#1c1c1e"/>
      <ellipse cx="69" cy="50" rx="9" ry="7" fill="#1c1c1e"/>
      <line x1="56" y1="48" x2="60" y2="48" stroke="#1c1c1e" strokeWidth="3"/>
      <ellipse cx="44" cy="48" rx="2.5" ry="2" fill="#fff" opacity=".4"/>
      <ellipse cx="66" cy="48" rx="2.5" ry="2" fill="#fff" opacity=".4"/>
      {/* 笑嘴 */}
      <path d="M 48 64 Q 58 72 68 64" stroke="#1c1c1e" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      {/* 西瓜片 */}
      <path d="M 88 100 Q 88 88 100 88 Q 112 88 112 100 Z" fill="#e3242b" stroke="#34a853" strokeWidth="2.4"/>
      <circle cx="96"  cy="96" r="1.2" fill="#1c1c1e"/>
      <circle cx="102" cy="94" r="1.2" fill="#1c1c1e"/>
      <circle cx="106" cy="97" r="1.2" fill="#1c1c1e"/>
    </svg>
  );
}

function SpringSproutIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 太阳 */}
      <circle cx="92" cy="28" r="11" fill="#ff9f0a"/>
      <g stroke="#ff9f0a" strokeWidth="1.6" strokeLinecap="round">
        <line x1="92"  y1="11" x2="92"  y2="6"/>
        <line x1="107" y1="28" x2="113" y2="28"/>
        <line x1="92"  y1="45" x2="92"  y2="50"/>
        <line x1="77"  y1="28" x2="71"  y2="28"/>
      </g>
      {/* 远处云 */}
      <ellipse cx="22" cy="32" rx="11" ry="4" fill="#fff" opacity=".7"/>
      <ellipse cx="48" cy="22" rx="14" ry="5" fill="#fff" opacity=".7"/>
      {/* 草地 */}
      <path d="M 0 100 Q 30 96 60 100 Q 90 104 120 100 L 120 120 L 0 120 Z" fill="#2d8a6f"/>
      <rect x="0" y="100" width="120" height="20" fill="#34a853" opacity=".6"/>
      {/* 嫩芽茎 */}
      <path d="M 32 100 Q 34 80 32 60" stroke="#34a853" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* 叶子 */}
      <path d="M 32 76 Q 22 73 18 78 Q 24 81 32 78 Z" fill="#34a853"/>
      <path d="M 32 64 Q 42 62 46 67 Q 38 70 32 68 Z" fill="#34a853"/>
      {/* 花朵 */}
      <circle cx="32" cy="58" r="6" fill="#e3242b"/>
      <circle cx="32" cy="58" r="2" fill="#ff9f0a"/>
      {/* 蝴蝶 */}
      <ellipse cx="68" cy="66" rx="4.5" ry="6.5" fill="#21348c" transform="rotate(-20 68 66)"/>
      <ellipse cx="76" cy="66" rx="4.5" ry="6.5" fill="#21348c" transform="rotate(20 76 66)"/>
      <line x1="68" y1="60" x2="76" y2="60" stroke="#1c1c1e" strokeWidth="1.6"/>
      <circle cx="68" cy="64" r="1.5" fill="#ff9f0a"/>
      <circle cx="76" cy="64" r="1.5" fill="#ff9f0a"/>
    </svg>
  );
}

function MoonRabbitIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 大月亮 */}
      <circle cx="60" cy="58" r="38" fill="#ffe9b3"/>
      <circle cx="60" cy="58" r="38" fill="none" stroke="#ff9f0a" strokeWidth="1.5" opacity=".5"/>
      {/* 月坑 */}
      <circle cx="44" cy="44" r="3" fill="#ffd980" opacity=".7"/>
      <circle cx="76" cy="50" r="2" fill="#ffd980" opacity=".7"/>
      <circle cx="68" cy="74" r="2.5" fill="#ffd980" opacity=".7"/>
      {/* 玉兔(白色剪影) */}
      <ellipse cx="60" cy="62" rx="11" ry="8" fill="#fff"/>
      <ellipse cx="55" cy="50" rx="2.5" ry="6" fill="#fff"/>
      <ellipse cx="65" cy="50" rx="2.5" ry="6" fill="#fff"/>
      <ellipse cx="55" cy="50" rx="1" ry="3" fill="#ffc1cc"/>
      <ellipse cx="65" cy="50" rx="1" ry="3" fill="#ffc1cc"/>
      <circle cx="57" cy="60" r="0.8" fill="#1c1c1e"/>
      <circle cx="63" cy="60" r="0.8" fill="#1c1c1e"/>
      <path d="M 58 64 Q 60 66 62 64" stroke="#1c1c1e" strokeWidth="0.8" fill="none"/>
      {/* 星星 */}
      <text x="14"  y="30" fontSize="14" fill="#21348c">✦</text>
      <text x="100" y="34" fontSize="12" fill="#21348c">✦</text>
      <text x="20"  y="100" fontSize="10" fill="#21348c">✦</text>
      <text x="100" y="96"  fontSize="10" fill="#21348c">✦</text>
    </svg>
  );
}

function LanternIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 灯笼主体 */}
      <ellipse cx="60" cy="60" rx="32" ry="36" fill="#e3242b"/>
      <ellipse cx="60" cy="60" rx="32" ry="36" fill="none" stroke="#a01a22" strokeWidth="1.5"/>
      {/* 灯笼竖纹 */}
      <line x1="60" y1="24" x2="60" y2="96" stroke="#a01a22" strokeWidth="1" opacity=".5"/>
      <path d="M 40 30 Q 30 60 40 90" stroke="#a01a22" strokeWidth="1" fill="none" opacity=".5"/>
      <path d="M 80 30 Q 90 60 80 90" stroke="#a01a22" strokeWidth="1" fill="none" opacity=".5"/>
      {/* 顶部和底部金色 */}
      <ellipse cx="60" cy="24" rx="14" ry="4" fill="#ff9f0a"/>
      <ellipse cx="60" cy="96" rx="14" ry="4" fill="#ff9f0a"/>
      {/* 顶部挂绳 */}
      <line x1="60" y1="20" x2="60" y2="10" stroke="#a01a22" strokeWidth="1.5"/>
      {/* 底部流苏 */}
      <line x1="56" y1="100" x2="55" y2="114" stroke="#ff9f0a" strokeWidth="1.5"/>
      <line x1="60" y1="100" x2="60" y2="116" stroke="#ff9f0a" strokeWidth="1.5"/>
      <line x1="64" y1="100" x2="65" y2="114" stroke="#ff9f0a" strokeWidth="1.5"/>
      {/* 福字 */}
      <text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="700" fill="#ff9f0a" fontFamily="serif">福</text>
    </svg>
  );
}

function FlagIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 旗杆 */}
      <line x1="28" y1="14" x2="28" y2="108" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round"/>
      {/* 顶旗珠 */}
      <circle cx="28" cy="14" r="3" fill="#ff9f0a"/>
      {/* 旗面 */}
      <path d="M 28 22 L 96 22 L 92 44 L 96 66 L 28 66 Z" fill="#e3242b"/>
      {/* 五星 */}
      <text x="44" y="42" fontSize="14" fill="#ff9f0a">★</text>
      <text x="58" y="32" fontSize="8"  fill="#ff9f0a">★</text>
      <text x="64" y="42" fontSize="8"  fill="#ff9f0a">★</text>
      <text x="66" y="52" fontSize="8"  fill="#ff9f0a">★</text>
      <text x="58" y="58" fontSize="8"  fill="#ff9f0a">★</text>
      {/* 礼花 */}
      <text x="80"  y="92"  fontSize="14" fill="#ff9f0a">✦</text>
      <text x="100" y="80"  fontSize="12" fill="#e3242b">✦</text>
      <text x="70"  y="108" fontSize="10" fill="#21348c">✦</text>
    </svg>
  );
}

function MapleIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* 主枫叶 */}
      <g transform="translate(60 60)" fill="#e3242b">
        <path d="M 0 -30 L 8 -14 L 22 -16 L 14 -4 L 28 4 L 14 6 L 18 22 L 4 14 L 0 30 L -4 14 L -18 22 L -14 6 L -28 4 L -14 -4 L -22 -16 L -8 -14 Z"/>
      </g>
      <line x1="60" y1="90" x2="60" y2="108" stroke="#8b5a2b" strokeWidth="2"/>
      {/* 小枫叶飘落 */}
      <g transform="translate(22 36) scale(0.35) rotate(20)" fill="#ff9f0a">
        <path d="M 0 -30 L 8 -14 L 22 -16 L 14 -4 L 28 4 L 14 6 L 18 22 L 4 14 L 0 30 L -4 14 L -18 22 L -14 6 L -28 4 L -14 -4 L -22 -16 L -8 -14 Z"/>
      </g>
      <g transform="translate(102 92) scale(0.3) rotate(-30)" fill="#e0a32a">
        <path d="M 0 -30 L 8 -14 L 22 -16 L 14 -4 L 28 4 L 14 6 L 18 22 L 4 14 L 0 30 L -4 14 L -18 22 L -14 6 L -28 4 L -14 -4 L -22 -16 L -8 -14 Z"/>
      </g>
    </svg>
  );
}

function SnowflakeIllust() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g transform="translate(60 60)" stroke="#21348c" strokeWidth="2.4" strokeLinecap="round" fill="none">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="0" x2="0" y2="-32"/>
            <line x1="0" y1="-18" x2="-7" y2="-25"/>
            <line x1="0" y1="-18" x2="7"  y2="-25"/>
            <line x1="0" y1="-28" x2="-5" y2="-32"/>
            <line x1="0" y1="-28" x2="5"  y2="-32"/>
          </g>
        ))}
      </g>
      <circle cx="60" cy="60" r="4" fill="#21348c"/>
      {/* 雪点 */}
      <circle cx="20"  cy="22"  r="2" fill="#bdc4d6"/>
      <circle cx="100" cy="28"  r="1.5" fill="#bdc4d6"/>
      <circle cx="14"  cy="92"  r="1.8" fill="#bdc4d6"/>
      <circle cx="106" cy="98"  r="2" fill="#bdc4d6"/>
      <circle cx="98"  cy="80"  r="1.2" fill="#bdc4d6"/>
      <circle cx="22"  cy="74"  r="1.5" fill="#bdc4d6"/>
    </svg>
  );
}

// ───────── 主题目录(按优先级,先匹配先用) ─────────

const C_CINNABAR = { bg: 'color-mix(in srgb, var(--color-cinnabar) 12%, transparent)', color: 'var(--color-cinnabar)' };
const C_JADE     = { bg: 'color-mix(in srgb, var(--color-jade) 14%, transparent)',     color: 'var(--color-jade)' };
const C_MUSTARD  = { bg: 'color-mix(in srgb, var(--color-mustard) 14%, transparent)',  color: 'var(--color-mustard)' };
const C_BLUE     = { bg: 'color-mix(in srgb, var(--color-vermilion) 12%, transparent)', color: 'var(--color-vermilion)' };

const THEMES: Theme[] = [
  // ─── 春节当天 / ±2 ───
  {
    name: 'spring-festival',
    match: (d) => daysUntilLunar(d, 'spring') <= 2 || daysUntilLunar(d, 'spring') >= 363,
    title: (_d, name) => `${name ? name + ',' : ''}新年好!`,
    subtitle: (d) => `${todayString(d)} · 新一年继续加加油`,
    chip: () => '🧧 春节',
    chipBg: C_CINNABAR.bg, chipColor: C_CINNABAR.color,
    illustration: LanternIllust,
  },
  // ─── 春节倒计时(15 天内) ───
  {
    name: 'spring-countdown',
    match: (d) => {
      const n = daysUntilLunar(d, 'spring');
      return n > 2 && n <= 15;
    },
    title: (d) => `还有 ${daysUntilLunar(d, 'spring')} 天就过年啦`,
    subtitle: (d) => `${todayString(d)} · 把寒假该背的字提前默熟`,
    chip: () => '🧧 春节倒计时',
    chipBg: C_CINNABAR.bg, chipColor: C_CINNABAR.color,
    illustration: LanternIllust,
  },
  // ─── 儿童节当天 ───
  {
    name: 'childrens-day',
    match: (d) => d.getMonth() === 5 && d.getDate() === 1,
    title: (_d, name) => `${name ? name + ',' : ''}儿童节快乐!`,
    subtitle: (d) => `${todayString(d)} · 今天是属于你的日子`,
    chip: () => '🎈 6 · 1',
    chipBg: C_CINNABAR.bg, chipColor: C_CINNABAR.color,
    illustration: BalloonsIllust,
  },
  // ─── 儿童节倒计时(10 天内) ───
  {
    name: 'childrens-countdown',
    match: (d) => {
      const n = daysUntilFixed(d, 6, 1);
      return n > 0 && n <= 10;
    },
    title: (d) => `再过 ${daysUntilFixed(d, 6, 1)} 天就是儿童节!`,
    subtitle: (d) => `${todayString(d)} · 这周把字默漂亮,过节没作业更香`,
    chip: () => '🎈 6 · 1 倒计时',
    chipBg: C_CINNABAR.bg, chipColor: C_CINNABAR.color,
    illustration: BalloonsIllust,
  },
  // ─── 端午前后 ───
  {
    name: 'dragon-boat',
    match: (d) => {
      const n = daysUntilLunar(d, 'dragonBoat');
      return n >= 0 && n <= 5;
    },
    title: (d, name) => {
      const n = daysUntilLunar(d, 'dragonBoat');
      if (n === 0) return `${name ? name + ',' : ''}端午安康!`;
      return `还有 ${n} 天就是端午`;
    },
    subtitle: (d) => `${todayString(d)} · 屈原的故事 · 粽子配甜咸豆腐脑`,
    chip: () => '🍃 粽子节',
    chipBg: C_JADE.bg, chipColor: C_JADE.color,
    illustration: ZongziIllust,
  },
  // ─── 中秋前后 ───
  {
    name: 'mid-autumn',
    match: (d) => {
      const n = daysUntilLunar(d, 'midAutumn');
      return n >= 0 && n <= 5;
    },
    title: (d, name) => {
      const n = daysUntilLunar(d, 'midAutumn');
      if (n === 0) return `${name ? name + ',' : ''}中秋节快乐!`;
      return `还有 ${n} 天就是中秋`;
    },
    subtitle: (d) => `${todayString(d)} · 月亮 · 月饼 · 玉兔捣药的故事`,
    chip: () => '🌕 月圆夜',
    chipBg: C_MUSTARD.bg, chipColor: C_MUSTARD.color,
    illustration: MoonRabbitIllust,
  },
  // ─── 国庆节 (10/1-10/7) ───
  {
    name: 'national-day',
    match: (d) => d.getMonth() === 9 && d.getDate() >= 1 && d.getDate() <= 7,
    title: (_d, name) => `${name ? name + ',' : ''}国庆快乐!`,
    subtitle: (d) => `${todayString(d)} · 长假别只玩,每天 10 分钟字也要默`,
    chip: () => '🇨🇳 国庆',
    chipBg: C_CINNABAR.bg, chipColor: C_CINNABAR.color,
    illustration: FlagIllust,
  },
  // ─── 暑假 (7-8 月) ───
  {
    name: 'summer-vacation',
    match: (d) => d.getMonth() === 6 || d.getMonth() === 7,
    title: (_d, name) => `${name ? name + ',' : ''}暑假愉快!`,
    subtitle: (d) => `${todayString(d)} · 每天一点点,开学不慌张`,
    chip: () => '☀️ 暑假',
    chipBg: C_MUSTARD.bg, chipColor: C_MUSTARD.color,
    illustration: SummerSunIllust,
  },
  // ─── 寒假 (1 月) ───
  {
    name: 'winter-vacation',
    match: (d) => d.getMonth() === 0,
    title: (_d, name) => `${name ? name + ',' : ''}寒假慢慢过`,
    subtitle: (d) => `${todayString(d)} · 暖一杯水 · 默几个字`,
    chip: () => '❄️ 寒假',
    chipBg: C_BLUE.bg, chipColor: C_BLUE.color,
    illustration: SnowflakeIllust,
  },
  // ─── 秋季(9-11 月默认) ───
  {
    name: 'autumn',
    match: (d) => d.getMonth() >= 8 && d.getMonth() <= 10,
    title: (_d, name) => `${name ? name + ',' : ''}今天也加加油`,
    subtitle: (d) => `${todayString(d)} · 一天一点点,字就记住了`,
    chip: () => '🍁 秋天',
    chipBg: C_CINNABAR.bg, chipColor: C_CINNABAR.color,
    illustration: MapleIllust,
  },
  // ─── 春季默认(3-5 月,无其他特别日) ───
  {
    name: 'spring-default',
    match: (d) => d.getMonth() >= 2 && d.getMonth() <= 4,
    title: (_d, name) => `${name ? name + ',' : ''}今天也加加油`,
    subtitle: (d) => `${todayString(d)} · 一天一点点,字就记住了`,
    chip: () => '🌱 春天',
    chipBg: C_JADE.bg, chipColor: C_JADE.color,
    illustration: SpringSproutIllust,
  },
  // ─── 兜底 ───
  {
    name: 'default',
    match: () => true,
    title: (_d, name) => `${name ? name + ',' : ''}今天加加油`,
    subtitle: (d) => todayString(d),
    illustration: SpringSproutIllust,
  },
];

function pickTheme(now: Date): Theme {
  return THEMES.find((t) => t.match(now)) ?? THEMES[THEMES.length - 1];
}

// ───────── 组件 ─────────

export default function DailyDoodle({ childName }: { childName?: string }) {
  // SSR 和客户端时间会不一致 → server 先渲染占位,客户端挂载后再读真实时间
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  if (!now) {
    return <section style={{ height: 280 }} aria-hidden />;
  }

  const theme = pickTheme(now);
  return (
    <section className="text-center mb-10">
      <div className="mx-auto mb-5" style={{ width: 140, height: 140 }}>
        {theme.illustration()}
      </div>
      <h1
        className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
        style={{ fontFamily: 'var(--font-display-sans)', letterSpacing: '-0.02em' }}
      >
        {theme.title(now, childName)}
      </h1>
      {theme.subtitle && (
        <p className="text-[15px]" style={{ color: 'var(--color-ink-soft)' }}>
          {theme.subtitle(now)}
        </p>
      )}
      {theme.chip && (
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium"
          style={{
            background: theme.chipBg ?? C_BLUE.bg,
            color: theme.chipColor ?? C_BLUE.color,
          }}
        >
          {theme.chip(now)}
        </div>
      )}
    </section>
  );
}
