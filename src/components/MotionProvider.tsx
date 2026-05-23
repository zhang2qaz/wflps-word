'use client';

import { MotionConfig } from 'framer-motion';

// 把 framer-motion 全局接到系统「减少动效」偏好上。
// reducedMotion="user" 表示:用户系统开了「减少动态」,framer-motion
// 自动短路所有动画(scale/y/opacity 一步到位,不再动)。
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
