"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function WindBadge({ size = 32 }: BadgeProps) {
  const id = `wind-${size}`;
  return (
    <BadgeWrap size={size} title="Wind">
      <SvgBadge size={size} style={{ animation: "cosm-ring-spin 8s linear infinite", transformOrigin: "32px 32px" }}>
        <defs>
          <linearGradient id={`${id}-teal`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0"/><stop offset="40%" stopColor="#34d399"/>
            <stop offset="100%" stopColor="#059669"/>
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Cyclone spiral arcs */}
        <path d="M32 32 C32 32 48 28 52 18 C48 28 44 32 32 32 C20 32 16 26 18 14 C16 26 18 32 32 32 Z"
          fill={`url(#${id}-teal)`} fillOpacity="0.7" style={{animation:"cosm-ring-spin 4s linear infinite",transformOrigin:"32px 32px"}}/>
        <path d="M32 32 C32 32 20 14 10 16 C20 16 28 22 32 32 C36 42 32 50 22 52 C32 52 40 44 32 32 Z"
          fill={`url(#${id}-teal)`} fillOpacity="0.55" style={{animation:"cosm-ring-spin 4s linear infinite reverse",transformOrigin:"32px 32px"}}/>
        {/* Gold shield */}
        <path d="M32 6 L48 12 L50 30 L44 46 L32 54 L20 46 L14 30 L16 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 10 L45 15 L47 30 L42 44 L32 50 L22 44 L17 30 L19 15 Z" fill="#01100a"/>
        {/* Wind swirls inside */}
        <path d="M24 20 C28 16 36 18 38 24 C40 30 36 36 30 36 C24 36 20 30 22 24" 
          stroke={`url(#${id}-teal)`} strokeWidth="2" fill="none" strokeLinecap="round" filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <path d="M26 24 C29 20 35 22 36 27 C37 32 34 36 30 35"
          stroke={`url(#${id}-teal)`} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite",animationDelay:"0.3s"}}/>
        {/* Wind dots */}
        {[[20,16],[42,16],[14,28],[48,32],[22,44],[42,42]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill="#34d399"
            style={{animation:`sticker-float ${1.2+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}/>
        ))}
        {/* Center gem */}
        <circle cx="32" cy="30" r="5" fill={`url(#${id}-teal)`} filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 1.8s ease-in-out infinite"}}/>
        <circle cx="32" cy="29" r="2" fill="white" fillOpacity="0.9" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
        {/* Crown */}
        <path d="M24 15 L27 9 L30 13 L32 7 L34 13 L37 9 L40 15" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
