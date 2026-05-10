"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function WarriorBadge({ size = 32 }: BadgeProps) {
  const id = `warr-${size}`;
  return (
    <BadgeWrap size={size} title="Warrior">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <radialGradient id={`${id}-ruby`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${id}-ruby-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Spiky outer silver wings */}
        <path d="M18 28 L8 20 L10 28 L4 26 L8 34 L14 32 Z" fill={`url(#${id}-silver)`} />
        <path d="M18 28 L6 14 L12 22 L10 14 L16 20 Z" fill={`url(#${id}-silver)`} opacity="0.8" />
        <path d="M46 28 L56 20 L54 28 L60 26 L56 34 L50 32 Z" fill={`url(#${id}-silver)`} />
        <path d="M46 28 L58 14 L52 22 L54 14 L48 20 Z" fill={`url(#${id}-silver)`} opacity="0.8" />

        {/* Outer gold frame */}
        <path d="M32 6 L48 12 L52 30 L44 46 L32 54 L20 46 L12 30 L16 12 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />
        {/* Silver inner frame */}
        <path d="M32 10 L45 15 L48 30 L42 44 L32 50 L22 44 L16 30 L19 15 Z"
          fill={`url(#${id}-silver)`} />
        {/* Dark inner shield */}
        <path d="M32 14 L43 18 L45 30 L41 42 L32 46 L23 42 L19 30 L21 18 Z"
          fill="#1a0000" />

        {/* Spike crown */}
        <path d="M22 14 L25 6 L28 12 L32 4 L36 12 L39 6 L42 14"
          fill={`url(#${id}-gold)`} />

        {/* Ruby gem — shield shape */}
        <path d="M32 18 L42 28 L38 42 L26 42 L22 28 Z"
          fill={`url(#${id}-ruby)`} filter={`url(#${id}-ruby-glow)`}
          style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />
        {/* Gem facet */}
        <path d="M32 18 L42 28 L32 30 Z" fill="white" fillOpacity="0.25" />
        <path d="M22 28 L32 30 L26 42 Z" fill="black" fillOpacity="0.2" />
        <circle cx="32" cy="26" r="3" fill="white" fillOpacity="0.8"
          style={{ animation: "sticker-ice-shimmer 1.8s ease-in-out infinite" }} />

        {/* Cross detail */}
        <line x1="32" y1="18" x2="32" y2="42" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="22" y1="28" x2="42" y2="28" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />

        {/* Silver star accents */}
        {[[18, 20], [46, 20], [14, 34], [50, 34]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="white" fillOpacity="0.8"
            style={{ animation: `sticker-ice-shimmer ${1 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}

        {/* Bottom base */}
        <path d="M24 50 L20 56 L32 60 L44 56 L40 50" fill={`url(#${id}-gold)`} />
      </SvgBadge>
    </BadgeWrap>
  );
}
