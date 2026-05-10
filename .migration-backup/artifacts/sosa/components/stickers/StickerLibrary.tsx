"use client";
import { type ReactNode } from "react";

export interface StickerDef {
  id: string;
  name: string;
  packId: string;
}

export interface BuiltinPack {
  id: string;
  name: string;
  isFree: boolean;
  stickers: StickerDef[];
}

export const BUILTIN_PACKS: BuiltinPack[] = [
  {
    id: "elements",
    name: "Elements",
    isFree: true,
    stickers: [
      { id: "fire_burst",      name: "Fire Burst",      packId: "elements" },
      { id: "ice_crystal",     name: "Ice Crystal",     packId: "elements" },
      { id: "lightning_bolt",  name: "Lightning Bolt",  packId: "elements" },
      { id: "water_splash",    name: "Water Splash",    packId: "elements" },
      { id: "wind_spiral",     name: "Wind Spiral",     packId: "elements" },
      { id: "earth_shard",     name: "Earth Shard",     packId: "elements" },
    ],
  },
  {
    id: "hype",
    name: "Hype",
    isFree: false,
    stickers: [
      { id: "crown_glory",    name: "Crown Glory",    packId: "hype" },
      { id: "diamond_shine",  name: "Diamond Shine",  packId: "hype" },
      { id: "star_storm",     name: "Star Storm",     packId: "hype" },
      { id: "neon_ring",      name: "Neon Ring",      packId: "hype" },
      { id: "money_stack",    name: "Money Stack",    packId: "hype" },
      { id: "big_w",          name: "Big W",          packId: "hype" },
    ],
  },
  {
    id: "epic",
    name: "Epic",
    isFree: false,
    stickers: [
      { id: "galaxy_vortex",  name: "Galaxy Vortex",  packId: "epic" },
      { id: "nova_burst",     name: "Nova Burst",     packId: "epic" },
      { id: "void_rift",      name: "Void Rift",      packId: "epic" },
      { id: "thunder_god",    name: "Thunder God",    packId: "epic" },
    ],
  },
];

export function toStickerToken(id: string) { return `[s:${id}]`; }
export function parseStickerToken(value: string): string | null {
  const m = value.match(/^\[s:([a-z_]+)\]$/);
  return m ? m[1] : null;
}
export function hasStickerToken(text: string) { return /\[s:[a-z_]+\]/.test(text); }

function SvgWrap({ size, children, style }: { size: number; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", ...style }}>
      {children}
    </svg>
  );
}

/* ── Elements Pack ──────────────────────────────────────────── */

function FireBurst({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-fire-rise 0.9s ease-in-out infinite" }}>
      <defs>
        <radialGradient id="fb-outer" cx="50%" cy="85%" r="70%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="35%" stopColor="#fb923c" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="fb-inner" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="white" />
          <stop offset="30%" stopColor="#fef9c3" />
          <stop offset="80%" stopColor="#fde68a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer glow base */}
      <ellipse cx="32" cy="52" rx="18" ry="10" fill="#dc2626" fillOpacity="0.28" />
      {/* Left side flame */}
      <path d="M32 58 C32 58 18 45 18 34 C18 28 22 22 26 18 C22 28 24 36 28 40 C26 32 28 24 32 58 Z"
        fill="#f97316" fillOpacity="0.75" />
      {/* Right side flame */}
      <path d="M32 58 C32 58 46 45 46 34 C46 28 42 22 38 18 C42 28 40 36 36 40 C38 32 36 24 32 58 Z"
        fill="#f97316" fillOpacity="0.75" />
      {/* Main flame body */}
      <path d="M32 5 C32 5 18 20 18 34 C18 44 24 52 32 52 C40 52 46 44 46 34 C46 20 32 5 32 5 Z"
        fill="url(#fb-outer)" />
      {/* Inner hot core */}
      <path d="M32 18 C32 18 23 28 23 36 C23 41 27 46 32 46 C37 46 41 41 41 36 C41 28 32 18 32 18 Z"
        fill="url(#fb-inner)" />
      {/* Tip spark */}
      <circle cx="32" cy="5" r="2.5" fill="white" fillOpacity="0.95" />
      <circle cx="32" cy="5" r="5" fill="white" fillOpacity="0.25" />
    </SvgWrap>
  );
}

