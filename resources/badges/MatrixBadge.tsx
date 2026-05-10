"use client";
import { BadgeWrap, SvgBadge, type BadgeProps } from "./_shared";
export default function MatrixBadge({ size = 32 }: BadgeProps) {
  const id = `mtrx-${size}`;
  return (
    <BadgeWrap size={size} title="Matrix">
      <SvgBadge size={size}>
        <defs>
          <linearGradient id={`${id}-green`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bbf7d0"/><stop offset="50%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#14532d"/>
          </linearGradient>
          <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Terminal outer frame */}
        <rect x="2" y="2" width="60" height="60" rx="10" fill="#000a00" stroke={`url(#${id}-green)`} strokeWidth="2" filter={`url(#${id}-glow)`}/>
        {/* Inner scan lines */}
        {[14,20,26,32,38,44,50].map((y,i)=>(
          <line key={i} x1="8" y1={y} x2="56" y2={y} stroke="#22c55e" strokeWidth="0.5" strokeOpacity={0.15+(i%3)*0.1}/>
        ))}
        {/* Falling character columns */}
        {[10,16,22,28,34,40,46,52].map((x,i)=>(
          <g key={i} style={{animation:`sticker-float ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}>
            <text x={x} y={14+(i%4)*12} fontSize="6" fill="#22c55e" fillOpacity={0.4+(i%3)*0.2} fontFamily="monospace">{String.fromCharCode(48+i*7%10)}</text>
            <text x={x} y={26+(i%3)*10} fontSize="6" fill="#4ade80" fillOpacity={0.6} fontFamily="monospace">{String.fromCharCode(65+i*11%26)}</text>
            <text x={x} y={44+(i%2)*8} fontSize="6" fill="#22c55e" fillOpacity={0.35} fontFamily="monospace">{String.fromCharCode(48+i*3%10)}</text>
          </g>
        ))}
        {/* Center shield */}
        <path d="M32 14 L44 20 L46 34 L32 46 L18 34 L20 20 Z" fill="#001400" stroke={`url(#${id}-green)`} strokeWidth="1.5"/>
        {/* Matrix code inside shield */}
        {[[24,24],[30,24],[36,24],[24,30],[30,30],[36,30],[24,36],[30,36],[36,36]].map(([x,y],i)=>(
          <text key={i} x={x} y={y} fontSize="5" fill="#22c55e" fillOpacity={0.5+(i%3)*0.2} fontFamily="monospace"
            style={{animation:`sticker-ice-shimmer ${1+i*0.15}s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}>
            {String.fromCharCode(48+i*13%10)}
          </text>
        ))}
        {/* Center green gem */}
        <circle cx="32" cy="30" r="5" fill="#000" stroke={`url(#${id}-green)`} strokeWidth="1.5"/>
        <circle cx="32" cy="30" r="3" fill="#22c55e" filter={`url(#${id}-glow)`} style={{animation:"cosm-aura-pulse 1.8s ease-in-out infinite"}}/>
        <circle cx="32" cy="30" r="1.5" fill="white" fillOpacity="0.9"/>
        {/* Corner brackets */}
        {[[8,8],[56,8],[8,56],[56,56]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="2" fill="#22c55e" filter={`url(#${id}-glow)`}
            style={{animation:`sticker-ice-shimmer ${1.2+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
        ))}
      </SvgBadge>
    </BadgeWrap>
  );
}
