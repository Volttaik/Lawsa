"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function VoidBadge({ size = 32 }: BadgeProps) {
  const id = `void-${size}`;
  return (
    <BadgeWrap size={size} title="Void">
      <SvgBadge size={size}>
        <defs>
          <radialGradient id={`${id}-hole`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#1e1040"/>
            <stop offset="80%" stopColor="#312e81"/><stop offset="100%" stopColor="#4c1d95"/>
          </radialGradient>
          <radialGradient id={`${id}-rim`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8"/>
          </radialGradient>
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#92400e"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Tendrils */}
        {[0,40,80,120,160,200,240,280,320].map((deg,i)=>{
          const r=(deg*Math.PI)/180, len=18+i%3*4;
          return <line key={i} x1="32" y1="32" x2={32+len*Math.cos(r)} y2={32+len*Math.sin(r)}
            stroke="#a78bfa" strokeWidth={1+(i%2)*0.5} strokeOpacity={0.4+(i%3)*0.15} strokeLinecap="round"
            style={{animation:`sticker-float ${1.5+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}/>;
        })}
        {/* Gold outer shield */}
        <path d="M32 4 L48 10 L52 30 L44 48 L32 58 L20 48 L12 30 L16 10 Z" fill={`url(#${id}-gold)`} filter={`url(#${id}-glow)`}/>
        <path d="M32 8 L45 13 L49 30 L42 46 L32 54 L22 46 L15 30 L19 13 Z" fill="#0a0014"/>
        {/* Void event horizon */}
        <circle cx="32" cy="32" r="18" fill={`url(#${id}-hole)`} style={{animation:"sticker-void-rotate 4s linear infinite",transformOrigin:"32px 32px"}}/>
        {/* Purple rim glow */}
        <circle cx="32" cy="32" r="18" fill={`url(#${id}-rim)`} filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 2.5s ease-in-out infinite"}}/>
        {/* Swirl lines inside */}
        <g style={{animation:"sticker-void-rotate 6s linear infinite",transformOrigin:"32px 32px"}}>
          <path d="M32 20 C40 24 40 40 32 44 C24 40 24 24 32 20 Z" fill="#7c3aed" fillOpacity="0.25"/>
        </g>
        {/* Eye center */}
        <circle cx="32" cy="32" r="6" fill="#000" style={{filter:"drop-shadow(0 0 8px #7c3aed)"}}/>
        <ellipse cx="32" cy="32" rx="3" ry="5" fill="#a78bfa" style={{animation:"cosm-aura-pulse 1.8s ease-in-out infinite"}}/>
        <circle cx="32" cy="32" r="1.5" fill="white" fillOpacity="0.9" style={{animation:"sticker-ice-shimmer 1.2s ease-in-out infinite"}}/>
        {/* Stars */}
        {[[18,14],[46,14],[14,42],[50,42]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.2" fill="#c4b5fd" fillOpacity="0.7"
            style={{animation:`sticker-ice-shimmer ${1+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
        {/* Crown */}
        <path d="M24 13 L27 7 L30 11 L32 5 L34 11 L37 7 L40 13" fill={`url(#${id}-gold)`}/>
      </SvgBadge>
    </BadgeWrap>
  );
}
