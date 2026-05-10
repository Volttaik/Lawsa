"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function TechBadge({ size = 32 }: BadgeProps) {
  const id = `tech-${size}`;
  return (
    <BadgeWrap size={size} title="Tech">
      <SvgBadge size={size} style={{ animation: "sticker-pulse-scale 2.5s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-cyan`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc"/><stop offset="50%" stopColor="#22d3ee"/>
            <stop offset="100%" stopColor="#0891b2"/>
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Hex wings */}
        <path d="M18 28 C12 22 6 18 2 14 C4 20 8 26 12 30 Z" fill={`url(#${id}-cyan)`} opacity="0.7"/>
        <path d="M18 34 C10 30 4 28 2 22 C4 28 8 34 12 36 Z" fill={`url(#${id}-cyan)`} opacity="0.55"/>
        <path d="M46 28 C52 22 58 18 62 14 C60 20 56 26 52 30 Z" fill={`url(#${id}-cyan)`} opacity="0.7"/>
        <path d="M46 34 C54 30 60 28 62 22 C60 28 56 34 52 36 Z" fill={`url(#${id}-cyan)`} opacity="0.55"/>
        {/* Gold outer hex frame */}
        <polygon points="32,4 52,14 56,34 44,50 20,50 8,34 12,14" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <polygon points="32,8 49,17 52,34 42,47 22,47 12,34 15,17" fill="#0a1628"/>
        {/* Circuit grid */}
        <line x1="32" y1="14" x2="32" y2="46" stroke={`url(#${id}-cyan)`} strokeWidth="1.5" strokeOpacity="0.5"/>
        <line x1="18" y1="28" x2="46" y2="28" stroke={`url(#${id}-cyan)`} strokeWidth="1.5" strokeOpacity="0.5"/>
        <line x1="20" y1="20" x2="44" y2="36" stroke={`url(#${id}-cyan)`} strokeWidth="0.8" strokeOpacity="0.3"/>
        <line x1="44" y1="20" x2="20" y2="36" stroke={`url(#${id}-cyan)`} strokeWidth="0.8" strokeOpacity="0.3"/>
        {/* Nodes */}
        {[[32,14],[32,46],[18,28],[46,28],[20,20],[44,20],[20,36],[44,36]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="2" fill="#22d3ee"
            style={{animation:`sticker-ice-shimmer ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.1}s`,filter:"drop-shadow(0 0 3px #22d3ee)"}}/>
        ))}
        {/* CPU chip center */}
        <rect x="24" y="24" width="16" height="12" rx="2" fill="#0e2a3a" stroke={`url(#${id}-cyan)`} strokeWidth="1.2"/>
        <rect x="27" y="27" width="10" height="6" rx="1" fill="#22d3ee" fillOpacity="0.2"/>
        <circle cx="32" cy="30" r="3" fill="#22d3ee" filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 1.8s ease-in-out infinite"}}/>
        <circle cx="32" cy="30" r="1.2" fill="white" fillOpacity="0.95"/>
      </SvgBadge>
    </BadgeWrap>
  );
}
