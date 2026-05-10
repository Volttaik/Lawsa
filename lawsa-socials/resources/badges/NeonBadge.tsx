"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function NeonBadge({ size = 32 }: BadgeProps) {
  const id = `neon-${size}`;
  return (
    <BadgeWrap size={size} title="Neon">
      <SvgBadge size={size} style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9"/><stop offset="50%" stopColor="#22d3ee"/>
            <stop offset="100%" stopColor="#0891b2"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Outer neon rect frame */}
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#020a14"
          stroke={`url(#${id}-grad)`} strokeWidth="2.5" filter={`url(#${id}-glow)`}/>
        {/* Inner dashed ring */}
        <rect x="10" y="10" width="44" height="44" rx="9" fill="none"
          stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="7 4" strokeOpacity="0.6"
          style={{animation:"cosm-ring-spin 5s linear infinite",transformOrigin:"32px 32px"}}/>
        {/* Corner accents */}
        {[[10,10],[54,10],[10,54],[54,54]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="3" fill="#22d3ee" filter={`url(#${id}-glow)`}
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
        {/* Horizontal scan line */}
        <line x1="10" y1="32" x2="54" y2="32" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3"
          style={{animation:"cosm-aura-pulse 2.5s ease-in-out infinite"}}/>
        {/* Center emblem */}
        <circle cx="32" cy="32" r="12" fill="#022030" stroke={`url(#${id}-grad)`} strokeWidth="1.5"/>
        <circle cx="32" cy="32" r="7" fill="#22d3ee" fillOpacity="0.2" filter={`url(#${id}-glow)`}/>
        <circle cx="32" cy="32" r="4" fill="#22d3ee" filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 1.8s ease-in-out infinite"}}/>
        <circle cx="32" cy="32" r="2" fill="white" fillOpacity="0.95"/>
        {/* N symbol */}
        <path d="M26 38 L26 26 L38 38 L38 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0"/>
      </SvgBadge>
    </BadgeWrap>
  );
}
