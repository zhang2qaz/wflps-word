// 世外校本 logo —— 地球（"世"字意象）+ 五角星，致敬上海世界外国语小学品牌标识
// 注：这是基于「地球 + 星」品牌元素的致敬设计，非官方校徽原件。

const STAR = 'M0,-1 L0.2245,-0.309 L0.951,-0.309 L0.363,0.118 L0.588,0.809 L0,0.382 L-0.588,0.809 L-0.363,0.118 L-0.951,-0.309 L-0.2245,-0.309 Z';

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="世外" role="img">
      {/* 地球本体 */}
      <circle cx="23" cy="25" r="20" fill="var(--color-vermilion)" />
      {/* 经纬线 */}
      <g stroke="#ffffff" strokeWidth="1.7" fill="none" opacity="0.9" strokeLinecap="round">
        <ellipse cx="23" cy="25" rx="20" ry="8" />
        <ellipse cx="23" cy="25" rx="8" ry="20" />
        <line x1="3" y1="25" x2="43" y2="25" />
      </g>
      {/* 五角星 */}
      <g transform="translate(38 11) scale(4.4)">
        <path d={STAR} fill="var(--color-mustard)" stroke="#ffffff" strokeWidth="0.14" />
      </g>
    </svg>
  );
}
