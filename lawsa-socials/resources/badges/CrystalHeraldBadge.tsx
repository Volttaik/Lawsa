"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function CrystalHeraldBadge({ size = 32 }: BadgeProps) {
  const id = `crhr-${size}`;
  return (
    <BadgeWrap size={size} title="Crystal Herald">
      <SvgBadge size={size} style={{ animation: "cosm-crystal-refract 3.5s ease-in-out infinite" }}>
        <defs>
          <linearGradient id={`${id}-ice`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe"/><stop offset="35%" stopColor="#7dd3fc"/>
            <stop offset="70%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0369a1"/>
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <linearGradient id={`${id}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Ice shard wings */}
        <path d="M16 26 L8 18 L6 26 L2 20 L8 32 Z" fill={`url(#${id}-ice)`} opacity="0.8"/>
        <path d="M16 34 L6 28 L4 36 L2 30 L10 38 Z" fill={`url(#${id}-ice)`} opacity="0.65"/>
        <path d="M48 26 L56 18 L58 26 L62 20 L56 32 Z" fill={`url(#${id}-ice)`} opacity="0.8"/>
        <path d="M48 34 L58 28 L60 36 L62 30 L54 38 Z" fill={`url(#${id}-ice)`} opacity="0.65"/>
        {/* Gold outer shield */}
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        {/* Crystal hexagon body */}
        <polygon points="32,8 48,17 48,35 32,44 16,35 16,17" fill={`url(#${id}-ice)`}/>
        {/* Facet highlights */}
        <polygon points="32,8 48,17 32,26" fill={`url(#${id}-face)`}/>
        <polygon points="16,17 32,26 16,35" fill="black" fillOpacity="0.15"/>
        {/* Hex border */}
        <polygon points="32,8 48,17 48,35 32,44 16,35 16,17" fill="none" stroke="rgba(186,230,253,0.7)" strokeWidth="1.2"/>
        {/* Inner crystal gem */}
        <polygon points="32,15 41,26 32,35 23,26" fill="white" fillOpacity="0.7" filter={`url(#${id}-glow)`}
          style={{animation:"cosm-aura-pulse 2.2s ease-in-out infinite"}}/>
        <polygon points="32,15 41,26 32,26" fill="white" fillOpacity="0.4"/>
        {/* Vertex sparkles */}
        {[[32,8],[48,17],[48,35],[32,44],[16,35],[16,17]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="2.5" fill="white" fillOpacity="0.9"
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
        <circle cx="32" cy="23" r="3" fill="white" style={{animation:"sticker-ice-shimmer 1.5s ease-in-out infinite"}}/>
        {/* Crown */}
        <path d="M24 13 L27 7 L30 11 L32 5 L34 11 L37 7 L40 13" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
