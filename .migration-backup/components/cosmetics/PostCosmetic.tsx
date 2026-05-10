"use client";
import { type ReactNode } from "react";

interface Props {
  effectType: string;
  children: ReactNode;
  className?: string;
}

const SIMPLE_GLOW: Record<string, React.CSSProperties> = {
  post_border_gold: {
    boxShadow: "0 0 0 1.5px #fbbf24, 0 0 14px 3px rgba(251,191,36,0.38)",
  },
  post_border_neon: {
    boxShadow: "0 0 0 1.5px #22d3ee, 0 0 16px 4px rgba(34,211,238,0.42)",
  },
  post_glow_elite: {
    boxShadow:
      "0 0 0 1px rgba(245,158,11,0.55), 0 4px 32px 3px rgba(245,158,11,0.22), 0 0 64px 6px rgba(251,191,36,0.10)",
  },
};

export default function PostCosmetic({ effectType, children, className = "" }: Props) {
  if (effectType === "post_border_rainbow") {
    return (
      <div className={className} style={{ position: "relative" }}>
        {/* Animated rainbow outline */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "inherit",
            background:
              "linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #38bdf8, #818cf8, #e879f9, #f87171)",
            backgroundSize: "300% auto",
            animation: "cosm-shimmer-text 3s linear infinite",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, background: "inherit", borderRadius: "inherit" }}>
          {children}
        </div>
      </div>
    );
  }

  if (effectType in SIMPLE_GLOW) {
    return (
      <div className={className} style={SIMPLE_GLOW[effectType]}>
        {children}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
