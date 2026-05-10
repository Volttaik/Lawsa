"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function EarthBadge({ size = 32 }: BadgeProps) {
  const id = `erth-${size}`;
  return (
    <BadgeWrap size={size} title="Earth">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-stone`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8a29e"/><stop offset="50%" stopColor="#78716c"/>
            <stop offset="100%" stopColor="#44403c"/>
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <radialGradient id={`${id}-gem`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#86efac"/><stop offset="40%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#14532d"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Stone pillar wings */}
        <path d="M14 28 L8 22 L6 30 L2 26 L4 34 L10 32 Z" fill={`url(#${id}-stone)`}/>
        <path d="M14 36 L6 32 L4 38 L0 36 L2 42 L8 40 Z" fill={`url(#${id}-stone)`} opacity="0.8"/>
        <path d="M50 28 L56 22 L58 30 L62 26 L60 34 L54 32 Z" fill={`url(#${id}-stone)`}/>
        <path d="M50 36 L58 32 L60 38 L64 36 L62 42 L56 40 Z" fill={`url(#${id}-stone)`} opacity="0.8"/>
        {/* Gold shield outer */}
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        {/* Stone inner */}
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z" fill={`url(#${id}-stone)`}/>
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z" fill="#2a1f00" opacity="0.6"/>
        {/* Stone texture cracks */}
        <path d="M32 10 L30 18 L34 22 L30 30" stroke="#78716c" strokeWidth="0.8" fill="none" strokeOpacity="0.5"/>
        <path d="M40 18 L38 24 L42 28 L38 34" stroke="#78716c" strokeWidth="0.6" fill="none" strokeOpacity="0.4"/>
        <path d="M24 18 L26 24 L22 28 L26 34" stroke="#78716c" strokeWidth="0.6" fill="none" strokeOpacity="0.4"/>
        {/* Crown of stone spikes */}
        <path d="M22 14 L25 6 L28 12 L32 4 L36 12 L39 6 L42 14" fill={`url(#${id}-gold)`}/>
        {/* Emerald gem centerpiece */}
        <polygon points="32,18 42,32 32,44 22,32" fill={`url(#${id}-gem)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2.5s ease-in-out infinite"}}/>
        <polygon points="32,18 42,32 32,32" fill="white" fillOpacity="0.25"/>
        <circle cx="32" cy="28" r="3" fill="white" fillOpacity="0.85" style={{animation:"sticker-ice-shimmer 2s ease-in-out infinite"}}/>
        {/* Stone runes */}
        {[[20,36],[44,36]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="2" fill={`url(#${id}-gem)`} fillOpacity="0.6"
            style={{animation:`sticker-ice-shimmer ${1.5+i*0.4}s ease-in-out infinite`}}/>
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
