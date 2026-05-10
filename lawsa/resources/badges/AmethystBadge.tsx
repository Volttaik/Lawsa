"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function AmethystBadge({ size = 32 }: BadgeProps) {
  const id = `amth-${size}`;
  return (
    <BadgeWrap size={size} title="Amethyst">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id={`${id}-gem`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="30%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id={`${id}-wing-l`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${id}-gem-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Left wing */}
        <path d="M20 32 C14 28 6 24 4 18 C8 22 10 26 12 28 C8 20 10 14 16 16 C12 18 14 24 18 28 C16 22 18 16 22 20 Z"
          fill={`url(#${id}-wing-l)`} opacity="0.9" />
        {/* Right wing (mirrored) */}
        <path d="M44 32 C50 28 58 24 60 18 C56 22 54 26 52 28 C56 20 54 14 48 16 C52 18 50 24 46 28 C48 22 46 16 42 20 Z"
          fill={`url(#${id}-wing-l)`} opacity="0.9" />

        {/* Gold outer shield frame */}
        <path d="M32 6 L46 12 L50 28 L44 42 L32 52 L20 42 L14 28 L18 12 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />
        {/* Inner shield */}
        <path d="M32 10 L43 15 L46 28 L41 40 L32 48 L23 40 L18 28 L21 15 Z"
          fill="#2d1b69" />

        {/* Crown spikes on top */}
        <path d="M26 12 L28 6 L30 10 L32 4 L34 10 L36 6 L38 12"
          stroke={`url(#${id}-gold)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Central gem (diamond) */}
        <polygon points="32,14 40,28 32,44 24,28"
          fill={`url(#${id}-gem)`} filter={`url(#${id}-gem-glow)`}
          style={{ animation: "cosm-aura-pulse 2.5s ease-in-out infinite" }} />
        {/* Gem highlight */}
        <polygon points="32,14 40,28 32,28" fill="white" fillOpacity="0.25" />
        <polygon points="24,28 32,28 32,44" fill="black" fillOpacity="0.2" />

        {/* Gem sparkle */}
        <circle cx="32" cy="24" r="2.5" fill="white" fillOpacity="0.9"
          style={{ animation: "sticker-ice-shimmer 1.8s ease-in-out infinite" }} />

        {/* Gold trim lines on shield */}
        <path d="M32 10 L43 15 L46 28 L41 40 L32 48 L23 40 L18 28 L21 15 Z"
          fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1" strokeOpacity="0.7" />

        {/* Bottom ornament */}
        <path d="M28 50 L32 56 L36 50" fill={`url(#${id}-gold)`} />
        <circle cx="32" cy="57" r="2" fill="#fbbf24" fillOpacity="0.8" />
      </SvgBadge>
    </BadgeWrap>
  );
}
