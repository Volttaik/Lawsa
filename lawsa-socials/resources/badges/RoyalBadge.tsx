"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function RoyalBadge({ size = 32 }: BadgeProps) {
  const id = `royl-${size}`;
  return (
    <BadgeWrap size={size} title="Royal">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id={`${id}-purple`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="40%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id={`${id}-shield`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b1f7a" />
            <stop offset="100%" stopColor="#1e1040" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Angel wings — spread wide */}
        {/* Left feathers */}
        <path d="M20 28 C12 20 4 16 2 10 C6 14 8 20 10 26 L14 28 Z" fill={`url(#${id}-purple)`} opacity="0.9" />
        <path d="M20 32 C10 26 4 22 2 16 C6 22 10 26 12 30 L16 32 Z" fill={`url(#${id}-purple)`} opacity="0.75" />
        <path d="M20 36 C12 32 6 30 4 26 C8 30 12 34 14 36 Z" fill={`url(#${id}-purple)`} opacity="0.6" />
        {/* Right feathers */}
        <path d="M44 28 C52 20 60 16 62 10 C58 14 56 20 54 26 L50 28 Z" fill={`url(#${id}-purple)`} opacity="0.9" />
        <path d="M44 32 C54 26 60 22 62 16 C58 22 54 26 52 30 L48 32 Z" fill={`url(#${id}-purple)`} opacity="0.75" />
        <path d="M44 36 C52 32 58 30 60 26 C56 30 52 34 50 36 Z" fill={`url(#${id}-purple)`} opacity="0.6" />

        {/* Wing gold trim */}
        <path d="M20 28 C12 20 4 16 2 10" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.7" />
        <path d="M44 28 C52 20 60 16 62 10" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.7" />

        {/* Shield outer gold */}
        <path d="M32 6 L47 13 L49 31 L43 45 L32 52 L21 45 L15 31 L17 13 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />
        {/* Shield body */}
        <path d="M32 10 L44 16 L46 30 L41 43 L32 48 L23 43 L18 30 L20 16 Z"
          fill={`url(#${id}-shield)`} />

        {/* Crown */}
        <path d="M23 16 L26 10 L29 14 L32 8 L35 14 L38 10 L41 16"
          fill={`url(#${id}-gold)`} />
        <rect x="23" y="16" width="18" height="3" rx="1" fill={`url(#${id}-gold)`} />

        {/* Central purple gem */}
        <polygon points="32,18 41,32 32,46 23,32"
          fill={`url(#${id}-purple)`} filter={`url(#${id}-glow)`}
          style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }} />
        <polygon points="32,18 41,32 32,32" fill="white" fillOpacity="0.2" />
        <circle cx="32" cy="26" r="3" fill="white" fillOpacity="0.85"
          style={{ animation: "sticker-ice-shimmer 2s ease-in-out infinite" }} />

        {/* Gold drip drops */}
        <line x1="28" y1="48" x2="27" y2="54" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round" />
        <circle cx="27" cy="55" r="1.5" fill="#fbbf24" />
        <line x1="32" y1="49" x2="32" y2="56" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="57" r="1.5" fill="#fbbf24" />
        <line x1="36" y1="48" x2="37" y2="54" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round" />
        <circle cx="37" cy="55" r="1.5" fill="#fbbf24" />

        {/* Shield border */}
        <path d="M32 10 L44 16 L46 30 L41 43 L32 48 L23 43 L18 30 L20 16 Z"
          fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1" strokeOpacity="0.8" />
      </SvgBadge>
    </BadgeWrap>
  );
}
