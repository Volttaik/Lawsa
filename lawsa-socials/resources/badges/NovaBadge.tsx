"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function NovaBadge({ size = 32 }: BadgeProps) {
  const id = `nova-${size}`;
  return (
    <BadgeWrap size={size} title="Nova">
      <SvgBadge size={size} style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }}>
        <defs>
          <radialGradient id={`${id}-burst`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white"/><stop offset="20%" stopColor="#fef3c7"/>
            <stop offset="50%" stopColor="#fb923c"/><stop offset="80%" stopColor="#dc2626"/>
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Burst rays — 8 directions */}
        {[0,22.5,45,67.5,90,112.5,135,157.5].map((deg,i)=>{
          const r=(deg*Math.PI)/180;
          const x2=32+30*Math.cos(r), y2=32+30*Math.sin(r);
          return <line key={i} x1="32" y1="32" x2={x2} y2={y2}
            stroke={`url(#${id}-gold)`} strokeWidth={i%2===0?2:1} strokeOpacity={i%2===0?0.7:0.4}
            strokeLinecap="round"
            style={{animation:`sticker-float ${1.5+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}/>;
        })}
        {/* Outer gold ring */}
        <circle cx="32" cy="32" r="22" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="2" filter={`url(#${id}-glow)`}
          style={{animation:"cosm-ring-spin 6s linear infinite",transformOrigin:"32px 32px"}} strokeDasharray="10 4"/>
        {/* Inner shield */}
        <path d="M32 10 L44 15 L47 30 L42 44 L32 50 L22 44 L17 30 L20 15 Z" fill="#1a0500"/>
        {/* Burst core */}
        <circle cx="32" cy="32" r="16" fill={`url(#${id}-burst)`} filter={`url(#${id}-glow)`}/>
        {/* Hot center */}
        <circle cx="32" cy="32" r="7" fill="white" fillOpacity="0.9" style={{animation:"sticker-ice-shimmer 0.9s ease-in-out infinite"}}/>
        {/* Orbiting dots */}
        {[0,90,180,270].map((deg,i)=>{
          const r=(deg*Math.PI)/180;
          return <circle key={i} cx={32+14*Math.cos(r)} cy={32+14*Math.sin(r)} r="2" fill="#fef3c7"
            style={{animation:`sticker-ice-shimmer ${1+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>;
        })}
      </SvgBadge>
    </BadgeWrap>
  );
}
