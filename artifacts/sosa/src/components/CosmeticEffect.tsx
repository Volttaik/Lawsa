import { CSSProperties } from "react";

/* ── Animated badge previews ─────────────────────────────────────────────── */
function BadgeDiamond({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 6px rgba(103,232,249,0.9)) drop-shadow(0 0 12px rgba(192,132,252,0.6))", animation: "spin 4s linear infinite" }}>
      <defs>
        <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" /><stop offset="40%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#e879f9" /><stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <clipPath id="dc"><polygon points="20,2 38,14 20,38 2,14" /></clipPath>
      </defs>
      <polygon points="20,2 38,14 20,38 2,14" fill="url(#dg)" />
      <polygon points="20,2 38,14 20,14" fill="white" fillOpacity="0.35" />
      <polygon points="2,14 20,14 20,38" fill="black" fillOpacity="0.12" />
      <polygon points="11,14 20,5 29,14 20,27" fill="white" fillOpacity="0.20" />
      <g clipPath="url(#dc)">
        <rect x="-8" y="0" width="14" height="40" fill="white" fillOpacity="0.7"
          style={{ transformOrigin: "20px 20px", transform: "skewX(-18deg)", animation: "diamond-sweep 2.5s ease-in-out infinite" }} />
      </g>
      <polygon points="20,2 38,14 20,38 2,14" fill="none" stroke="rgba(186,230,253,0.5)" strokeWidth="1" />
    </svg>
  );
}

function BadgeCrown({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.9)) drop-shadow(0 0 14px rgba(245,158,11,0.5))" }}>
      <defs>
        <linearGradient id="crg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="50%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M5,28 L8,14 L16,22 L20,8 L24,22 L32,14 L35,28 Z" fill="url(#crg)" />
      <rect x="5" y="28" width="30" height="5" rx="2" fill="url(#crg)" />
      <circle cx="20" cy="8" r="2.5" fill="#fde68a" style={{ animation: "pulse-glow 1.5s ease-in-out infinite" }} />
      <circle cx="8" cy="14" r="2" fill="#fde68a" />
      <circle cx="32" cy="14" r="2" fill="#fde68a" />
      <circle cx="13" cy="30.5" r="1.5" fill="#fcd34d" />
      <circle cx="20" cy="30.5" r="1.5" fill="#fcd34d" />
      <circle cx="27" cy="30.5" r="1.5" fill="#fcd34d" />
    </svg>
  );
}

function BadgeFire({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 8px rgba(251,113,35,0.9)) drop-shadow(0 0 18px rgba(239,68,68,0.5))" }}>
      <defs>
        <radialGradient id="fg" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#fcd34d" /><stop offset="40%" stopColor="#f97316" /><stop offset="100%" stopColor="#dc2626" />
        </radialGradient>
      </defs>
      <path d="M20,36 C12,36 7,30 7,22 C7,16 11,12 14,10 C13,14 15,16 17,15 C15,11 18,5 20,4 C20,9 23,12 21,16 C24,13 26,10 25,6 C29,10 33,16 33,22 C33,30 28,36 20,36 Z"
        fill="url(#fg)" style={{ animation: "flame-flicker 0.8s ease-in-out infinite alternate" }} />
      <path d="M20,33 C16,33 13,29 13,24 C13,20 16,18 17,17 C17,20 19,21 20,20 C19,18 21,15 22,14 C22,17 24,19 23,22 C25,20 25,18 24,16 C27,19 27,22 27,24 C27,29 24,33 20,33 Z"
        fill="#fde68a" fillOpacity="0.7" />
    </svg>
  );
}

function BadgeLightning({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 8px rgba(96,165,250,0.9)) drop-shadow(0 0 18px rgba(59,130,246,0.6))", animation: "lightning-flash 2s ease-in-out infinite" }}>
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bfdbfe" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M23,4 L10,22 L18,22 L17,36 L30,18 L22,18 Z" fill="url(#lg)" />
      <path d="M23,4 L10,22 L18,22 L17,36 L30,18 L22,18 Z" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

function BadgeStar({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.9)) drop-shadow(0 0 18px rgba(234,179,8,0.5))", animation: "spin 6s linear infinite" }}>
      <defs>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" /><stop offset="50%" stopColor="#eab308" /><stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <polygon points="20,3 24.5,15 37,15 27,23 31,36 20,28 9,36 13,23 3,15 15.5,15"
        fill="url(#sg)" stroke="#fde047" strokeWidth="0.5" />
      <polygon points="20,3 24.5,15 37,15 27,23 31,36 20,28 9,36 13,23 3,15 15.5,15"
        fill="white" fillOpacity="0.18" />
    </svg>
  );
}

