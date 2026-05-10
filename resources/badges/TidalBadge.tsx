"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function TidalBadge({ size = 32 }: BadgeProps) {
  const id = `tidl-${size}`;
  return (
    <BadgeWrap size={size} title="Tidal">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <linearGradient id={`${id}-ocean`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd"/><stop offset="40%" stopColor="#0ea5e9"/>
            <stop offset="80%" stopColor="#0369a1"/><stop offset="100%" stopColor="#0c4a6e"/>
          </linearGradient>
          <radialGradient id={`${id}-teal`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a5f3fc"/><stop offset="50%" stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#0e7490"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Wave side fins */}
        <path d="M14 30 C10 26 4 24 2 20 C4 26 6 32 10 34 Z" fill={`url(#${id}-ocean)`} opacity="0.85"/>
        <path d="M14 34 C8 32 4 32 2 28 C4 34 8 38 12 38 Z" fill={`url(#${id}-ocean)`} opacity="0.65"/>
        <path d="M50 30 C54 26 60 24 62 20 C60 26 58 32 54 34 Z" fill={`url(#${id}-ocean)`} opacity="0.85"/>
        <path d="M50 34 C56 32 60 32 62 28 C60 34 56 38 52 38 Z" fill={`url(#${id}-ocean)`} opacity="0.65"/>
        {/* Outer gold shield */}
        <path d="M32 6 L47 12 L50 30 L44 46 L32 54 L20 46 L14 30 L17 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 10 L44 15 L47 30 L42 44 L32 50 L22 44 L17 30 L20 15 Z" fill="#0c2a3e"/>
        {/* Wave fill */}
        <path d="M32 10 L44 15 L47 30 L42 44 L32 50 L22 44 L17 30 L20 15 Z" fill={`url(#${id}-ocean)`} opacity="0.5"/>
        {/* Animated wave lines */}
        <path d="M20 30 C24 27 28 33 32 30 C36 27 40 33 44 30" stroke="#bae6fd" strokeWidth="2" fill="none" strokeOpacity="0.8" style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <path d="M20 36 C24 33 28 39 32 36 C36 33 40 39 44 36" stroke="#bae6fd" strokeWidth="1.5" fill="none" strokeOpacity="0.5" style={{animation:"cosm-aura-pulse 2s ease-in-out infinite",animationDelay:"0.4s"}}/>
        {/* Trident center */}
        <line x1="32" y1="14" x2="32" y2="46" stroke={`url(#${id}-gold)`} strokeWidth="3" strokeLinecap="round"/>
        <line x1="26" y1="14" x2="26" y2="22" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="38" y1="14" x2="38" y2="22" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="24" y1="14" x2="40" y2="14" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round"/>
        {/* Center gem */}
        <circle cx="32" cy="32" r="5" fill={`url(#${id}-teal)`} filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 2.2s ease-in-out infinite"}}/>
        <circle cx="32" cy="30" r="2" fill="white" fillOpacity="0.9" style={{animation:"sticker-ice-shimmer 1.8s ease-in-out infinite"}}/>
        {/* Crown */}
        <path d="M24 15 L27 9 L30 13 L32 7 L34 13 L37 9 L40 15" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
