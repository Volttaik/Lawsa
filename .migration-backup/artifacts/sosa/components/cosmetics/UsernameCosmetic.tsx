"use client";
import { type ReactNode } from "react";

interface Props {
  effectType: string;
  children: ReactNode;
  className?: string;
}

const GRADIENT_MAP: Record<string, string> = {
  username_gold:         "linear-gradient(90deg, #92400e, #d97706, #fbbf24, #fde68a, #fbbf24, #d97706, #92400e)",
  username_rainbow:      "linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #38bdf8, #818cf8, #e879f9, #f87171)",
  username_holographic:  "linear-gradient(90deg, #a5f3fc, #818cf8, #e879f9, #fbbf24, #67e8f9, #c4b5fd, #a5f3fc)",
  username_fire:         "linear-gradient(90deg, #7f1d1d, #dc2626, #f97316, #fbbf24, #f97316, #dc2626, #7f1d1d)",
};

export default function UsernameCosmetic({ effectType, children, className = "" }: Props) {
  const base = className || "";

  switch (effectType) {
    case "username_gold":
    case "username_rainbow":
    case "username_holographic":
    case "username_fire": {
      const extra = effectType === "username_holographic"
        ? { filter: "saturate(1.3) brightness(1.1)", animation: "cosm-shimmer-text 2.5s linear infinite, cosm-holo-shift 4s ease-in-out infinite" }
        : effectType === "username_fire"
        ? { animation: "cosm-fire-text 2.2s ease infinite" }
        : { animation: "cosm-shimmer-text 3.5s linear infinite" };
      return (
        <span
          className={base}
          style={{
            background: GRADIENT_MAP[effectType],
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline",
            ...extra,
          }}
        >
          {children}
        </span>
      );
    }

    case "username_neon":
      return (
        <span
          className={base}
          style={{
            color: "#22d3ee",
            animation: "cosm-neon-text-pulse 2.2s ease-in-out infinite",
          }}
        >
          {children}
        </span>
      );

    default:
      return <span className={base}>{children}</span>;
  }
}