function IceCrystal({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-float 3s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="ic-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#7dd3fc" />
          <stop offset="75%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="ic-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.65" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Outer glow */}
      <circle cx="32" cy="32" r="30" fill="#7dd3fc" fillOpacity="0.12" />
      {/* Main hexagon */}
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#ic-body)" />
      {/* Top-right bright facet */}
      <polygon points="32,4 56,18 32,32" fill="url(#ic-face)" />
      {/* Left shadow facet */}
      <polygon points="8,18 32,32 8,46" fill="black" fillOpacity="0.14" />
      {/* Centre vertical axis */}
      <line x1="32" y1="4" x2="32" y2="60" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      {/* Horizontal cross */}
      <line x1="8" y1="32" x2="56" y2="32" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
      {/* Border */}
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18"
        fill="none" stroke="rgba(186,230,253,0.7)" strokeWidth="1.2" />
      {/* Vertex sparkles */}
      {[{ cx: 32, cy: 4 }, { cx: 56, cy: 18 }, { cx: 56, cy: 46 }, { cx: 32, cy: 60 }, { cx: 8, cy: 46 }, { cx: 8, cy: 18 }].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="2.4" fill="white" fillOpacity="0.92"
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.18}s` }} />
      ))}
    </SvgWrap>
  );
}

function LightningBolt({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "cosm-lightning-zap 2.4s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="lb-grad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="40%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <filter id="lb-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Glow layer */}
      <path d="M36 4 L12 36 H28 L26 60 L54 28 H38 L36 4 Z"
        fill="#a78bfa" fillOpacity="0.3" filter="url(#lb-glow)" />
      {/* Main bolt */}
      <path d="M36 4 L12 36 H28 L26 60 L54 28 H38 Z" fill="url(#lb-grad)" />
      {/* Highlight face */}
      <path d="M36 4 L28 22 H32 Z" fill="white" fillOpacity="0.45" />
      {/* Sparks */}
      <circle cx="36" cy="4"  r="2.2" fill="#ede9fe" fillOpacity="0.95" />
      <circle cx="54" cy="28" r="1.8" fill="#c4b5fd" fillOpacity="0.9" />
      <circle cx="26" cy="60" r="1.8" fill="#8b5cf6" fillOpacity="0.85" />
      {/* Arc sparks */}
      <path d="M48 20 L52 16 M56 24 L60 20" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
    </SvgWrap>
  );
}

function WaterSplash({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-pulse-scale 2s ease-in-out infinite" }}>
      <defs>
        <radialGradient id="ws-center" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {/* Main splash crown */}
      <path d="M32 48 C26 40 16 36 14 28 C12 20 20 16 24 20 C22 12 28 8 32 10 C36 8 42 12 40 20 C44 16 52 20 50 28 C48 36 38 40 32 48 Z"
        fill="url(#ws-center)" />
      {/* Droplets flying out */}
      {[
        { cx: 12, cy: 18, r: 3.5, delay: "0s" },
        { cx: 52, cy: 18, r: 3,   delay: "0.2s" },
        { cx: 20, cy: 8,  r: 2.5, delay: "0.1s" },
        { cx: 44, cy: 8,  r: 2.5, delay: "0.3s" },
        { cx: 32, cy: 4,  r: 3,   delay: "0.15s" },
        { cx: 8,  cy: 32, r: 2,   delay: "0.25s" },
        { cx: 56, cy: 32, r: 2,   delay: "0.05s" },
      ].map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#7dd3fc"
          style={{ animation: `sticker-float 1.8s ease-in-out infinite`, animationDelay: d.delay }} />
      ))}
      {/* Ripple ring at base */}
      <ellipse cx="32" cy="52" rx="20" ry="6" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" />
      <ellipse cx="32" cy="54" rx="14" ry="4" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.35" />
    </SvgWrap>
  );
}

function WindSpiral({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-void-rotate 4s linear infinite" }}>
      <defs>
        <linearGradient id="wind-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path d="M32 32 C32 20 44 14 50 20 C56 26 50 38 40 40 C28 42 16 34 18 22 C20 10 36 6 44 14"
        stroke="url(#wind-grad)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M32 32 C36 44 48 46 50 38 C52 30 44 22 34 26 C22 30 18 44 26 50 C34 56 46 50 48 40"
        stroke="#7dd3fc" strokeWidth="3.5" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
      <circle cx="32" cy="32" r="4" fill="#e0f2fe" fillOpacity="0.9" />
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 32 + 26 * Math.cos(rad);
        const y = 32 + 26 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="2" fill="#7dd3fc" fillOpacity="0.65" />;
      })}
    </SvgWrap>
  );
}

function EarthShard({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-pulse-scale 2.5s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="es-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      {/* Ground crack */}
      <ellipse cx="32" cy="52" rx="26" ry="8" fill="#451a03" fillOpacity="0.6" />
      {/* Main shard */}
      <path d="M32 8 L22 38 L32 32 L42 38 Z" fill="url(#es-grad)" />
      {/* Side shards */}
      <path d="M18 16 L14 42 L24 36 Z" fill="#b45309" fillOpacity="0.85" />
      <path d="M46 16 L50 42 L40 36 Z" fill="#b45309" fillOpacity="0.85" />
      {/* Highlight */}
      <path d="M32 8 L26 28 L32 24 Z" fill="white" fillOpacity="0.3" />
      {/* Dust particles */}
      {[{ cx: 12, cy: 44 }, { cx: 52, cy: 44 }, { cx: 8, cy: 36 }, { cx: 56, cy: 36 }].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="2.5" fill="#d97706" fillOpacity="0.6"
          style={{ animation: `sticker-float ${1.6 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }} />
      ))}
    </SvgWrap>
  );
}

