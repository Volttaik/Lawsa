"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function CosmicBadge({ size = 32 }: BadgeProps) {
  const id = `cosm-${size}`;
  return (
    <BadgeWrap size={size} title="Cosmic">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-multi`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171"/><stop offset="25%" stopColor="#fb923c"/>
            <stop offset="50%" stopColor="#facc15"/><stop offset="75%" stopColor="#4ade80"/>
            <stop offset="100%" stopColor="#818cf8"/>
          </linearGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Rainbow outer glow ring */}
        <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#${id}-multi)`} strokeWidth="2.5" filter={`url(#${id}-glow)`}
          style={{animation:"cosm-ring-spin 4s linear infinite",transformOrigin:"32px 32px"}}/>
        {/* Gold wings */}
        <path d="M16 28 C8 20 2 14 0 8 C2 16 6 24 10 30 Z" fill={`url(#${id}-gold)`} opacity="0.75"/>
        <path d="M16 36 C8 30 2 26 0 20 C2 28 6 34 10 36 Z" fill={`url(#${id}-gold)`} opacity="0.6"/>
        <path d="M48 28 C56 20 62 14 64 8 C62 16 58 24 54 30 Z" fill={`url(#${id}-gold)`} opacity="0.75"/>
        <path d="M48 36 C56 30 62 26 64 20 C62 28 58 34 54 36 Z" fill={`url(#${id}-gold)`} opacity="0.6"/>
        {/* Gold shield frame */}
        <path d="M32 6 L48 12 L50 30 L44 46 L32 54 L20 46 L14 30 L16 12 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 10 L44 15 L46 30 L41 43 L32 50 L23 43 L18 30 L20 15 Z" fill="#0a0018"/>
        {/* Rainbow cosmic gem */}
        <polygon points="32,16 42,30 32,44 22,30" fill={`url(#${id}-multi)`} filter={`url(#${id}-glow)`}
          style={{animation:"cosm-star-spin 5s linear infinite",transformOrigin:"32px 30px"}}/>
        <polygon points="32,16 42,30 32,30" fill="white" fillOpacity="0.2"/>
        {/* Orbiting color dots */}
        {["#f87171","#facc15","#4ade80","#818cf8","#e879f9","#38bdf8"].map((c,i)=>{
          const deg=(i*60*Math.PI)/180;
          return <circle key={i} cx={32+14*Math.cos(deg)} cy={32+14*Math.sin(deg)} r="2" fill={c}
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`,filter:`drop-shadow(0 0 3px ${c})`}}/>;
        })}
        {/* White center */}
        <circle cx="32" cy="30" r="4" fill="white" fillOpacity="0.95" style={{animation:"sticker-ice-shimmer 1.2s ease-in-out infinite"}}/>
        {/* Crown */}
        <path d="M24 15 L27 9 L30 13 L32 7 L34 13 L37 9 L40 15" fill={`url(#${id}-gold)`}/>
        {/* Star sparkles */}
        {[[14,12],[50,12],[10,32],[54,32]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill="white"
            style={{animation:`sticker-ice-shimmer ${1+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
