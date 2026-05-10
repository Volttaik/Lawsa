"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function AzureBadge({ size = 32 }: BadgeProps) {
  const id = `azur-${size}`;
  return (
    <BadgeWrap size={size} title="Azure">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={`${id}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id={`${id}-teal`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#164e63" />
          </linearGradient>
          <linearGradient id={`${id}-platform`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Spread eagle wings */}
        {/* Left */}
        <path d="M20 26 C14 18 6 12 2 8 C4 14 8 20 10 24 L14 28 Z" fill={`url(#${id}-blue)`} opacity="0.9" />
        <path d="M20 30 C12 24 4 20 2 14 C4 20 8 26 12 30 Z" fill={`url(#${id}-blue)`} opacity="0.75" />
        <path d="M20 34 C14 30 8 28 4 24 C8 28 12 32 14 34 Z" fill={`url(#${id}-blue)`} opacity="0.6" />
        {/* Right */}
        <path d="M44 26 C50 18 58 12 62 8 C60 14 56 20 54 24 L50 28 Z" fill={`url(#${id}-blue)`} opacity="0.9" />
        <path d="M44 30 C52 24 60 20 62 14 C60 20 56 26 52 30 Z" fill={`url(#${id}-blue)`} opacity="0.75" />
        <path d="M44 34 C50 30 56 28 60 24 C56 28 52 32 50 34 Z" fill={`url(#${id}-blue)`} opacity="0.6" />

        {/* Wing gold outlines */}
        <path d="M20 26 C14 18 6 12 2 8" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.8" />
        <path d="M44 26 C50 18 58 12 62 8" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.8" />

        {/* Outer gold shield */}
        <path d="M32 6 L47 12 L50 30 L44 46 L32 54 L20 46 L14 30 L17 12 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />
        {/* Inner shield */}
        <path d="M32 10 L44 15 L47 30 L42 44 L32 50 L22 44 L17 30 L20 15 Z"
          fill="#071e3d" />

        {/* Metallic crown */}
        <path d="M22 15 L25 8 L28 13 L32 6 L36 13 L39 8 L42 15"
          fill={`url(#${id}-gold)`} />

        {/* Multi-gem cross centerpiece */}
        {/* Center blue gem */}
        <polygon points="32,16 40,28 32,40 24,28" fill={`url(#${id}-teal)`} filter={`url(#${id}-glow)`}
          style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }} />
        {/* Side accent gems */}
        <polygon points="32,16 40,28 32,28" fill="white" fillOpacity="0.22" />
        <polygon points="24,28 32,28 32,40" fill="black" fillOpacity="0.2" />

        {/* Sparkle gems at cardinal */}
        <circle cx="32" cy="16" r="2.5" fill={`url(#${id}-blue)`}
          style={{ filter: `drop-shadow(0 0 3px #38bdf8)`, animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
        <circle cx="40" cy="28" r="2" fill={`url(#${id}-teal)`}
          style={{ filter: "drop-shadow(0 0 3px #06b6d4)", animation: "sticker-ice-shimmer 1.8s ease-in-out infinite", animationDelay: "0.3s" }} />
        <circle cx="32" cy="40" r="2" fill={`url(#${id}-blue)`}
          style={{ filter: "drop-shadow(0 0 3px #38bdf8)", animation: "sticker-ice-shimmer 2s ease-in-out infinite", animationDelay: "0.6s" }} />
        <circle cx="24" cy="28" r="2" fill={`url(#${id}-teal)`}
          style={{ filter: "drop-shadow(0 0 3px #06b6d4)", animation: "sticker-ice-shimmer 1.6s ease-in-out infinite", animationDelay: "0.9s" }} />

        {/* Center white star */}
        <circle cx="32" cy="28" r="3" fill="white" fillOpacity="0.9"
          style={{ animation: "sticker-ice-shimmer 1.2s ease-in-out infinite" }} />

        {/* Platform base */}
        <rect x="16" y="52" width="32" height="8" rx="4" fill={`url(#${id}-platform)`}
          style={{ filter: `drop-shadow(0 0 6px #38bdf8)` }} />
        {/* Platform glow line */}
        <line x1="16" y1="52" x2="48" y2="52" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7"
          style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />

        {/* Small lion/guardian figures on platform corners */}
        <circle cx="18" cy="54" r="2" fill="#fbbf24" fillOpacity="0.7" />
        <circle cx="46" cy="54" r="2" fill="#fbbf24" fillOpacity="0.7" />
      </SvgBadge>
    </BadgeWrap>
  );
}