/* ── Hype Pack ──────────────────────────────────────────────── */

function CrownGlory({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-crown-bounce 2.2s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="cg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="cg-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Base */}
      <rect x="8" y="46" width="48" height="10" rx="3" fill="url(#cg-grad)" />
      {/* Crown body */}
      <path d="M8 46 L8 26 L18 34 L32 8 L46 34 L56 26 L56 46 Z" fill="url(#cg-grad)" />
      {/* Shine overlay */}
      <path d="M8 46 L8 26 L18 34 L32 8 L46 34 L56 26 L56 46 Z" fill="url(#cg-shine)" />
      {/* Five jewels */}
      <circle cx="32" cy="11" r="4"   fill="white" fillOpacity="0.95" />
      <circle cx="10" cy="29" r="2.8" fill="#fef9c3" fillOpacity="0.9" />
      <circle cx="54" cy="29" r="2.8" fill="#fef9c3" fillOpacity="0.9" />
      <circle cx="20" cy="46" r="2.2" fill="white" fillOpacity="0.7" />
      <circle cx="44" cy="46" r="2.2" fill="white" fillOpacity="0.7" />
      {/* Base shine */}
      <line x1="10" y1="50" x2="54" y2="50" stroke="white" strokeWidth="0.8" strokeOpacity="0.45" />
      {/* Sparkle stars above */}
      {[{ cx: 14, cy: 12, r: 1.5 }, { cx: 50, cy: 12, r: 1.5 }, { cx: 32, cy: 4, r: 2 }].map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fef9c3"
          style={{ animation: `sticker-ice-shimmer ${1 + i * 0.4}s ease-in-out infinite` }} />
      ))}
    </SvgWrap>
  );
}

function DiamondShine({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-float 2.8s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="ds-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="30%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id="ds-face" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="#818cf8" fillOpacity="0.2" />
      {/* Main diamond */}
      <polygon points="32,4 58,24 32,60 6,24" fill="url(#ds-grad)" />
      {/* Top-right bright facet */}
      <polygon points="32,4 58,24 32,24" fill="url(#ds-face)" />
      {/* Bottom-left dark facet */}
      <polygon points="6,24 32,24 32,60" fill="black" fillOpacity="0.12" />
      {/* Table face */}
      <polygon points="20,24 32,8 44,24 32,44" fill="white" fillOpacity="0.2" />
      {/* Shimmer streak */}
      <polygon points="32,4 58,24 32,60 6,24" fill="none"
        stroke="rgba(196,181,253,0.6)" strokeWidth="1.2" />
      {/* Top vertex */}
      <circle cx="32" cy="4" r="2.8" fill="white" fillOpacity="0.97" />
      {/* Orbiting sparkles */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 32 + 28 * Math.cos(rad);
        const y = 32 + 22 * Math.sin(rad);
        return (
          <g key={i} style={{ animation: `sticker-spark-orbit ${2.5 + i * 0.3}s linear infinite`, transformOrigin: "32px 32px", animationDelay: `${i * 0.6}s` }}>
            <circle cx={x} cy={y} r="2" fill="#e879f9" fillOpacity="0.85" />
          </g>
        );
      })}
    </SvgWrap>
  );
}

