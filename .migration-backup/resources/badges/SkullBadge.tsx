"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function SkullBadge({ size = 32 }: BadgeProps) {
  const id = `skll-${size}`;
  return (
    <BadgeWrap size={size} title="Skull">
      <SvgBadge size={size}>
        <defs>
          <radialGradient id={`${id}-bone`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f8fafc"/><stop offset="50%" stopColor="#e2e8f0"/>
            <stop offset="100%" stopColor="#94a3b8"/>
          </radialGradient>
          <linearGradient id={`${id}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9"/><stop offset="50%" stopColor="#94a3b8"/>
            <stop offset="100%" stopColor="#334155"/>
          </linearGradient>
          <radialGradient id={`${id}-eye`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b"/><stop offset="70%" stopColor="#0f172a"/>
            <stop offset="100%" stopColor="#020617"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Bone wings */}
        <path d="M16 28 C10 22 4 16 2 10 C4 18 6 26 8 32 L12 32 Z" fill={`url(#${id}-bone)`} opacity="0.7"/>
        <path d="M16 34 C8 30 2 26 0 20 C2 28 6 34 10 36 Z" fill={`url(#${id}-bone)`} opacity="0.55"/>
        <path d="M48 28 C54 22 60 16 62 10 C60 18 58 26 56 32 L52 32 Z" fill={`url(#${id}-bone)`} opacity="0.7"/>
        <path d="M48 34 C56 30 62 26 64 20 C62 28 58 34 54 36 Z" fill={`url(#${id}-bone)`} opacity="0.55"/>
        {/* Silver shield frame */}
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z" fill={`url(#${id}-silver)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z" fill="#0f172a"/>
        {/* Skull shape */}
        <ellipse cx="32" cy="26" rx="13" ry="14" fill={`url(#${id}-bone)`}/>
        {/* Jaw */}
        <rect x="24" y="37" width="16" height="9" rx="3" fill={`url(#${id}-bone)`}/>
        {/* Jaw teeth gaps */}
        <rect x="27" y="40" width="2.5" height="6" fill="#0f172a" rx="1"/>
        <rect x="31" y="40" width="2.5" height="6" fill="#0f172a" rx="1"/>
        <rect x="35" y="40" width="2.5" height="6" fill="#0f172a" rx="1"/>
        {/* Eye sockets */}
        <ellipse cx="26" cy="25" rx="4.5" ry="4" fill={`url(#${id}-eye)`} style={{filter:"drop-shadow(0 0 4px rgba(0,0,0,0.8))"}}/>
        <ellipse cx="38" cy="25" rx="4.5" ry="4" fill={`url(#${id}-eye)`} style={{filter:"drop-shadow(0 0 4px rgba(0,0,0,0.8))"}}/>
        {/* Eye glow — dark blue */}
        <ellipse cx="26" cy="25" rx="3" ry="2.8" fill="#1e3a5f" style={{animation:"cosm-aura-pulse 2.2s ease-in-out infinite"}}/>
        <ellipse cx="38" cy="25" rx="3" ry="2.8" fill="#1e3a5f" style={{animation:"cosm-aura-pulse 2.2s ease-in-out infinite",animationDelay:"0.5s"}}/>
        {/* Nose cavity */}
        <path d="M30 30 L32 28 L34 30 L33 33 L31 33 Z" fill="#0f172a"/>
        {/* Forehead crack */}
        <path d="M32 12 C31 15 33 18 32 22" stroke="#94a3b8" strokeWidth="0.8" fill="none" strokeOpacity="0.5"/>
        {/* Crown */}
        <path d="M24 13 L27 7 L30 11 L32 5 L34 11 L37 7 L40 13" fill={`url(#${id}-silver)`}/>
        {/* Crown gems */}
        <circle cx="32" cy="6" r="2" fill="#1e3a5f" style={{animation:"sticker-ice-shimmer 1.8s ease-in-out infinite"}}/>
        <circle cx="27" cy="8" r="1.2" fill="#1e3a5f" style={{animation:"sticker-ice-shimmer 2.2s ease-in-out infinite"}}/>
        <circle cx="37" cy="8" r="1.2" fill="#1e3a5f" style={{animation:"sticker-ice-shimmer 2.2s ease-in-out infinite",animationDelay:"0.3s"}}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
