"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function RubyBadge({ size = 32 }: BadgeProps) {
  const id = `ruby-${size}`;
  return (
    <BadgeWrap size={size} title="Ruby">
      <SvgBadge size={size} style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }}>
        <defs>
          <radialGradient id={`${id}-gem`} cx="38%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5"/><stop offset="35%" stopColor="#f87171"/>
            <stop offset="70%" stopColor="#dc2626"/><stop offset="100%" stopColor="#7f1d1d"/>
          </radialGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Gold wings */}
        <path d="M18 30 C12 22 6 16 2 10 C4 18 8 26 10 32 Z" fill={`url(#${id}-gold)`} opacity="0.75"/>
        <path d="M18 36 C10 30 4 26 2 20 C4 28 8 34 12 36 Z" fill={`url(#${id}-gold)`} opacity="0.6"/>
        <path d="M46 30 C52 22 58 16 62 10 C60 18 56 26 54 32 Z" fill={`url(#${id}-gold)`} opacity="0.75"/>
        <path d="M46 36 C54 30 60 26 62 20 C60 28 56 34 52 36 Z" fill={`url(#${id}-gold)`} opacity="0.6"/>
        {/* Gold outer frame */}
        <path d="M32 4 L50 12 L52 32 L44 50 L32 58 L20 50 L12 32 L14 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L46 15 L48 32 L41 47 L32 54 L23 47 L16 32 L18 15 Z" fill="#2d0000"/>
        {/* Ruby gem — multifacet diamond */}
        <polygon points="32,14 46,32 38,50 26,50 18,32" fill={`url(#${id}-gem)`} filter={`url(#${id}-glow)`}/>
        {/* Facets */}
        <polygon points="32,14 46,32 32,32" fill="white" fillOpacity="0.25"/>
        <polygon points="18,32 32,32 26,50" fill="black" fillOpacity="0.2"/>
        <polygon points="32,14 32,32 26,50" fill="black" fillOpacity="0.1"/>
        <polygon points="32,14 32,32 38,50" fill="white" fillOpacity="0.07"/>
        {/* Gem shine */}
        <circle cx="28" cy="22" r="3" fill="white" fillOpacity="0.8" style={{animation:"sticker-ice-shimmer 1.6s ease-in-out infinite"}}/>
        <circle cx="36" cy="28" r="1.5" fill="white" fillOpacity="0.6" style={{animation:"sticker-ice-shimmer 2s ease-in-out infinite",animationDelay:"0.4s"}}/>
        {/* Crown */}
        <path d="M24 14 L27 8 L30 12 L32 6 L34 12 L37 8 L40 14" fill={`url(#${id}-gold)`}/>
        {/* Vertex sparks */}
        {[[32,4],[50,12],[12,12]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.8" fill="#fef9c3" style={{animation:`sticker-ice-shimmer ${1+i*0.3}s ease-in-out infinite`}}/>
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