function StarStorm({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <defs>
        <linearGradient id="ss-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      {/* Large central star */}
      <path d="M32 10 L36 22 H50 L40 30 L44 44 L32 36 L20 44 L24 30 L14 22 H28 Z"
        fill="url(#ss-grad)"
        style={{ animation: "sticker-star-burst 2s ease-in-out infinite", transformOrigin: "32px 27px" }} />
      {/* Small orbiting stars */}
      {[45, 135, 225, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 32 + 24 * Math.cos(rad);
        const y = 32 + 24 * Math.sin(rad);
        return (
          <path key={i}
            d={`M${x} ${y-5} L${x+1.5} ${y-1} H${x+5} L${x+2} ${y+2} L${x+3} ${y+6} L${x} ${y+3} L${x-3} ${y+6} L${x-2} ${y+2} L${x-5} ${y-1} H${x-1.5} Z`}
            fill="#facc15" fillOpacity="0.85"
            style={{ animation: `cosm-star-spin ${3 + i * 0.5}s linear infinite`, transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.3}s` }}
          />
        );
      })}
      {/* Sparkle trails */}
      {[30, 110, 200, 290].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 32 + 30 * Math.cos(rad);
        const y = 32 + 30 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#fef9c3"
          style={{ animation: `sticker-ice-shimmer ${0.8 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />;
      })}
    </SvgWrap>
  );
}

function NeonRing({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-pulse-scale 2s ease-in-out infinite" }}>
      <defs>
        <radialGradient id="nr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {/* Outer glow halo */}
      <circle cx="32" cy="32" r="31" fill="url(#nr-glow)" />
      {/* Main ring */}
      <circle cx="32" cy="32" r="24" fill="none" stroke="#22d3ee" strokeWidth="6"
        style={{ filter: "drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 18px #0891b2)" }} />
      {/* Inner ring */}
      <circle cx="32" cy="32" r="17" fill="none" stroke="#67e8f9" strokeWidth="2"
        strokeDasharray="6 4"
        style={{ animation: "cosm-ring-spin 3s linear infinite", transformOrigin: "32px 32px" }} />
      {/* Center dot */}
      <circle cx="32" cy="32" r="5" fill="#22d3ee" fillOpacity="0.8"
        style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
      {/* Four accent dots on ring */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle key={i} cx={32 + 24 * Math.cos(rad)} cy={32 + 24 * Math.sin(rad)} r="3.5"
            fill="#e0f9ff"
            style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.25}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        );
      })}
    </SvgWrap>
  );
}

function MoneyStack({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-float 2.5s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="ms-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {/* Stack of bills — bottom to top */}
      {[48, 40, 32].map((y, i) => (
        <g key={i}>
          <rect x={8 + i * 2} y={y} width={48 - i * 4} height={14} rx="3" fill="url(#ms-grad)" opacity={0.85 + i * 0.05} />
          <rect x={8 + i * 2} y={y} width={48 - i * 4} height={14} rx="3" fill="none"
            stroke="#86efac" strokeWidth="0.8" strokeOpacity="0.6" />
          <circle cx={32} cy={y + 7} r="4" fill="#166534" fillOpacity="0.5" />
          <text x="32" y={y + 10} textAnchor="middle" fontSize="6" fill="#86efac" fontWeight="bold">₦</text>
        </g>
      ))}
      {/* Sparkle above top bill */}
      {[{ cx: 14, cy: 26 }, { cx: 50, cy: 26 }, { cx: 32, cy: 20 }].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="2" fill="#86efac"
          style={{ animation: `sticker-ice-shimmer ${1 + i * 0.3}s ease-in-out infinite` }} />
      ))}
    </SvgWrap>
  );
}

function BigW({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "sticker-pulse-scale 2.2s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="bw-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* W letter */}
      <path d="M6 12 L14 52 L24 28 L32 44 L40 28 L50 52 L58 12 L50 16 L42 40 L32 22 L22 40 L14 16 Z"
        fill="url(#bw-grad)"
        style={{ filter: "drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 18px #f59e0b)" }} />
      {/* Highlight */}
      <path d="M6 12 L14 16 L22 40 L32 22 L42 40 L50 16 L58 12 L50 12 L44 34 L32 14 L20 34 L14 12 Z"
        fill="white" fillOpacity="0.22" />
      {/* Crown on top */}
      <path d="M22 14 L18 8 L26 11 L32 5 L38 11 L46 8 L42 14 Z"
        fill="#fde68a" style={{ filter: "drop-shadow(0 0 4px #fbbf24)" }} />
    </SvgWrap>
  );
}

