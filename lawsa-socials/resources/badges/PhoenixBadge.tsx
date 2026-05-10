"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function PhoenixBadge({ size = 32 }: BadgeProps) {
  const id = `phnx-${size}`;
  return (
    <BadgeWrap size={size} title="Phoenix">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={`${id}-gem`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Wide silver feathered wings */}
        {/* Left wing layers */}
        <path d="M22 30 C18 22 8 18 2 12 C6 18 8 24 10 28 Z" fill={`url(#${id}-silver)`} opacity="0.85" />
        <path d="M22 30 C16 24 8 22 4 18 C8 24 12 28 14 30 Z" fill={`url(#${id}-silver)`} opacity="0.7" />
        <path d="M22 30 C18 26 12 26 8 26 C12 28 16 30 18 30 Z" fill={`url(#${id}-silver)`} opacity="0.6" />
        {/* Right wing layers */}
        <path d="M42 30 C46 22 56 18 62 12 C58 18 56 24 54 28 Z" fill={`url(#${id}-silver)`} opacity="0.85" />
        <path d="M42 30 C48 24 56 22 60 18 C56 24 52 28 50 30 Z" fill={`url(#${id}-silver)`} opacity="0.7" />
        <path d="M42 30 C46 26 52 26 56 26 C52 28 48 30 46 30 Z" fill={`url(#${id}-silver)`} opacity="0.6" />

        {/* Gold wing trim */}
        <path d="M22 30 C18 22 8 18 2 12" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.8" />
        <path d="M42 30 C46 22 56 18 62 12" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.8" />

        {/* Outer gold shield frame */}
        <path d="M32 8 L46 14 L48 30 L42 44 L32 50 L22 44 L16 30 L18 14 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />
        {/* Inner dark shield */}
        <path d="M32 12 L43 17 L45 30 L40 42 L32 46 L24 42 L19 30 L21 17 Z"
          fill="#1c0a00" />

        {/* Crown on top */}
        <path d="M24 14 L27 8 L30 12 L32 6 L34 12 L37 8 L40 14"
          fill={`url(#${id}-gold)`} />

        {/* Orange gem center */}
        <polygon points="32,16 41,30 32,44 23,30"
          fill={`url(#${id}-gem)`} filter={`url(#${id}-glow)`}
          style={{ animation: "cosm-fire-flicker 1.2s ease-in-out infinite" }} />
        <polygon points="32,16 41,30 32,30" fill="white" fillOpacity="0.3" />
        <polygon points="23,30 32,30 32,44" fill="black" fillOpacity="0.25" />

        {/* Center shine */}
        <circle cx="32" cy="24" r="3" fill="white" fillOpacity="0.85"
          style={{ animation: "sticker-ice-shimmer 2s ease-in-out infinite" }} />

        {/* Shield border */}
        <path d="M32 12 L43 17 L45 30 L40 42 L32 46 L24 42 L19 30 L21 17 Z"
          fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.2" strokeOpacity="0.8" />
      </SvgBadge>
    </BadgeWrap>
  );
}