function BadgeVerifiedPlus({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.9)) drop-shadow(0 0 14px rgba(16,185,129,0.5))" }}>
      <defs>
        <linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M20,3 L24,8 L30,7 L31,13 L37,16 L34,22 L37,28 L31,31 L30,37 L24,36 L20,41 L16,36 L10,37 L9,31 L3,28 L6,22 L3,16 L9,13 L10,7 L16,8 Z" fill="url(#vg)" />
      <path d="M13,20 L17.5,25 L27,15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Avatar ring effects ─────────────────────────────────────────────────── */
export function AvatarRing({ effectType, size = 44, children }: { effectType: string; size?: number; children: React.ReactNode }) {
  const s = size + 8;
  const rings: Record<string, CSSProperties> = {
    avatar_ring_gold: { background: "conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24)", animation: "spin 3s linear infinite", borderRadius: "50%", padding: "3px" },
    avatar_ring_rainbow: { background: "conic-gradient(from 0deg, #ef4444,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6,#ec4899,#ef4444)", animation: "spin 2s linear infinite", borderRadius: "50%", padding: "3px" },
    avatar_glow_blue: { boxShadow: "0 0 0 3px rgba(59,130,246,0.6), 0 0 16px rgba(59,130,246,0.4)", borderRadius: "50%", animation: "pulse-glow 2s ease-in-out infinite" },
    avatar_glow_neon: { boxShadow: "0 0 0 3px rgba(168,85,247,0.7), 0 0 20px rgba(168,85,247,0.5)", borderRadius: "50%", animation: "pulse-glow 1.8s ease-in-out infinite" },
    avatar_ring_fire: { background: "conic-gradient(from 0deg, #dc2626,#f97316,#fbbf24,#f97316,#dc2626)", animation: "spin 2.5s linear infinite", borderRadius: "50%", padding: "3px" },
    avatar_sparkle: { boxShadow: "0 0 0 2px rgba(251,191,36,0.5), 0 0 12px rgba(251,191,36,0.3)", borderRadius: "50%", animation: "sparkle-pulse 1.5s ease-in-out infinite" },
  };
  const ring = rings[effectType];
  if (!ring) return <>{children}</>;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: s, height: s }}>
      <div style={{ ...ring, position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", zIndex: 1, borderRadius: "50%", overflow: "hidden", width: size, height: size, background: "#000" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Username text effects ───────────────────────────────────────────────── */
export function UsernameEffect({ effectType, children, className = "" }: { effectType: string; children: React.ReactNode; className?: string }) {
  const styles: Record<string, CSSProperties> = {
    username_gold: { background: "linear-gradient(90deg,#fbbf24,#f59e0b,#fde68a,#f59e0b,#fbbf24)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer-text 2s linear infinite" },
    username_neon_blue: { color: "#60a5fa", textShadow: "0 0 8px rgba(96,165,250,0.9), 0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(37,99,235,0.3)", animation: "neon-pulse 2s ease-in-out infinite" },
    username_neon_purple: { color: "#c084fc", textShadow: "0 0 8px rgba(192,132,252,0.9), 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(126,34,206,0.3)", animation: "neon-pulse 2s ease-in-out infinite" },
    username_rainbow: { background: "linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6,#ec4899)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer-text 1.5s linear infinite" },
    username_chrome: { background: "linear-gradient(180deg,#e2e8f0 0%,#94a3b8 30%,#f8fafc 50%,#64748b 70%,#e2e8f0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
    username_fire: { background: "linear-gradient(90deg,#dc2626,#f97316,#fbbf24,#f97316,#dc2626)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer-text 1.2s linear infinite" },
  };
  const st = styles[effectType];
  if (!st) return <span className={className}>{children}</span>;
  return <span className={className} style={st}>{children}</span>;
}

/* ── Post frame effects ──────────────────────────────────────────────────── */
export function PostFrame({ effectType, children, className = "" }: { effectType: string; children: React.ReactNode; className?: string }) {
  const wrappers: Record<string, CSSProperties> = {
    post_border_gold: { border: "2px solid transparent", borderRadius: "12px", background: "linear-gradient(#111, #111) padding-box, linear-gradient(90deg,#fbbf24,#f59e0b,#fde68a,#f59e0b,#fbbf24) border-box", backgroundSize: "200% auto", animation: "shimmer-text 2s linear infinite" },
    post_border_neon: { border: "2px solid rgba(96,165,250,0.6)", borderRadius: "12px", boxShadow: "0 0 12px rgba(59,130,246,0.3), inset 0 0 12px rgba(59,130,246,0.05)", animation: "neon-pulse 2s ease-in-out infinite" },
    post_border_rainbow: { border: "2px solid transparent", borderRadius: "12px", background: "linear-gradient(#111, #111) padding-box, linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6,#ec4899,#ef4444) border-box", backgroundSize: "200% auto", animation: "shimmer-text 1.5s linear infinite" },
    post_border_fire: { border: "2px solid transparent", borderRadius: "12px", background: "linear-gradient(#111, #111) padding-box, linear-gradient(90deg,#dc2626,#f97316,#fbbf24,#f97316,#dc2626) border-box", backgroundSize: "200% auto", animation: "shimmer-text 1.2s linear infinite" },
  };
  const st = wrappers[effectType];
  if (!st) return <div className={className}>{children}</div>;
  return <div className={className} style={st}>{children}</div>;
}

/* ── Store/Wardrobe preview thumbnail ────────────────────────────────────── */
export function CosmeticPreview({ effectType, size = 44 }: { effectType: string; size?: number }) {
  const badgeMap: Record<string, React.ReactNode> = {
    badge_diamond:      <BadgeDiamond size={size} />,
    badge_crown:        <BadgeCrown size={size} />,
    badge_fire:         <BadgeFire size={size} />,
    badge_lightning:    <BadgeLightning size={size} />,
    badge_star:         <BadgeStar size={size} />,
    badge_verified_plus:<BadgeVerifiedPlus size={size} />,
  };
  if (badgeMap[effectType]) {
    return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>{badgeMap[effectType]}</div>;
  }
  if (effectType.startsWith("avatar_ring_gold")) {
    return <AvatarRing effectType="avatar_ring_gold" size={size - 8}><div style={{ width: size - 8, height: size - 8, borderRadius: "50%", background: "linear-gradient(135deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#94a3b8" }}>A</div></AvatarRing>;
  }
  if (effectType.startsWith("avatar_ring_rainbow")) {
    return <AvatarRing effectType="avatar_ring_rainbow" size={size - 8}><div style={{ width: size - 8, height: size - 8, borderRadius: "50%", background: "linear-gradient(135deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#94a3b8" }}>A</div></AvatarRing>;
  }
  if (effectType.startsWith("avatar_ring_fire")) {
    return <AvatarRing effectType="avatar_ring_fire" size={size - 8}><div style={{ width: size - 8, height: size - 8, borderRadius: "50%", background: "linear-gradient(135deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#94a3b8" }}>A</div></AvatarRing>;
  }
  if (effectType.startsWith("avatar_glow")) {
    return <AvatarRing effectType={effectType} size={size - 8}><div style={{ width: size - 8, height: size - 8, borderRadius: "50%", background: "linear-gradient(135deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#94a3b8" }}>A</div></AvatarRing>;
  }
  if (effectType.startsWith("username_")) {
    return (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#0a0a0a" }}>
        <UsernameEffect effectType={effectType}><span style={{ fontWeight: 900, fontSize: size * 0.22 }}>Name</span></UsernameEffect>
      </div>
    );
  }
  if (effectType.startsWith("post_border_")) {
    return (
      <PostFrame effectType={effectType}>
        <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", borderRadius: 10 }}>
          <div style={{ width: "60%", height: "60%", borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
        </div>
      </PostFrame>
    );
  }
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontSize: 10 }}>?</div>
  );
}
