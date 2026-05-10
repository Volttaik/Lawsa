"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function DemonBadge({ size = 32 }: BadgeProps) {
  const id = `demn-${size}`;
  return (
    <BadgeWrap size={size} title="Demon">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#450a0a"/><stop offset="50%" stopColor="#1a0000"/>
            <stop offset="100%" stopColor="#030712"/>
          </linearGradient>
          <linearGradient id={`${id}-red`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5"/><stop offset="40%" stopColor="#dc2626"/>
            <stop offset="100%" stopColor="#7f1d1d"/>
          </linearGradient>
          <linearGradient id={`${id}-horn`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d"/><stop offset="100%" stopColor="#fca5a5"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Dark wing cloak */}
        <path d="M16 30 C8 20 2 12 2 4 C4 14 8 24 12 32 Z" fill={`url(#${id}-dark)`}/>
        <path d="M16 38 C8 30 2 24 2 16 C4 26 8 34 12 38 Z" fill={`url(#${id}-dark)`} opacity="0.8"/>
        <path d="M48 30 C56 20 62 12 62 4 C60 14 56 24 52 32 Z" fill={`url(#${id}-dark)`}/>
        <path d="M48 38 C56 30 62 24 62 16 C60 26 56 34 52 38 Z" fill={`url(#${id}-dark)`} opacity="0.8"/>
        {/* Main dark shield */}
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z" fill={`url(#${id}-dark)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z" fill="#0d0000"/>
        {/* Red border */}
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z" fill="none" stroke={`url(#${id}-red)`} strokeWidth="1.5" strokeOpacity="0.8"/>
        {/* Curved horns */}
        <path d="M20 14 C16 6 12 2 8 2 C12 4 16 8 18 14 Z" fill={`url(#${id}-horn)`} filter={`url(#${id}-glow)`}/>
        <path d="M44 14 C48 6 52 2 56 2 C52 4 48 8 46 14 Z" fill={`url(#${id}-horn)`} filter={`url(#${id}-glow)`}/>
        {/* Horn highlight */}
        <path d="M20 14 C17 8 14 4 10 3" stroke="white" strokeWidth="0.8" fill="none" strokeOpacity="0.3"/>
        <path d="M44 14 C47 8 50 4 54 3" stroke="white" strokeWidth="0.8" fill="none" strokeOpacity="0.3"/>
        {/* Demon face */}
        <path d="M22 26 C24 20 32 18 32 18 C32 18 40 20 42 26 C44 32 40 38 32 38 C24 38 20 32 22 26 Z"
          fill="#1a0000" stroke={`url(#${id}-red)`} strokeWidth="0.8"/>
        {/* Glowing red eyes */}
        <ellipse cx="25" cy="27" rx="3.5" ry="2.5" fill={`url(#${id}-red)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 1.6s ease-in-out infinite"}}/>
        <ellipse cx="39" cy="27" rx="3.5" ry="2.5" fill={`url(#${id}-red)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 1.6s ease-in-out infinite",animationDelay:"0.3s"}}/>
        <circle cx="23.5" cy="26" r="1" fill="white" fillOpacity="0.7"/>
        <circle cx="37.5" cy="26" r="1" fill="white" fillOpacity="0.7"/>
        {/* Fangs */}
        <path d="M28 35 L26 40 M36 35 L38 40" stroke={`url(#${id}-red)`} strokeWidth="2" strokeLinecap="round"/>
        {/* Center chest gem */}
        <polygon points="32,40 38,47 32,52 26,47" fill={`url(#${id}-red)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <circle cx="32" cy="46" r="2" fill="white" fillOpacity="0.7" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
