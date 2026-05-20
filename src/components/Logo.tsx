// WFLPS 校徽 —— 盾形徽章：红色横幅 + 蓝色盾身 + 白色地球 + 五角星
// 还原上海市世界外国语小学官方校徽视觉。

const STAR =
  'M0,-1 L0.2245,-0.309 L0.951,-0.309 L0.363,0.118 L0.588,0.809 L0,0.382 ' +
  'L-0.588,0.809 L-0.363,0.118 L-0.951,-0.309 L-0.2245,-0.309 Z';

const SHIELD = 'M6,7 Q6,3 10,3 L90,3 Q94,3 94,7 L94,64 Q94,90 50,113 Q6,90 6,64 Z';

const BLUE = '#21348c';
const RED = '#e3242b';

export default function Logo({ size = 36 }: { size?: number }) {
  const w = size;
  const h = (size * 116) / 100;
  return (
    <svg width={w} height={h} viewBox="0 0 100 116" aria-label="WFLPS 上海市世界外国语小学" role="img">
      <defs>
        <clipPath id="wflps-shield">
          <path d={SHIELD} />
        </clipPath>
      </defs>

      {/* 盾身（蓝）+ 顶部横幅（红） */}
      <g clipPath="url(#wflps-shield)">
        <rect x="0" y="0" width="100" height="116" fill={BLUE} />
        <rect x="0" y="0" width="100" height="38" fill={RED} />
      </g>

      {/* WFLPS 字样 */}
      <text
        x="50"
        y="29"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="0.5"
        fill="#ffffff"
      >
        WFLPS
      </text>

      {/* 白色地球 */}
      <g fill="none" stroke="#ffffff" strokeLinecap="round">
        <circle cx="50" cy="71" r="20" strokeWidth="2.6" />
        <ellipse cx="50" cy="71" rx="20" ry="7.6" strokeWidth="2.6" />
        <ellipse cx="50" cy="71" rx="8" ry="20" strokeWidth="2.6" />
        <ellipse
          cx="50"
          cy="71"
          rx="20.5"
          ry="11"
          strokeWidth="5"
          transform="rotate(-28 50 71)"
        />
      </g>

      {/* 五角星 */}
      <g transform="translate(50 99) scale(5)">
        <path d={STAR} fill="#ffffff" />
      </g>

      {/* 盾形描边 */}
      <path d={SHIELD} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}
