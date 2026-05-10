"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function ObsidianBadge({ size = 32 }: BadgeProps) {
  const id = `obsd-${size}`;
  return (
    <BadgeWrap size={size} title="Obsidian">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-glass`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151"/><stop offset="30%" stopColor="#1f2937"/>
            <stop offset="70%" stopColor="#111827"/><stop offset="100%" stopColor="#030712"/>
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
            <stop offset="40%" stopColor="white" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id={`${id}-purple`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4c1d95"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Dark wings */}
        <path d="M18 28 C12 20 4 14 2 8 C4 16 8 24 10 30 Z" fill={`url(#${id}-glass)`} opacity="0.9"/>
        <path d="M18 36 C10 30 4 26 2 20 C4 28 8 34 12 36 Z" fill={`url(#${id}-glass)`} opacity="0.7"/>
        <path d="M46 28 C54 20 60 14 62 8 C60 16 56 24 54 30 Z" fill={`url(#${id}-glass)`} opacity="0.9"/>
        <path d="M46 36 C54 30 60 26 62 20 C60 28 56 34 52 36 Z" fill={`url(#${id}-glass)`} opacity="0.7"/>
        {/* Purple wing trim */}
        <path d="M18 28 C12 20 4 14 2 8" stroke={`url(#${id}-purple)`} strokeWidth="1" fill="none" strokeOpacity="0.7"/>
        <path d="M46 28 C54 20 60 14 62 8" stroke={`url(#${id}-purple)`} strokeWidth="1" fill="none" strokeOpacity="0.7"/>
        {/* Main obsidian shield */}
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z"
          fill={`url(#${id}-glass)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z"
          fill={`url(#${id}-shine)`}/>
        {/* Purple inner frame */}
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z"
          fill="none" stroke={`url(#${id}-purple)`} strokeWidth="1.5" strokeOpacity="0.8"/>
        {/* Glass facets */}
        <path d="M32 8 L46 15 L32 35 Z" fill="white" fillOpacity="0.06"/>
        <path d="M18 15 L32 35 L16 32 Z" fill="white" fillOpacity="0.04"/>
        {/* Crown */}
        <path d="M24 14 L27 8 L30 12 L32 6 L34 12 L37 8 L40 14" fill={`url(#${id}-glass)`} stroke={`url(#${id}-purple)`} strokeWidth="0.8"/>
        {/* Purple gem center */}
        <polygon points="32,22 42,34 32,44 22,34" fill={`url(#${id}-purple)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2.5s ease-in-out infinite"}}/>
        <polygon points="32,22 42,34 32,34" fill="white" fillOpacity="0.2"/>
        <circle cx="32" cy="31" r="3" fill="white" fillOpacity="0.8" style={{animation:"sticker-ice-shimmer 2s ease-in-out infinite"}}/>
        {/* Shine streak */}
        <line x1="22" y1="14" x2="30" y2="26" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round"/>
      </SvgBadge>
    </BadgeWrap>
  );
}
