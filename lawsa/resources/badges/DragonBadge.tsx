"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function DragonBadge({ size = 32 }: BadgeProps) {
  const id = `drgn-${size}`;
  return (
    <BadgeWrap size={size} title="Dragon">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id={`${id}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <radialGradient id={`${id}-eye`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4c1d95" />
          </radialGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${id}-eye-glow`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Dragon horns */}
        <path d="M20 16 C16 8 12 4 10 2 C14 8 16 14 18 18 Z" fill={`url(#${id}-gold)`} />
        <path d="M44 16 C48 8 52 4 54 2 C50 8 48 14 46 18 Z" fill={`url(#${id}-gold)`} />
        {/* Horn highlight */}
        <path d="M20 16 C18 10 14 6 10 2 C12 6 14 10 16 14 Z" fill="white" fillOpacity="0.3" />
        <path d="M44 16 C46 10 50 6 54 2 C52 6 50 10 48 14 Z" fill="white" fillOpacity="0.3" />

        {/* Gold outer frame / mane */}
        <path d="M32 8 C40 8 50 14 52 24 C54 34 50 46 32 56 C14 46 10 34 12 24 C14 14 24 8 32 8 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />

        {/* Dragon face — oval/shield */}
        <path d="M32 12 C38 12 46 17 47 26 C48 35 44 44 32 52 C20 44 16 35 17 26 C18 17 26 12 32 12 Z"
          fill={`url(#${id}-face)`} />

        {/* Snout / muzzle */}
        <ellipse cx="32" cy="38" rx="10" ry="6" fill="#e2e8f0" />
        <ellipse cx="32" cy="37" rx="8" ry="4.5" fill="#f1f5f9" />
        {/* Nostrils */}
        <ellipse cx="29" cy="37" rx="1.5" ry="1" fill="#94a3b8" />
        <ellipse cx="35" cy="37" rx="1.5" ry="1" fill="#94a3b8" />

        {/* Brow ridge */}
        <path d="M22 22 C24 19 28 18 32 18 C36 18 40 19 42 22"
          stroke={`url(#${id}-gold)`} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Left eye */}
        <ellipse cx="25" cy="26" rx="4" ry="3.5" fill="black" />
        <ellipse cx="25" cy="26" rx="3.2" ry="2.8" fill={`url(#${id}-eye)`} filter={`url(#${id}-eye-glow)`}
          style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />
        <circle cx="23.5" cy="24.5" r="1" fill="white" fillOpacity="0.9" />
        {/* Right eye */}
        <ellipse cx="39" cy="26" rx="4" ry="3.5" fill="black" />
        <ellipse cx="39" cy="26" rx="3.2" ry="2.8" fill={`url(#${id}-eye)`} filter={`url(#${id}-eye-glow)`}
          style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite", animationDelay: "0.3s" }} />
        <circle cx="37.5" cy="24.5" r="1" fill="white" fillOpacity="0.9" />

        {/* Gold scale lines */}
        <path d="M25 30 C28 28 36 28 39 30" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.6" />
        <path d="M27 33 C29 31 35 31 37 33" stroke={`url(#${id}-gold)`} strokeWidth="0.8" fill="none" strokeOpacity="0.5" />

        {/* Bottom jaw */}
        <path d="M23 42 C26 46 38 46 41 42" stroke={`url(#${id}-gold)`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </SvgBadge>
    </BadgeWrap>
  );
}
