"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";

export default function InfernoBadge({ size = 32 }: BadgeProps) {
  const id = `infn-${size}`;
  return (
    <BadgeWrap size={size} title="Inferno">
      <SvgBadge size={size} style={{ animation: "cosm-fire-flicker 0.95s ease-in-out infinite", transformOrigin: "32px 48px" }}>
        <defs>
          <radialGradient id={`${id}-core`} cx="50%" cy="70%" r="70%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Flame aura */}
        <ellipse cx="32" cy="52" rx="20" ry="8" fill="#dc2626" fillOpacity="0.2" />
        {/* Side flames */}
        <path d="M18 40 C12 30 10 18 16 10 C12 20 14 32 18 38 Z" fill="#f97316" fillOpacity="0.6" />
        <path d="M46 40 C52 30 54 18 48 10 C52 20 50 32 46 38 Z" fill="#f97316" fillOpacity="0.6" />

        {/* Outer gold frame */}
        <path d="M32 4 C32 4 16 14 12 28 C10 38 16 50 32 58 C48 50 54 38 52 28 C48 14 32 4 32 4 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} />

        {/* Dark shield body */}
        <path d="M32 8 C32 8 18 17 15 29 C13 38 18 48 32 54 C46 48 51 38 49 29 C46 17 32 8 32 8 Z"
          fill="#1a0500" />

        {/* Main flame body */}
        <path d="M32 10 C32 10 20 22 20 34 C20 44 25 52 32 52 C39 52 44 44 44 34 C44 22 32 10 32 10 Z"
          fill={`url(#${id}-core)`} filter={`url(#${id}-glow)`} />

        {/* Inner hot core */}
        <path d="M32 22 C32 22 24 30 24 36 C24 42 27.5 48 32 48 C36.5 48 40 42 40 36 C40 30 32 22 32 22 Z"
          fill="white" fillOpacity="0.6" />

        {/* Tip spark */}
        <circle cx="32" cy="10" r="3" fill="white" fillOpacity="0.95"
          style={{ filter: "drop-shadow(0 0 4px white)", animation: "sticker-ice-shimmer 0.8s ease-in-out infinite" }} />

        {/* Gold crown spikes */}
        <path d="M22 18 L25 10 L28 16 L32 8 L36 16 L39 10 L42 18"
          fill={`url(#${id}-gold)`} opacity="0.9" />

        {/* Ember sparks */}
        {[[14, 28], [50, 28], [10, 38], [54, 38], [18, 16], [46, 16]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#fb923c"
            style={{ animation: `sticker-float ${1.2 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
