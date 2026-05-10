"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function DivineBadge({ size = 32 }: BadgeProps) {
  const id = `divn-${size}`;
  return (
    <BadgeWrap size={size} title="Divine">
      <SvgBadge size={size} style={{ animation: "cosm-aura-pulse 2.5s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="35%" stopColor="#fbbf24"/>
            <stop offset="70%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white"/><stop offset="30%" stopColor="#fef9c3"/>
            <stop offset="70%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* 8-pointed star frame */}
        {[0,22.5,45,67.5,90,112.5,135,157.5].map((deg,i)=>{
          const r=(deg*Math.PI)/180, inner=12, outer=i%2===0?30:22;
          const x1=32+inner*Math.cos(r), y1=32+inner*Math.sin(r);
          const x2=32+outer*Math.cos(r), y2=32+outer*Math.sin(r);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={`url(#${id}-gold)`} strokeWidth={i%2===0?3:1.5} strokeLinecap="round"/>;
        })}
        {/* Outer circle rim */}
        <circle cx="32" cy="32" r="28" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.5" strokeOpacity="0.5"
          strokeDasharray="5 3" style={{animation:"cosm-ring-spin 6s linear infinite",transformOrigin:"32px 32px"}}/>
        <circle cx="32" cy="32" r="22" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="0.8" strokeOpacity="0.4"
          style={{animation:"cosm-ring-spin 4s linear infinite reverse",transformOrigin:"32px 32px"}}/>
        {/* Shield center */}
        <path d="M32 14 L42 20 L44 34 L32 46 L20 34 L22 20 Z" fill="#1a0e00" stroke={`url(#${id}-gold)`} strokeWidth="1.5"/>
        {/* Inner gold star */}
        <path d="M32 17 L34.5 25 L43 25 L36.2 30 L39 38 L32 33 L25 38 L27.8 30 L21 25 L29.5 25 Z"
          fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`} style={{animation:"cosm-star-spin 5s linear infinite",transformOrigin:"32px 28px"}}/>
        {/* Divine core */}
        <circle cx="32" cy="28" r="7" fill={`url(#${id}-core)`} filter={`url(#${id}-glow)`}/>
        <circle cx="32" cy="28" r="3" fill="white" fillOpacity="0.95" style={{animation:"sticker-ice-shimmer 1.2s ease-in-out infinite"}}/>
        {/* Orbiting sparkles */}
        {[0,60,120,180,240,300].map((deg,i)=>{
          const r=(deg*Math.PI)/180;
          return <circle key={i} cx={32+18*Math.cos(r)} cy={32+18*Math.sin(r)} r="1.5" fill="#fef9c3"
            style={{animation:`sticker-ice-shimmer ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>;
        })}
      </SvgBadge>
    </BadgeWrap>
  );
}
