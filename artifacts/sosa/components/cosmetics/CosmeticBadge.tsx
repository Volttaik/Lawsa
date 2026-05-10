"use client";
import DiamondBadge from "@/components/DiamondBadge";

interface Props {
  effectType: string;
  size?: number;
  className?: string;
}

function CrownBadge({ size }: { size: number }) {
  const id = `crown-${size}`;
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Golden Crown"
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", animation: "cosm-crown-shimmer 2.2s ease-in-out infinite" }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="45%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Crown base bar */}
        <rect x="4" y="16.5" width="16" height="2.5" rx="1" fill={`url(#${id}-grad)`} />
        {/* Crown body — 3-prong silhouette */}
        <path d="M4 17 L4 10 L8 13.5 L12 5.5 L16 13.5 L20 10 L20 17 Z" fill={`url(#${id}-grad)`} />
        {/* Highlight overlay */}
        <path d="M4 17 L4 10 L8 13.5 L12 5.5 L16 13.5 L20 10 L20 17 Z" fill={`url(#${id}-shine)`} />
        {/* Three jewels */}
        <circle cx="12"  cy="7.5"  r="1.4" fill="white" fillOpacity="0.92" />
        <circle cx="5.5" cy="12.5" r="0.9" fill="white" fillOpacity="0.75" />
        <circle cx="18.5" cy="12.5" r="0.9" fill="white" fillOpacity="0.75" />
        {/* Base detail line */}
        <line x1="5" y1="17.5" x2="19" y2="17.5" stroke="white" strokeWidth="0.4" strokeOpacity="0.5" />
      </svg>
    </span>
  );
}

function FireBadge({ size }: { size: number }) {
  const id = `fire-${size}`;
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Inferno Badge"
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", transformOrigin: "12px 18px", animation: "cosm-fire-flicker 0.85s ease-in-out infinite" }}
      >
        <defs>
          <radialGradient id={`${id}-body`} cx="50%" cy="85%" r="65%">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="30%"  stopColor="#fb923c" />
            <stop offset="70%"  stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-inner`} cx="50%" cy="75%" r="50%">
            <stop offset="0%"   stopColor="#fef3c7" />
            <stop offset="60%"  stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Outer glow base */}
        <ellipse cx="12" cy="19" rx="7" ry="4" fill="#dc2626" fillOpacity="0.3" />
        {/* Main flame */}
        <path
          d="M12 2.5 C12 2.5 7.5 8.5 7.5 13.5 C7.5 16.9 9.4 19.5 12 19.5 C14.6 19.5 16.5 16.9 16.5 13.5 C16.5 10.5 14.5 7 12 2.5 Z"
          fill={`url(#${id}-body)`}
        />
        {/* Inner bright core */}
        <path
          d="M12 8.5 C12 8.5 9.8 11.5 9.8 13.8 C9.8 15.5 10.7 17 12 17 C13.3 17 14.2 15.5 14.2 13.8 C14.2 11.5 12 8.5 12 8.5 Z"
          fill={`url(#${id}-inner)`}
        />
        {/* Tip sparkle */}
        <circle cx="12" cy="3.2" r="0.9" fill="white" fillOpacity="0.95" />
        {/* Side wisp left */}
        <path d="M9 11 C8 9.5 7.5 8 9 7" stroke="#fb923c" strokeWidth="0.6" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
        {/* Side wisp right */}
        <path d="M15 11 C16 9.5 16.5 8 15 7" stroke="#fb923c" strokeWidth="0.6" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
      </svg>
    </span>
  );
}

function LightningBadge({ size }: { size: number }) {
  const id = `ltng-${size}`;
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Storm Badge"
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", animation: "cosm-lightning-zap 2.8s ease-in-out infinite" }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%"   stopColor="#ede9fe" />
            <stop offset="40%"  stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main bolt */}
        <path d="M13.5 2 L4.5 13.5 H11 L10 22 L20.5 9.5 H14 L13.5 2 Z" fill={`url(#${id}-grad)`} />
        {/* Highlight face */}
        <path d="M13.5 2 L10.5 9 H12 L13.5 2 Z" fill={`url(#${id}-shine)`} />
        {/* Spark dots */}
        <circle cx="14" cy="2"  r="0.85" fill="#ede9fe" fillOpacity="0.95" />
        <circle cx="21" cy="9"  r="0.65" fill="#c4b5fd" fillOpacity="0.85" />
        <circle cx="10" cy="22" r="0.65" fill="#8b5cf6" fillOpacity="0.8" />
      </svg>
    </span>
  );
}

