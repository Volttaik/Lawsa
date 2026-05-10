"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function GoldBadge({ size = 32 }: BadgeProps) {
  const id = `gld-${size}`;
  return (
    <BadgeWrap size={size} title="Gold">
      <SvgBadge size={size} style={{ animation: "cosm-crown-shimmer 2.5s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb"/><stop offset="20%" stopColor="#fde68a"/>
            <stop offset="50%" stopColor="#fbbf24"/><stop offset="80%" stopColor="#d97706"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6"/>
            <stop offset="50%" stopColor="white" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Gold wings */}
        <path d="M18 28 C10 20 4 14 2 8 C4 16 8 24 12 30 Z" fill={`url(#${id}-grad)`} opacity="0.8"/>
        <path d="M18 34 C10 28 4 24 2 18 C4 26 8 32 12 34 Z" fill={`url(#${id}-grad)`} opacity="0.65"/>
        <path d="M46 28 C54 20 60 14 62 8 C60 16 56 24 52 30 Z" fill={`url(#${id}-grad)`} opacity="0.8"/>
        <path d="M46 34 C54 28 60 24 62 18 C60 26 56 32 52 34 Z" fill={`url(#${id}-grad)`} opacity="0.65"/>
        {/* Main shield — all gold */}
        <path d="M32 4 L50 12 L54 32 L46 50 L32 60 L18 50 L10 32 L14 12 Z"
          fill={`url(#${id}-grad)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 4 L50 12 L54 32 L46 50 L32 60 L18 50 L10 32 L14 12 Z"
          fill={`url(#${id}-shine)`}/>
        {/* Inner darker gold shield */}
        <path d="M32 10 L46 16 L49 32 L43 47 L32 55 L21 47 L15 32 L18 16 Z"
          fill="#b45309"/>
        <path d="M32 10 L46 16 L49 32 L43 47 L32 55 L21 47 L15 32 L18 16 Z"
          fill={`url(#${id}-shine)`} opacity="0.5"/>
        {/* Embossed crown */}
        <path d="M22 22 L26 14 L30 19 L32 13 L34 19 L38 14 L42 22 L40 26 L24 26 Z"
          fill={`url(#${id}-grad)`}/>
        <path d="M22 22 L26 14 L30 19 L32 13 L34 19 L38 14 L42 22 L40 26 L24 26 Z"
          fill={`url(#${id}-shine)`}/>
        {/* Gem */}
        <polygon points="32,28 40,38 32,46 24,38" fill={`url(#${id}-grad)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2s ease-in-out infinite"}}/>
        <polygon points="32,28 40,38 32,38" fill="white" fillOpacity="0.3"/>
        <circle cx="32" cy="35" r="3" fill="white" fillOpacity="0.95" style={{animation:"sticker-ice-shimmer 2s ease-in-out infinite"}}/>
        {/* Vertex dots */}
        {[[32,4],[50,12],[54,32],[46,50],[18,50],[10,32],[14,12]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="2" fill="#fef9c3" fillOpacity="0.9"
            style={{animation:`sticker-ice-shimmer ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
