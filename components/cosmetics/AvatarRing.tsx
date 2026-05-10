"use client";
import { type ReactNode } from "react";

interface Props {
  effectType: string;
  size: number;
  children: ReactNode;
}

const RING_PX = 3;
const GAP_PX  = 2;

const RING_BG: Record<string, string> = {
  avatar_ring_gold:    "conic-gradient(from 0deg, #fde68a, #fbbf24, #f59e0b, #d97706, #f59e0b, #fbbf24, #fde68a)",
  avatar_ring_rainbow: "conic-gradient(from 0deg, #f87171, #fb923c, #fbbf24, #4ade80, #38bdf8, #818cf8, #e879f9, #f87171)",
  avatar_ring_fire:    "conic-gradient(from 0deg, #1c0000, #7f1d1d, #dc2626, #f97316, #fbbf24, #f97316, #dc2626, #7f1d1d, #1c0000)",
};

const RING_SPEED: Record<string, string> = {
  avatar_ring_gold:    "cosm-ring-spin 4s linear infinite",
  avatar_ring_rainbow: "cosm-ring-spin 2s linear infinite",
  avatar_ring_fire:    "cosm-ring-spin 1.8s linear infinite",
};

const AURA_SHADOW: Record<string, { boxShadow: string; animation: string }> = {
  avatar_aura_blue: {
    boxShadow: "0 0 14px 5px rgba(59,130,246,0.55), 0 0 32px 8px rgba(37,99,235,0.28)",
    animation: "cosm-aura-pulse 2.6s ease-in-out infinite",
  },
  avatar_aura_neon: {
    boxShadow: "0 0 16px 6px rgba(34,211,238,0.65), 0 0 36px 10px rgba(6,182,212,0.32)",
    animation: "cosm-aura-pulse 2s ease-in-out infinite",
  },
  avatar_aura_purple: {
    boxShadow: "0 0 18px 7px rgba(124,58,237,0.62), 0 0 40px 12px rgba(109,40,217,0.3)",
    animation: "cosm-aura-pulse 3.2s ease-in-out infinite",
  },
};

export default function AvatarRing({ effectType, size, children }: Props) {
  const isRing = effectType in RING_BG;
  const isAura = effectType in AURA_SHADOW;

  if (isRing) {
    const outerSize = size + (RING_PX + GAP_PX) * 2;
    return (
      <div style={{ position: "relative", width: outerSize, height: outerSize, flexShrink: 0 }}>
        {/* Spinning gradient ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: RING_BG[effectType],
            animation: RING_SPEED[effectType],
          }}
        />
        {/* Gap + avatar container */}
        <div
          style={{
            position: "absolute",
            inset: RING_PX + GAP_PX,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (isAura) {
    const aura = AURA_SHADOW[effectType];
    return (
      <div
        style={{
          position: "relative",
          borderRadius: "50%",
          flexShrink: 0,
          boxShadow: aura.boxShadow,
          animation: aura.animation,
        }}
      >
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