function StarBadge({ size }: { size: number }) {
  const id = `star-${size}`;
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Supernova"
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", transformOrigin: "12px 12px", animation: "cosm-star-spin 5s linear infinite" }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fef9c3" />
            <stop offset="45%"  stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        {/* 5-point star */}
        <path
          d="M12 2 L14.8 8.9 H22.1 L16.2 13.3 L18.5 20.2 L12 15.8 L5.5 20.2 L7.8 13.3 L1.9 8.9 H9.2 Z"
          fill={`url(#${id}-grad)`}
        />
        {/* Inner highlight */}
        <path
          d="M12 2 L14.8 8.9 H9.2 Z"
          fill="white" fillOpacity="0.35"
        />
        {/* Vertex sparkles */}
        <circle cx="12"   cy="2"    r="0.9" fill="white" fillOpacity="0.95" />
        <circle cx="22.1" cy="8.9"  r="0.65" fill="#fef9c3" fillOpacity="0.85" />
        <circle cx="18.5" cy="20.2" r="0.65" fill="#fef9c3" fillOpacity="0.85" />
        <circle cx="5.5"  cy="20.2" r="0.65" fill="#fef9c3" fillOpacity="0.85" />
        <circle cx="1.9"  cy="8.9"  r="0.65" fill="#fef9c3" fillOpacity="0.85" />
      </svg>
    </span>
  );
}

function VerifiedPlusBadge({ size }: { size: number }) {
  const id = `vp-${size}`;
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Verified+"
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", animation: "cosm-verified-pulse 2.4s ease-in-out infinite" }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        {/* Outer shield/circle */}
        <circle cx="11" cy="12" r="9.5" fill={`url(#${id}-grad)`} />
        {/* Checkmark */}
        <path d="M7.5 12.5 L10 15.2 L15.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Plus badge pill */}
        <circle cx="18.5" cy="5.5" r="4.2" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.2" />
        <path d="M18.5 3.4 V7.6 M16.4 5.5 H20.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function CrystalBadge({ size }: { size: number }) {
  const id = `crys-${size}`;
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Crystal Shard"
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", animation: "cosm-crystal-refract 3.5s ease-in-out infinite" }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#e0f2fe" />
            <stop offset="35%"  stopColor="#7dd3fc" />
            <stop offset="70%"  stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id={`${id}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Hexagon body */}
        <polygon points="12,1.5 20.5,6.5 20.5,17.5 12,22.5 3.5,17.5 3.5,6.5" fill={`url(#${id}-grad)`} />
        {/* Top-right bright facet */}
        <polygon points="12,1.5 20.5,6.5 12,12" fill={`url(#${id}-face)`} />
        {/* Left shadow facet */}
        <polygon points="3.5,6.5 12,12 3.5,17.5" fill="black" fillOpacity="0.14" />
        {/* Centre axis line */}
        <line x1="12" y1="1.5" x2="12" y2="22.5" stroke="white" strokeWidth="0.45" strokeOpacity="0.38" />
        {/* Border */}
        <polygon points="12,1.5 20.5,6.5 20.5,17.5 12,22.5 3.5,17.5 3.5,6.5"
          fill="none" stroke="rgba(186,230,253,0.55)" strokeWidth="0.7" />
        {/* Top sparkle */}
        <circle cx="12" cy="1.5" r="1.1" fill="white" fillOpacity="0.97" />
      </svg>
    </span>
  );
}

export default function CosmeticBadge({ effectType, size = 18, className = "" }: Props) {
  switch (effectType) {
    case "badge_diamond":
      return (
        <span className={`inline-flex items-center justify-center ${className}`}>
          <DiamondBadge size={size} />
        </span>
      );
    case "badge_crown":      return <CrownBadge size={size} />;
    case "badge_fire":       return <FireBadge size={size} />;
    case "badge_lightning":  return <LightningBadge size={size} />;
    case "badge_star":       return <StarBadge size={size} />;
    case "badge_verified_plus": return <VerifiedPlusBadge size={size} />;
    case "badge_crystal":    return <CrystalBadge size={size} />;
    default:                 return null;
  }
}
