"use client";
import CosmeticBadge from "./CosmeticBadge";
import { BADGE_REGISTRY } from "@/resources/badges";

interface Props {
  effectType: string;
  previewColor: string;
  size?: number;
}

const RING_BG: Record<string, string> = {
  avatar_ring_gold:    "conic-gradient(from 0deg, #fde68a, #fbbf24, #f59e0b, #fde68a)",
  avatar_ring_rainbow: "conic-gradient(from 0deg, #f87171, #fb923c, #fbbf24, #4ade80, #38bdf8, #818cf8, #e879f9, #f87171)",
  avatar_ring_fire:    "conic-gradient(from 0deg, #dc2626, #f97316, #fbbf24, #f97316, #dc2626)",
};

const AURA_SHADOW: Record<string, string> = {
  avatar_aura_blue:   "rgba(59,130,246,0.65)",
  avatar_aura_neon:   "rgba(34,211,238,0.65)",
  avatar_aura_purple: "rgba(124,58,237,0.65)",
};

const USERNAME_GRAD: Record<string, string> = {
  username_gold:        "linear-gradient(90deg, #ca8a04, #fbbf24, #fde68a)",
  username_neon:        "linear-gradient(90deg, #0e7490, #22d3ee, #67e8f9)",
  username_rainbow:     "linear-gradient(90deg, #f87171, #fbbf24, #4ade80, #818cf8)",
  username_holographic: "linear-gradient(90deg, #a5f3fc, #818cf8, #e879f9, #67e8f9)",
  username_fire:        "linear-gradient(90deg, #7f1d1d, #f97316, #fbbf24)",
};

const POST_GLOW: Record<string, string> = {
  post_border_gold:    "#fbbf24",
  post_border_neon:    "#22d3ee",
  post_border_rainbow: "#818cf8",
  post_glow_elite:     "#f59e0b",
};

const CHAT_COLOR: Record<string, string> = {
  chat_bubble_premium: "#6366f1",
  chat_bubble_neon:    "#22d3ee",
};

export default function CosmeticPreview({ effectType, previewColor, size = 44 }: Props) {
  const wrap: React.CSSProperties = {
    width: size, height: size, borderRadius: 12,
    backgroundColor: "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, overflow: "visible", position: "relative",
  };

  /* ── All badges use CosmeticBadge for consistency with the store ── */
  if (effectType.startsWith("badge_")) {
    return (
      <div style={wrap}>
        <CosmeticBadge effectType={effectType} size={size} />
      </div>
    );
  }

  /* ── Avatar rings ── */
  if (effectType in RING_BG) {
    const avatarR = Math.floor(size * 0.36);
    const ringR   = avatarR + 4;
    return (
      <div style={wrap}>
        <div style={{ position: "relative", width: ringR * 2, height: ringR * 2 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: RING_BG[effectType], animation: "cosm-ring-spin 3s linear infinite" }} />
          <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#1a1a1a" }} />
        </div>
      </div>
    );
  }

  /* ── Avatar auras ── */
  if (effectType in AURA_SHADOW) {
    const c = AURA_SHADOW[effectType];
    return (
      <div style={wrap}>
        <div style={{ width: Math.floor(size * 0.5), height: Math.floor(size * 0.5), borderRadius: "50%", background: "#333",
          boxShadow: `0 0 ${size * 0.28}px ${size * 0.1}px ${c}`, animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }} />
      </div>
    );
  }

  /* ── Username effects ── */
  if (effectType in USERNAME_GRAD) {
    return (
      <div style={wrap}>
        <span style={{ fontSize: Math.floor(size * 0.24), fontWeight: 900,
          background: USERNAME_GRAD[effectType], WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", letterSpacing: "0.04em", animation: "cosm-shimmer-text 3s linear infinite", backgroundSize: "200% auto" }}>
          Aa
        </span>
      </div>
    );
  }

  /* ── Post borders ── */
  if (effectType in POST_GLOW) {
    const c = POST_GLOW[effectType];
    return (
      <div style={wrap}>
        <div style={{ width: Math.floor(size * 0.66), height: Math.floor(size * 0.52), borderRadius: 5, background: "#111",
          boxShadow: `0 0 0 1.8px ${c}, 0 0 10px 2px ${c}66`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 5, left: 5, right: 5, height: 2, borderRadius: 1, background: "#2a2a2a" }} />
          <div style={{ position: "absolute", top: 10, left: 5, right: 9, height: 2, borderRadius: 1, background: "#222" }} />
          <div style={{ position: "absolute", top: 15, left: 5, right: 13, height: 2, borderRadius: 1, background: "#1e1e1e" }} />
        </div>
      </div>
    );
  }

  /* ── Chat bubbles ── */
  if (effectType in CHAT_COLOR) {
    const c = CHAT_COLOR[effectType];
    return (
      <div style={wrap}>
        <div style={{ padding: "4px 8px", borderRadius: "10px 10px 3px 10px", background: c,
          fontSize: 8, color: "white", fontWeight: 700, boxShadow: `0 0 10px 3px ${c}66` }}>
          hi!
        </div>
      </div>
    );
  }

  /* ── Animated generic fallback ── */
  return (
    <div style={wrap}>
      <svg width={Math.floor(size * 0.82)} height={Math.floor(size * 0.82)} viewBox="0 0 64 64" fill="none" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`fall-${effectType.replace(/[^a-z0-9]/g, "")}-c`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={previewColor} stopOpacity="1" />
            <stop offset="60%" stopColor={previewColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={previewColor} stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="none" stroke={previewColor} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="8 4"
          style={{ animation: "cosm-ring-spin 5s linear infinite", transformOrigin: "32px 32px" }} />
        <circle cx="32" cy="32" r="20" fill="none" stroke={previewColor} strokeWidth="1" strokeOpacity="0.3"
          style={{ animation: "cosm-ring-spin 3s linear infinite reverse", transformOrigin: "32px 32px" }} />
        <circle cx="32" cy="32" r="13" fill={`url(#fall-${effectType.replace(/[^a-z0-9]/g, "")}-c)`}
          style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite", filter: `drop-shadow(0 0 8px ${previewColor})` }} />
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <circle key={i} cx={32 + 22 * Math.cos(rad)} cy={32 + 22 * Math.sin(rad)} r="2" fill={previewColor} fillOpacity="0.85"
            style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />;
        })}
        <circle cx="32" cy="32" r="4" fill="white" fillOpacity="0.9" />
      </svg>
    </div>
  );
}