/* ── Epic Pack ──────────────────────────────────────────────── */

function GalaxyVortex({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <defs>
        <radialGradient id="gv-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="20%" stopColor="#818cf8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background glow */}
      <circle cx="32" cy="32" r="30" fill="#1e1b4b" fillOpacity="0.6" />
      {/* Galaxy arms */}
      <g style={{ animation: "sticker-void-rotate 6s linear infinite", transformOrigin: "32px 32px" }}>
        <path d="M32 32 C32 32 50 20 56 8 C52 18 44 24 32 32 Z" fill="#818cf8" fillOpacity="0.7" />
        <path d="M32 32 C32 32 8 44 6 56 C12 46 22 40 32 32 Z" fill="#818cf8" fillOpacity="0.7" />
        <path d="M32 32 C32 32 44 50 56 52 C46 46 38 40 32 32 Z" fill="#a78bfa" fillOpacity="0.55" />
        <path d="M32 32 C32 32 20 14 8 12 C18 18 26 24 32 32 Z" fill="#a78bfa" fillOpacity="0.55" />
      </g>
      {/* Stars */}
      {[[14, 12], [50, 14], [10, 50], [52, 50], [32, 6], [32, 58], [8, 32], [56, 32]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1 + (i % 3) * 0.5} fill="white" fillOpacity={0.6 + (i % 3) * 0.15}
          style={{ animation: `sticker-ice-shimmer ${1 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
      <circle cx="32" cy="32" r="6" fill="url(#gv-center)" />
      <circle cx="32" cy="32" r="3" fill="white" fillOpacity="0.95" />
    </SvgWrap>
  );
}

function NovaBurst({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      {/* Expanding rings */}
      {[28, 22, 16].map((r, i) => (
        <circle key={i} cx="32" cy="32" r={r} fill="none"
          stroke={i === 0 ? "#fde68a" : i === 1 ? "#fb923c" : "#fbbf24"}
          strokeWidth={2 - i * 0.4}
          style={{
            animation: "sticker-nova-expand 2s ease-in-out infinite",
            transformOrigin: "32px 32px",
            animationDelay: `${i * 0.35}s`,
          }} />
      ))}
      {/* 8 rays */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return (
          <line key={i}
            x1={32 + 6 * Math.cos(a)} y1={32 + 6 * Math.sin(a)}
            x2={32 + 30 * Math.cos(a)} y2={32 + 30 * Math.sin(a)}
            stroke={i % 2 === 0 ? "#fde68a" : "#fb923c"} strokeWidth={i % 2 === 0 ? 2 : 1.2}
            strokeLinecap="round"
            style={{ animation: "sticker-pulse-scale 1.8s ease-in-out infinite", transformOrigin: "32px 32px", animationDelay: `${i * 0.12}s` }} />
        );
      })}
      {/* Core */}
      <circle cx="32" cy="32" r="8" fill="#fef3c7"
        style={{ filter: "drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 22px #f59e0b)" }} />
      <circle cx="32" cy="32" r="4" fill="white" fillOpacity="0.97" />
    </SvgWrap>
  );
}

function VoidRift({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <defs>
        <radialGradient id="vr-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="black" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="80%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {/* Outer glow */}
      <circle cx="32" cy="32" r="31" fill="#7c3aed" fillOpacity="0.2" />
      {/* Spiral arms */}
      <g style={{ animation: "sticker-void-rotate 3s linear infinite", transformOrigin: "32px 32px" }}>
        <path d="M32 32 C40 20 54 18 58 28 C54 16 46 12 32 32 Z" fill="#7c3aed" fillOpacity="0.8" />
        <path d="M32 32 C24 44 10 46 6 36 C10 48 18 52 32 32 Z" fill="#7c3aed" fillOpacity="0.8" />
        <path d="M32 32 C44 36 50 48 42 54 C52 44 52 34 32 32 Z" fill="#8b5cf6" fillOpacity="0.6" />
        <path d="M32 32 C20 28 14 16 22 10 C12 20 12 30 32 32 Z" fill="#8b5cf6" fillOpacity="0.6" />
      </g>
      {/* Stars being pulled in */}
      {[[10, 10], [54, 10], [10, 54], [54, 54], [32, 4], [32, 60]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill="white" fillOpacity={0.5}
          style={{ animation: `sticker-ice-shimmer ${0.9 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
      {/* Dark center void */}
      <circle cx="32" cy="32" r="10" fill="url(#vr-grad)"
        style={{ filter: "drop-shadow(0 0 12px #7c3aed)" }} />
      <circle cx="32" cy="32" r="4" fill="black" />
    </SvgWrap>
  );
}

function ThunderGod({ size }: { size: number }) {
  return (
    <SvgWrap size={size} style={{ animation: "cosm-lightning-zap 2s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="tg-crown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="tg-bolt" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      {/* Crown base */}
      <rect x="10" y="42" width="44" height="8" rx="2.5" fill="url(#tg-crown)" />
      <path d="M10 42 L10 28 L20 34 L32 16 L44 34 L54 28 L54 42 Z" fill="url(#tg-crown)" />
      {/* Crown jewels */}
      <circle cx="32" cy="18" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="12" cy="31" r="2.2" fill="#fef9c3" fillOpacity="0.88" />
      <circle cx="52" cy="31" r="2.2" fill="#fef9c3" fillOpacity="0.88" />
      {/* Lightning bolt through crown */}
      <path d="M35 10 L24 30 H31 L30 46 L44 26 H37 Z"
        fill="url(#tg-bolt)"
        style={{ filter: "drop-shadow(0 0 6px #a78bfa) drop-shadow(0 0 14px #7c3aed)" }} />
      {/* Spark */}
      <circle cx="35" cy="10" r="2" fill="#ede9fe" fillOpacity="0.97" />
    </SvgWrap>
  );
}

/* ── Registry ───────────────────────────────────────────────── */

const STICKER_COMPONENTS: Record<string, React.ComponentType<{ size: number }>> = {
  fire_burst:     FireBurst,
  ice_crystal:    IceCrystal,
  lightning_bolt: LightningBolt,
  water_splash:   WaterSplash,
  wind_spiral:    WindSpiral,
  earth_shard:    EarthShard,
  crown_glory:    CrownGlory,
  diamond_shine:  DiamondShine,
  star_storm:     StarStorm,
  neon_ring:      NeonRing,
  money_stack:    MoneyStack,
  big_w:          BigW,
  galaxy_vortex:  GalaxyVortex,
  nova_burst:     NovaBurst,
  void_rift:      VoidRift,
  thunder_god:    ThunderGod,
};

interface StickerProps {
  id: string;
  size?: number;
}

export function Sticker({ id, size = 64 }: StickerProps) {
  const Comp = STICKER_COMPONENTS[id];
  if (!Comp) return null;
  return (
    <span
      className="inline-flex items-center justify-center select-none"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <Comp size={size} />
    </span>
  );
}

export function getStickerComponent(id: string): React.ComponentType<{ size: number }> | null {
  return STICKER_COMPONENTS[id] || null;
}

export function isStickerKnown(id: string) {
  return id in STICKER_COMPONENTS;
}

/* ── Pack SVG Icons (for picker sidebar, replaces emoji) ────── */

export function PackIcon({ packId, size = 24 }: { packId: string; size?: number }) {
  switch (packId) {
    case "elements":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ overflow: "visible" }}>
          <path d="M12 2C12 2 7 8 7 13C7 16.3 9.2 19 12 19C14.8 19 17 16.3 17 13C17 10 15 7 12 2Z"
            fill="#fb923c" style={{ animation: "cosm-fire-flicker 1s ease-in-out infinite" }} />
          <circle cx="12" cy="2.5" r="1" fill="white" fillOpacity="0.9" />
        </svg>
      );
    case "hype":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ overflow: "visible" }}>
          <rect x="4" y="17" width="16" height="3" rx="1" fill="#fbbf24" />
          <path d="M4 17 L4 10 L8 13 L12 5 L16 13 L20 10 L20 17 Z" fill="#fbbf24"
            style={{ animation: "cosm-crown-shimmer 2s ease-in-out infinite" }} />
          <circle cx="12" cy="7" r="1.5" fill="white" fillOpacity="0.9" />
        </svg>
      );
    case "epic":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ overflow: "visible" }}>
          <circle cx="12" cy="12" r="9" fill="#1e1b4b" />
          <g style={{ animation: "cosm-ring-spin 4s linear infinite", transformOrigin: "12px 12px" }}>
            <path d="M12 12 C15 7 20 6 22 10" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M12 12 C9 17 4 18 2 14" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          <circle cx="12" cy="12" r="3" fill="#a78bfa" />
          <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.95" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="#374151" />
          <circle cx="12" cy="12" r="4" fill="#6b7280" />
        </svg>
      );
  }
}
