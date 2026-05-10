"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function ShadowBadge({ size = 32 }: BadgeProps) {
  const id = `shdw-${size}`;
  return (
    <BadgeWrap size={size} title="Shadow">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151"/><stop offset="50%" stopColor="#111827"/>
            <stop offset="100%" stopColor="#030712"/>
          </linearGradient>
          <linearGradient id={`${id}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9"/><stop offset="40%" stopColor="#94a3b8"/>
            <stop offset="100%" stopColor="#334155"/>
          </linearGradient>
          <radialGradient id={`${id}-eye`} cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#6b7280"/><stop offset="50%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#030712"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Shadow tendrils / cloak */}
        <path d="M18 28 C12 20 6 14 4 8 C6 16 8 24 10 30 Z" fill={`url(#${id}-dark)`} opacity="0.9"/>
        <path d="M18 36 C10 30 4 26 2 20 C4 28 8 34 12 38 Z" fill={`url(#${id}-dark)`} opacity="0.7"/>
        <path d="M46 28 C52 20 58 14 60 8 C58 16 56 24 54 30 Z" fill={`url(#${id}-dark)`} opacity="0.9"/>
        <path d="M46 36 C54 30 60 26 62 20 C60 28 56 34 52 38 Z" fill={`url(#${id}-dark)`} opacity="0.7"/>
        {/* Silver outer frame */}
        <path d="M32 4 L48 10 L52 30 L44 48 L32 58 L20 48 L12 30 L16 10 Z" fill={`url(#${id}-silver)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L45 13 L49 30 L42 46 L32 54 L22 46 L15 30 L19 13 Z" fill={`url(#${id}-dark)`}/>
        {/* Hood/cowl */}
        <path d="M22 18 C24 12 32 10 32 10 C32 10 40 12 42 18 C44 24 42 30 32 30 C22 30 20 24 22 18 Z"
          fill="#1f2937" stroke={`url(#${id}-silver)`} strokeWidth="0.8"/>
        {/* Shadow eyes */}
        <ellipse cx="26" cy="24" rx="3.5" ry="2.5" fill={`url(#${id}-eye)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <ellipse cx="38" cy="24" rx="3.5" ry="2.5" fill={`url(#${id}-eye)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite",animationDelay:"0.3s"}}/>
        <circle cx="24.5" cy="23" r="1" fill="white" fillOpacity="0.6"/>
        <circle cx="36.5" cy="23" r="1" fill="white" fillOpacity="0.6"/>
        {/* Dark gem in chest */}
        <polygon points="32,34 40,44 32,50 24,44" fill={`url(#${id}-dark)`} stroke={`url(#${id}-silver)`} strokeWidth="1"
          style={{filter:"drop-shadow(0 0 6px #94a3b8)"}}/>
        <circle cx="32" cy="42" r="2.5" fill="#94a3b8" style={{animation:"sticker-ice-shimmer 2s ease-in-out infinite"}}/>
        {/* Silver crown */}
        <path d="M24 13 L27 7 L30 11 L32 5 L34 11 L37 7 L40 13" fill={`url(#${id}-silver)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
