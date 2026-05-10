"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function SolarBadge({ size = 32 }: BadgeProps) {
  const id = `solr-${size}`;
  return (
    <BadgeWrap size={size} title="Solar">
      <SvgBadge size={size} style={{ animation: "cosm-star-spin 8s linear infinite", transformOrigin: "32px 32px" }}>
        <defs>
          <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="40%" stopColor="#fbbf24"/>
            <stop offset="80%" stopColor="#f97316"/><stop offset="100%" stopColor="#b45309"/>
          </radialGradient>
          <radialGradient id={`${id}-corona`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Solar rays — 12 points */}
        {Array.from({length:12},(_,i)=>{
          const deg=(i*30*Math.PI)/180;
          const x1=32+16*Math.cos(deg), y1=32+16*Math.sin(deg);
          const x2=32+28*Math.cos(deg), y2=32+28*Math.sin(deg);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#fbbf24" strokeWidth={i%3===0?3:1.5} strokeLinecap="round" strokeOpacity={i%3===0?0.9:0.6}/>;
        })}
        {/* Corona glow */}
        <circle cx="32" cy="32" r="18" fill={`url(#${id}-corona)`} filter={`url(#${id}-glow)`}/>
        {/* Sun body */}
        <circle cx="32" cy="32" r="14" fill={`url(#${id}-sun)`} filter={`url(#${id}-glow)`}/>
        {/* Surface detail */}
        <circle cx="26" cy="27" r="3" fill="#fef9c3" fillOpacity="0.4"/>
        <circle cx="36" cy="35" r="2" fill="#fef9c3" fillOpacity="0.3"/>
        {/* Center bright spot */}
        <circle cx="32" cy="32" r="5" fill="white" fillOpacity="0.9" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
        {/* Outer gold ring */}
        <circle cx="32" cy="32" r="30" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 4"/>
      </SvgBadge>
    </BadgeWrap>
  );
}
