"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function StormBadge({ size = 32 }: BadgeProps) {
  const id = `strm-${size}`;
  return (
    <BadgeWrap size={size} title="Storm">
      <SvgBadge size={size} style={{ animation: "cosm-lightning-zap 2.4s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="40%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#b45309"/>
          </linearGradient>
          <linearGradient id={`${id}-bolt`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#ede9fe"/><stop offset="40%" stopColor="#a78bfa"/>
            <stop offset="100%" stopColor="#5b21b6"/>
          </linearGradient>
          <linearGradient id={`${id}-cloud`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155"/><stop offset="100%" stopColor="#1e293b"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Outer gold shield frame */}
        <path d="M32 4 L48 10 L52 28 L44 46 L32 56 L20 46 L12 28 L16 10 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L45 13 L49 28 L42 43 L32 52 L22 43 L15 28 L19 13 Z" fill="#0f172a"/>
        {/* Storm cloud */}
        <ellipse cx="32" cy="22" rx="16" ry="9" fill={`url(#${id}-cloud)`}/>
        <ellipse cx="22" cy="20" rx="10" ry="8" fill="#334155"/>
        <ellipse cx="42" cy="20" rx="10" ry="8" fill="#334155"/>
        <ellipse cx="32" cy="24" rx="14" ry="7" fill="#475569"/>
        {/* Lightning bolt */}
        <path d="M36 14 L22 34 H30 L28 50 L46 28 H38 Z" fill={`url(#${id}-bolt)`} filter={`url(#${id}-glow)`}/>
        <path d="M36 14 L22 34 H30 L33 24 Z" fill="white" fillOpacity="0.25"/>
        {/* Spark dots */}
        {[[48,18],[50,26],[12,32]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.8" fill="#c4b5fd" style={{animation:`sticker-ice-shimmer ${0.9+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
        {/* Crown spikes */}
        <path d="M22 13 L25 7 L28 11 L32 5 L36 11 L39 7 L42 13" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
