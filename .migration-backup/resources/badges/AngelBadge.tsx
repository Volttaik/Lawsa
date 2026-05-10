"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function AngelBadge({ size = 32 }: BadgeProps) {
  const id = `angl-${size}`;
  return (
    <BadgeWrap size={size} title="Angel">
      <SvgBadge size={size} style={{ animation: "sticker-float 3.5s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-white`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff"/><stop offset="50%" stopColor="#f0f9ff"/>
            <stop offset="100%" stopColor="#e0f2fe"/>
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#b45309"/>
          </linearGradient>
          <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0"/>
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.7"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Halo above */}
        <ellipse cx="32" cy="8" rx="14" ry="5" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="2.5"
          filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 2.2s ease-in-out infinite"}}/>
        <ellipse cx="32" cy="8" rx="14" ry="5" fill={`url(#${id}-halo)`}/>
        {/* Wide feathered wings */}
        {/* Left */}
        <path d="M20 28 C12 18 2 14 1 6 C4 12 8 20 10 28 L14 30 Z" fill={`url(#${id}-white)`} opacity="0.95"/>
        <path d="M20 34 C10 26 2 22 0 16 C4 22 8 30 12 34 Z" fill={`url(#${id}-white)`} opacity="0.8"/>
        <path d="M20 40 C12 36 6 34 4 30 C8 34 12 38 14 40 Z" fill={`url(#${id}-white)`} opacity="0.65"/>
        <path d="M20 46 C14 42 8 42 6 38 C10 42 14 46 16 46 Z" fill={`url(#${id}-white)`} opacity="0.5"/>
        {/* Right */}
        <path d="M44 28 C52 18 62 14 63 6 C60 12 56 20 54 28 L50 30 Z" fill={`url(#${id}-white)`} opacity="0.95"/>
        <path d="M44 34 C54 26 62 22 64 16 C60 22 56 30 52 34 Z" fill={`url(#${id}-white)`} opacity="0.8"/>
        <path d="M44 40 C52 36 58 34 60 30 C56 34 52 38 50 40 Z" fill={`url(#${id}-white)`} opacity="0.65"/>
        <path d="M44 46 C50 42 56 42 58 38 C54 42 50 46 48 46 Z" fill={`url(#${id}-white)`} opacity="0.5"/>
        {/* Wing gold tips */}
        <path d="M20 28 C12 18 2 14 1 6" stroke={`url(#${id}-gold)`} strokeWidth="0.8" fill="none" strokeOpacity="0.7"/>
        <path d="M44 28 C52 18 62 14 63 6" stroke={`url(#${id}-gold)`} strokeWidth="0.8" fill="none" strokeOpacity="0.7"/>
        {/* Body/robe — gold shield */}
        <path d="M32 18 L42 24 L44 38 L32 48 L20 38 L22 24 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 21 L40 26 L41 37 L32 45 L23 37 L24 26 Z" fill="white" fillOpacity="0.9"/>
        {/* Divine gem */}
        <polygon points="32,24 38,34 32,42 26,34" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <polygon points="32,24 38,34 32,34" fill="white" fillOpacity="0.4"/>
        <circle cx="32" cy="31" r="2.5" fill="white" fillOpacity="0.95" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
        {/* Light sparkles */}
        {[[12,12],[52,12],[8,30],[56,30]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill="white"
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
