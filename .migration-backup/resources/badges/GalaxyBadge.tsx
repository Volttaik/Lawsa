"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function GalaxyBadge({ size = 32 }: BadgeProps) {
  const id = `glxy-${size}`;
  return (
    <BadgeWrap size={size} title="Galaxy">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="40%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <radialGradient id={`${id}-space`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#312e81"/><stop offset="60%" stopColor="#1e1b4b"/>
            <stop offset="100%" stopColor="#0f0a2e"/>
          </radialGradient>
          <radialGradient id={`${id}-galaxy`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a"/><stop offset="25%" stopColor="#818cf8" stopOpacity="0.9"/>
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.5"/><stop offset="100%" stopColor="#1e1b4b" stopOpacity="0"/>
          </radialGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Cosmic wings */}
        <path d="M18 30 C10 22 4 16 2 10 C4 18 8 24 12 30 Z" fill="#312e81" opacity="0.8"/>
        <path d="M18 34 C10 28 4 24 2 18 C4 26 8 32 12 34 Z" fill="#4c1d95" opacity="0.65"/>
        <path d="M46 30 C54 22 60 16 62 10 C60 18 56 24 52 30 Z" fill="#312e81" opacity="0.8"/>
        <path d="M46 34 C54 28 60 24 62 18 C60 26 56 32 52 34 Z" fill="#4c1d95" opacity="0.65"/>
        {/* Gold outline on wings */}
        <path d="M18 30 C10 22 4 16 2 10" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.6"/>
        <path d="M46 30 C54 22 60 16 62 10" stroke={`url(#${id}-gold)`} strokeWidth="1" fill="none" strokeOpacity="0.6"/>
        {/* Gold shield frame */}
        <path d="M32 6 L47 12 L50 30 L44 46 L32 54 L20 46 L14 30 L17 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 10 L44 15 L47 30 L42 44 L32 50 L22 44 L17 30 L20 15 Z" fill={`url(#${id}-space)`}/>
        {/* Galaxy spiral */}
        <g style={{animation:"sticker-void-rotate 6s linear infinite",transformOrigin:"32px 32px"}}>
          <path d="M32 32 C32 32 50 22 54 12 C50 22 44 28 32 32 Z" fill="#818cf8" fillOpacity="0.7"/>
          <path d="M32 32 C32 32 14 42 10 52 C14 42 22 36 32 32 Z" fill="#818cf8" fillOpacity="0.7"/>
          <path d="M32 32 C32 32 44 50 54 50 C44 44 38 40 32 32 Z" fill="#a78bfa" fillOpacity="0.5"/>
          <path d="M32 32 C32 32 20 14 10 14 C20 20 26 26 32 32 Z" fill="#a78bfa" fillOpacity="0.5"/>
        </g>
        {/* Stars inside shield */}
        {[[24,18],[40,18],[20,30],[44,30],[24,42],[40,42]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={1+(i%2)*0.5} fill="white" fillOpacity={0.5+(i%3)*0.15}
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}/>
        ))}
        {/* Center gem */}
        <circle cx="32" cy="32" r="6" fill="url(#glxy-galaxy)" filter={`url(#${id}-glow)`}/>
        <circle cx="32" cy="32" r="3" fill="white" fillOpacity="0.95" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
        {/* Crown */}
        <path d="M24 15 L27 9 L30 13 L32 7 L34 13 L37 9 L40 15" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
