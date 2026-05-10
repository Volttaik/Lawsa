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
        src="/badge-sovereign.png"
        alt="Sovereign's Herald"
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
