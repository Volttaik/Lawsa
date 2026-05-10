"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function FrostBadge({ size = 32 }: BadgeProps) {
  const id = `frst-${size}`;
  return (
    <BadgeWrap size={size} title="Frost">
      <SvgBadge size={size} style={{ animation: "sticker-float 3.2s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-ice`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe"/><stop offset="40%" stopColor="#7dd3fc"/>
            <stop offset="80%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#0369a1"/>
          </linearGradient>
          <linearGradient id={`${id}-silver`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc"/><stop offset="50%" stopColor="#cbd5e1"/>
            <stop offset="100%" stopColor="#64748b"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Snowflake arms */}
        {[0,30,60,90,120,150].map((deg,i) => {
          const r = (deg*Math.PI)/180;
          const x1=32+5*Math.cos(r), y1=32+5*Math.sin(r), x2=32+26*Math.cos(r), y2=32+26*Math.sin(r);
          const mx=32+18*Math.cos(r), my=32+18*Math.sin(r);
          const px1=mx+6*Math.cos(r+Math.PI/4), py1=my+6*Math.sin(r+Math.PI/4);
          const px2=mx+6*Math.cos(r-Math.PI/4), py2=my+6*Math.sin(r-Math.PI/4);
          return <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#${id}-ice)`} strokeWidth="2.5" strokeLinecap="round"/>
            <line x1={mx} y1={my} x2={px1} y2={py1} stroke={`url(#${id}-ice)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
            <line x1={mx} y1={my} x2={px2} y2={py2} stroke={`url(#${id}-ice)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
            <circle cx={x2} cy={y2} r="2" fill="#bae6fd" fillOpacity="0.9" style={{animation:`sticker-ice-shimmer ${1+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>
          </g>;
        })}
        {/* Center gem */}
        <polygon points="32,22 40,32 32,42 24,32" fill={`url(#${id}-ice)`} filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <polygon points="32,22 40,32 32,32" fill="white" fillOpacity="0.3"/>
        <circle cx="32" cy="29" r="3" fill="white" fillOpacity="0.9" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
        {/* Silver outer ring */}
        <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#${id}-silver)`} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 3" style={{animation:"cosm-ring-spin 8s linear infinite",transformOrigin:"32px 32px"}}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
