"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function LunarBadge({ size = 32 }: BadgeProps) {
  const id = `lunr-${size}`;
  return (
    <BadgeWrap size={size} title="Lunar">
      <SvgBadge size={size} style={{ animation: "sticker-float 4s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="40%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <radialGradient id={`${id}-moon`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f8fafc"/><stop offset="40%" stopColor="#e2e8f0"/>
            <stop offset="80%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/>
          </radialGradient>
          <radialGradient id={`${id}-shadow`} cx="70%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Gold shield frame */}
        <path d="M32 4 L48 10 L52 30 L44 48 L32 58 L20 48 L12 30 L16 10 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L45 13 L49 30 L42 46 L32 54 L22 46 L15 30 L19 13 Z" fill="#0c1428"/>
        {/* Full moon */}
        <circle cx="32" cy="32" r="18" fill={`url(#${id}-moon)`}/>
        {/* Moon shadow (crescent illusion) */}
        <circle cx="38" cy="30" r="16" fill={`url(#${id}-shadow)`}/>
        {/* Craters */}
        <circle cx="24" cy="28" r="3" fill="#94a3b8" fillOpacity="0.4"/>
        <circle cx="36" cy="38" r="2" fill="#94a3b8" fillOpacity="0.3"/>
        <circle cx="28" cy="38" r="1.5" fill="#94a3b8" fillOpacity="0.3"/>
        {/* Moon glow */}
        <circle cx="32" cy="32" r="18" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3" filter={`url(#${id}-glow)`}/>
        {/* Stars around moon */}
        {[[18,16],[46,18],[14,38],[50,40],[28,14],[36,14]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.2" fill="white" fillOpacity={0.6+(i%3)*0.15}
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>
        ))}
        {/* Crown */}
        <path d="M24 13 L27 7 L30 11 L32 5 L34 11 L37 7 L40 13" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
