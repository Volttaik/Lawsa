"use client";
import type { BadgeProps } from "./_shared";

export default function SovereignBadge({ size = 64 }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Sovereign's Herald"
    >
      <img
        src="/api/badge/sovereign"
        alt="Sovereign's Herald"
        width={size}
        height={size}
        style={{
          objectFit: "contain",
          filter:
            "drop-shadow(0 0 6px rgba(180,100,255,0.85)) drop-shadow(0 0 16px rgba(255,200,50,0.45))",
          animation: "cosm-aura-pulse 3s ease-in-out infinite",
        }}
      />
    </span>
  );
}
