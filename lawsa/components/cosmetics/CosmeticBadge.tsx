"use client";
import DiamondBadge from "@/components/DiamondBadge";

interface Props {
  effectType: string;
  size?: number;
  className?: string;
}

/* ── Shared inline badge wrapper ── */
function B({ size, title, children, anim, filter }: {
  size: number; title: string; children: React.ReactNode;
  anim?: string; filter?: string;
}) {
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0 select-none" style={{ width: size, height: size }} title={title}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        style={{ overflow: "visible", animation: anim, filter }}>
        {children}
      </svg>
    </span>
  );
}

/* ── Existing badges ── */

function CrownBadge({ size }: { size: number }) {
  const id = `crown-${size}`;
  return (
    <B size={size} title="Golden Crown" anim="cosm-crown-shimmer 2.2s ease-in-out infinite">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="45%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" /><stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="16.5" width="16" height="2.5" rx="1" fill={`url(#${id}-g)`} />
      <path d="M4 17 L4 10 L8 13.5 L12 5.5 L16 13.5 L20 10 L20 17 Z" fill={`url(#${id}-g)`} />
      <path d="M4 17 L4 10 L8 13.5 L12 5.5 L16 13.5 L20 10 L20 17 Z" fill={`url(#${id}-s)`} />
      <circle cx="12" cy="7.5" r="1.4" fill="white" fillOpacity="0.92" />
      <circle cx="5.5" cy="12.5" r="0.9" fill="white" fillOpacity="0.75" />
      <circle cx="18.5" cy="12.5" r="0.9" fill="white" fillOpacity="0.75" />
    </B>
  );
}

function FireBadge({ size }: { size: number }) {
  const id = `fire-${size}`;
  return (
    <B size={size} title="Inferno" anim="cosm-fire-flicker 0.85s ease-in-out infinite" filter="drop-shadow(0 0 3px rgba(251,146,60,0.8))">
      <defs>
        <radialGradient id={`${id}-b`} cx="50%" cy="85%" r="65%">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="30%" stopColor="#fb923c" /><stop offset="70%" stopColor="#dc2626" /><stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-i`} cx="50%" cy="75%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" /><stop offset="60%" stopColor="#fde68a" /><stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="12" cy="19" rx="7" ry="4" fill="#dc2626" fillOpacity="0.3" />
      <path d="M12 2.5 C12 2.5 7.5 8.5 7.5 13.5 C7.5 16.9 9.4 19.5 12 19.5 C14.6 19.5 16.5 16.9 16.5 13.5 C16.5 10.5 14.5 7 12 2.5 Z" fill={`url(#${id}-b)`} />
      <path d="M12 8.5 C12 8.5 9.8 11.5 9.8 13.8 C9.8 15.5 10.7 17 12 17 C13.3 17 14.2 15.5 14.2 13.8 C14.2 11.5 12 8.5 12 8.5 Z" fill={`url(#${id}-i)`} />
      <circle cx="12" cy="3.2" r="0.9" fill="white" fillOpacity="0.95" />
    </B>
  );
}

function LightningBadge({ size }: { size: number }) {
  const id = `ltng-${size}`;
  return (
    <B size={size} title="Storm" anim="cosm-lightning-zap 2.8s ease-in-out infinite" filter="drop-shadow(0 0 3px rgba(139,92,246,0.75))">
      <defs>
        <linearGradient id={`${id}-g`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#ede9fe" /><stop offset="40%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <path d="M13.5 2 L4.5 13.5 H11 L10 22 L20.5 9.5 H14 L13.5 2 Z" fill={`url(#${id}-g)`} />
      <path d="M13.5 2 L10.5 9 H12 L13.5 2 Z" fill="white" fillOpacity="0.4" />
      <circle cx="14" cy="2" r="0.85" fill="#ede9fe" fillOpacity="0.95" />
      <circle cx="21" cy="9" r="0.65" fill="#c4b5fd" fillOpacity="0.85" />
      <circle cx="10" cy="22" r="0.65" fill="#8b5cf6" fillOpacity="0.8" />
    </B>
  );
}

function StarBadge({ size }: { size: number }) {
  const id = `star-${size}`;
  return (
    <B size={size} title="Supernova" anim="cosm-star-spin 5s linear infinite" filter="drop-shadow(0 0 3px rgba(250,204,21,0.8))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="45%" stopColor="#facc15" /><stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path d="M12 2 L14.8 8.9 H22.1 L16.2 13.3 L18.5 20.2 L12 15.8 L5.5 20.2 L7.8 13.3 L1.9 8.9 H9.2 Z" fill={`url(#${id}-g)`} />
      <path d="M12 2 L14.8 8.9 H9.2 Z" fill="white" fillOpacity="0.35" />
      <circle cx="12" cy="2" r="0.9" fill="white" fillOpacity="0.95" />
    </B>
  );
}

function VerifiedPlusBadge({ size }: { size: number }) {
  const id = `vp-${size}`;
  return (
    <B size={size} title="Verified+" anim="cosm-verified-pulse 2.4s ease-in-out infinite">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <circle cx="11" cy="12" r="9.5" fill={`url(#${id}-g)`} />
      <path d="M7.5 12.5 L10 15.2 L15.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18.5" cy="5.5" r="4.2" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.2" />
      <path d="M18.5 3.4 V7.6 M16.4 5.5 H20.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </B>
  );
}

function CrystalBadge({ size }: { size: number }) {
  const id = `crys-${size}`;
  return (
    <B size={size} title="Crystal" anim="cosm-crystal-refract 3.5s ease-in-out infinite" filter="drop-shadow(0 0 3px rgba(56,189,248,0.7))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" /><stop offset="35%" stopColor="#7dd3fc" /><stop offset="70%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" /><stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="12,1.5 20.5,6.5 20.5,17.5 12,22.5 3.5,17.5 3.5,6.5" fill={`url(#${id}-g)`} />
      <polygon points="12,1.5 20.5,6.5 12,12" fill={`url(#${id}-f)`} />
      <polygon points="3.5,6.5 12,12 3.5,17.5" fill="black" fillOpacity="0.14" />
      <polygon points="12,1.5 20.5,6.5 20.5,17.5 12,22.5 3.5,17.5 3.5,6.5" fill="none" stroke="rgba(186,230,253,0.55)" strokeWidth="0.7" />
      <circle cx="12" cy="1.5" r="1.1" fill="white" fillOpacity="0.97" />
    </B>
  );
}

/* ── New badges ── */

function AmethystInline({ size }: { size: number }) {
  const id = `iam-${size}`;
  return (
    <B size={size} title="Amethyst" anim="cosm-aura-pulse 2.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(139,92,246,0.9)) drop-shadow(0 0 2px rgba(251,191,36,0.5))">
      <defs>
        <linearGradient id={`${id}-g`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" /><stop offset="35%" stopColor="#a855f7" /><stop offset="70%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Gold outer frame */}
      <polygon points="12,1 21,6 22,14 18,21 12,23 6,21 2,14 3,6" fill={`url(#${id}-gd)`} />
      {/* Dark inner */}
      <polygon points="12,3 19,7 20,14 17,19 12,21 7,19 4,14 5,7" fill="#1e0a4e" />
      {/* Purple gem */}
      <polygon points="12,5 18,13 12,21 6,13" fill={`url(#${id}-g)`} />
      <polygon points="12,5 18,13 12,13" fill="white" fillOpacity="0.28" />
      <polygon points="6,13 12,13 12,21" fill="black" fillOpacity="0.2" />
      <circle cx="12" cy="9" r="1.8" fill="white" fillOpacity="0.9" style={{ animation: "sticker-ice-shimmer 1.8s ease-in-out infinite" }} />
    </B>
  );
}

function PhoenixInline({ size }: { size: number }) {
  const id = `iph-${size}`;
  return (
    <B size={size} title="Phoenix" anim="cosm-fire-flicker 1.2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(249,115,22,0.85)) drop-shadow(0 0 2px rgba(251,191,36,0.5))">
      <defs>
        <linearGradient id={`${id}-g`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" /><stop offset="40%" stopColor="#f97316" /><stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {/* Wings */}
      <path d="M6 12 C4 8 1 5 1 2 C2 6 4 10 5 12 Z" fill={`url(#${id}-gd)`} opacity="0.8" />
      <path d="M18 12 C20 8 23 5 23 2 C22 6 20 10 19 12 Z" fill={`url(#${id}-gd)`} opacity="0.8" />
      {/* Shield */}
      <path d="M12 2 L19 5 L20 13 L16 20 L12 22 L8 20 L4 13 L5 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 4 L18 7 L18 13 L15 19 L12 20 L9 19 L6 13 L6 7 Z" fill="#1c0800" />
      {/* Orange gem */}
      <polygon points="12,6 17,13 12,20 7,13" fill={`url(#${id}-g)`} />
      <polygon points="12,6 17,13 12,13" fill="white" fillOpacity="0.3" />
      <circle cx="12" cy="10" r="1.6" fill="white" fillOpacity="0.9" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
    </B>
  );
}

function DragonInline({ size }: { size: number }) {
  const id = `idr-${size}`;
  return (
    <B size={size} title="Dragon" anim="cosm-aura-pulse 2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(232,121,249,0.8)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <radialGradient id={`${id}-e`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e879f9" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" /><stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Horns */}
      <path d="M7 7 C5 3 3 1 2 1 C3 3 5 5 6 7 Z" fill={`url(#${id}-gd)`} />
      <path d="M17 7 C19 3 21 1 22 1 C21 3 19 5 18 7 Z" fill={`url(#${id}-gd)`} />
      {/* Gold frame */}
      <path d="M12 3 C16 3 21 6 21 12 C21 17 17 22 12 22 C7 22 3 17 3 12 C3 6 8 3 12 3 Z" fill={`url(#${id}-gd)`} />
      {/* Face */}
      <path d="M12 5 C15 5 19 7.5 19 12 C19 16 16 20 12 20 C8 20 5 16 5 12 C5 7.5 9 5 12 5 Z" fill={`url(#${id}-f)`} />
      {/* Eyes */}
      <ellipse cx="9" cy="11" rx="2.2" ry="1.8" fill={`url(#${id}-e)`} style={{ filter: "drop-shadow(0 0 2px rgba(232,121,249,0.9))" }} />
      <ellipse cx="15" cy="11" rx="2.2" ry="1.8" fill={`url(#${id}-e)`} style={{ filter: "drop-shadow(0 0 2px rgba(232,121,249,0.9))", animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />
      <circle cx="8.2" cy="10.3" r="0.7" fill="white" fillOpacity="0.9" />
      <circle cx="14.2" cy="10.3" r="0.7" fill="white" fillOpacity="0.9" />
      {/* Snout */}
      <ellipse cx="12" cy="16" rx="4" ry="2.5" fill="#e2e8f0" />
      <ellipse cx="10.5" cy="15.5" r="0.7" fill="#94a3b8" />
      <ellipse cx="13.5" cy="15.5" r="0.7" fill="#94a3b8" />
    </B>
  );
}

function RoyalInline({ size }: { size: number }) {
  const id = `iro-${size}`;
  return (
    <B size={size} title="Royal" anim="cosm-aura-pulse 2.2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(124,58,237,0.85)) drop-shadow(0 0 2px rgba(251,191,36,0.5))">
      <defs>
        <linearGradient id={`${id}-p`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ddd6fe" /><stop offset="40%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Wings */}
      <path d="M5 11 C3 8 1 5 0 3 C1 6 2 10 3 12 Z" fill={`url(#${id}-p)`} opacity="0.85" />
      <path d="M5 14 C2 12 0 10 0 7 C1 10 2 13 3 14 Z" fill={`url(#${id}-p)`} opacity="0.65" />
      <path d="M19 11 C21 8 23 5 24 3 C23 6 22 10 21 12 Z" fill={`url(#${id}-p)`} opacity="0.85" />
      <path d="M19 14 C22 12 24 10 24 7 C23 10 22 13 21 14 Z" fill={`url(#${id}-p)`} opacity="0.65" />
      {/* Gold shield */}
      <path d="M12 2 L19 5 L20 13 L17 20 L12 22 L7 20 L4 13 L5 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 4 L17 6.5 L18 13 L16 18 L12 20 L8 18 L6 13 L7 6.5 Z" fill="#1e0a4e" />
      {/* Crown spikes */}
      <path d="M8 6 L10 3 L12 5 L14 3 L16 6" fill={`url(#${id}-gd)`} />
      {/* Purple gem */}
      <polygon points="12,7 17,13 12,19 7,13" fill={`url(#${id}-p)`} />
      <polygon points="12,7 17,13 12,13" fill="white" fillOpacity="0.22" />
      <circle cx="12" cy="11" r="1.8" fill="white" fillOpacity="0.9" style={{ animation: "sticker-ice-shimmer 1.8s ease-in-out infinite" }} />
      {/* Gold drips */}
      <circle cx="10" cy="21.5" r="0.8" fill="#fbbf24" />
      <circle cx="12" cy="22.5" r="0.8" fill="#fbbf24" />
      <circle cx="14" cy="21.5" r="0.8" fill="#fbbf24" />
    </B>
  );
}

function WarriorInline({ size }: { size: number }) {
  const id = `iwa-${size}`;
  return (
    <B size={size} title="Warrior" anim="cosm-aura-pulse 2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(239,68,68,0.8)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <radialGradient id={`${id}-r`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fca5a5" /><stop offset="40%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={`${id}-sv`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" /><stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      {/* Spiky silver wings */}
      <path d="M5 10 L2 7 L2 12 L0 10 L2 15 L5 14 Z" fill={`url(#${id}-sv)`} />
      <path d="M19 10 L22 7 L22 12 L24 10 L22 15 L19 14 Z" fill={`url(#${id}-sv)`} />
      {/* Gold frame */}
      <path d="M12 1 L20 5 L21 13 L17 21 L12 23 L7 21 L3 13 L4 5 Z" fill={`url(#${id}-gd)`} />
      {/* Silver inner frame */}
      <path d="M12 3 L18 6 L19 13 L16 19 L12 21 L8 19 L5 13 L6 6 Z" fill={`url(#${id}-sv)`} />
      {/* Dark inner */}
      <path d="M12 5 L17 7.5 L18 13 L15 18 L12 19 L9 18 L6 13 L7 7.5 Z" fill="#1a0000" />
      {/* Spike crown */}
      <path d="M7 5 L9 1 L11 4 L12 1 L13 4 L15 1 L17 5" fill={`url(#${id}-gd)`} />
      {/* Ruby gem */}
      <path d="M12 7 L18 13 L15 19 L9 19 L6 13 Z" fill={`url(#${id}-r)`} />
      <path d="M12 7 L18 13 L12 13 Z" fill="white" fillOpacity="0.25" />
      <circle cx="12" cy="11" r="1.8" fill="white" fillOpacity="0.85" style={{ animation: "sticker-ice-shimmer 1.6s ease-in-out infinite" }} />
    </B>
  );
}

function AzureInline({ size }: { size: number }) {
  const id = `iaz-${size}`;
  return (
    <B size={size} title="Azure" anim="sticker-float 3s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(56,189,248,0.85)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <linearGradient id={`${id}-b`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" /><stop offset="40%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" /><stop offset="50%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Wings */}
      <path d="M5 10 C3 7 1 4 0 2 C1 5 2 9 3 12 Z" fill={`url(#${id}-b)`} opacity="0.85" />
      <path d="M5 14 C2 12 0 9 0 6 C1 9 2 12 3 14 Z" fill={`url(#${id}-b)`} opacity="0.65" />
      <path d="M19 10 C21 7 23 4 24 2 C23 5 22 9 21 12 Z" fill={`url(#${id}-b)`} opacity="0.85" />
      <path d="M19 14 C22 12 24 9 24 6 C23 9 22 12 21 14 Z" fill={`url(#${id}-b)`} opacity="0.65" />
      {/* Gold shield */}
      <path d="M12 2 L19 5 L20 13 L16 20 L12 22 L8 20 L4 13 L5 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 4 L17 6.5 L18 13 L15 18 L12 20 L9 18 L6 13 L7 6.5 Z" fill="#041c30" />
      {/* Crown */}
      <path d="M8 6 L10 3 L12 5 L14 3 L16 6" fill={`url(#${id}-gd)`} />
      {/* Multi-gem cross */}
      <polygon points="12,6 17,13 12,20 7,13" fill={`url(#${id}-t)`} />
      <polygon points="12,6 17,13 12,13" fill="white" fillOpacity="0.2" />
      {/* Gem sparkles */}
      {[{ cx: 12, cy: 6 }, { cx: 17, cy: 13 }, { cx: 12, cy: 20 }, { cx: 7, cy: 13 }].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="1.2" fill={`url(#${id}-b)`}
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s`, filter: "drop-shadow(0 0 2px #38bdf8)" }} />
      ))}
      <circle cx="12" cy="13" r="1.8" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 1.2s ease-in-out infinite" }} />
    </B>
  );
}

function InfernoInline({ size }: { size: number }) {
  const id = `iin-${size}`;
  return (
    <B size={size} title="Inferno" anim="cosm-fire-flicker 0.95s ease-in-out infinite" filter="drop-shadow(0 0 5px rgba(251,146,60,0.9))">
      <defs>
        <radialGradient id={`${id}-g`} cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="25%" stopColor="#fbbf24" /><stop offset="55%" stopColor="#f97316" /><stop offset="100%" stopColor="#dc2626" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id={`${id}-i`} cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="white" /><stop offset="35%" stopColor="#fef9c3" /><stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <ellipse cx="12" cy="20" rx="8" ry="3.5" fill="#dc2626" fillOpacity="0.2" />
      <path d="M12 1 C12 1 6 8 6 14 C6 18.5 8.6 22 12 22 C15.4 22 18 18.5 18 14 C18 8 12 1 12 1 Z" fill={`url(#${id}-g)`} />
      <path d="M12 7 C12 7 9 11 9 14 C9 16.2 10.3 18 12 18 C13.7 18 15 16.2 15 14 C15 11 12 7 12 7 Z" fill={`url(#${id}-i)`} />
      <circle cx="12" cy="1.5" r="1.2" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 0.8s ease-in-out infinite" }} />
    </B>
  );
}

function FrostInline({ size }: { size: number }) {
  const id = `ifr-${size}`;
  return (
    <B size={size} title="Frost" anim="sticker-float 3.2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(125,211,252,0.85))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" /><stop offset="50%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      {/* Snowflake arms */}
      {[0, 60, 120].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x1 = 12 + 2.5 * Math.cos(r), y1 = 12 + 2.5 * Math.sin(r);
        const x2 = 12 + 11 * Math.cos(r), y2 = 12 + 11 * Math.sin(r);
        const x3 = 12 + 2.5 * Math.cos(r + Math.PI), y3 = 12 + 2.5 * Math.sin(r + Math.PI);
        const x4 = 12 + 11 * Math.cos(r + Math.PI), y4 = 12 + 11 * Math.sin(r + Math.PI);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#${id}-g)`} strokeWidth="2.5" strokeLinecap="round" />
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke={`url(#${id}-g)`} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={x2} cy={y2} r="1.3" fill="#bae6fd" style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.3}s ease-in-out infinite` }} />
            <circle cx={x4} cy={y4} r="1.3" fill="#bae6fd" style={{ animation: `sticker-ice-shimmer ${1.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
          </g>
        );
      })}
      <polygon points="12,6 16,12 12,18 8,12" fill={`url(#${id}-g)`} />
      <polygon points="12,6 16,12 12,12" fill="white" fillOpacity="0.35" />
      <circle cx="12" cy="9.5" r="1.5" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
    </B>
  );
}

function StormInline({ size }: { size: number }) {
  const id = `ist-${size}`;
  return (
    <B size={size} title="Storm" anim="cosm-lightning-zap 2.4s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(167,139,250,0.85)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <linearGradient id={`${id}-b`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#ede9fe" /><stop offset="40%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Gold shield */}
      <path d="M12 2 L19 5 L20 13 L16 20 L12 22 L8 20 L4 13 L5 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 4 L17 6.5 L18 13 L15 18 L12 20 L9 18 L6 13 L7 6.5 Z" fill="#0f0f23" />
      {/* Storm cloud */}
      <ellipse cx="12" cy="9" rx="6" ry="3.5" fill="#334155" />
      <ellipse cx="8" cy="8" rx="4" ry="3" fill="#3730a3" />
      <ellipse cx="16" cy="8" rx="4" ry="3" fill="#3730a3" />
      {/* Bolt */}
      <path d="M14 5 L8 14 H12 L11 20 L18 11 H14 Z" fill={`url(#${id}-b)`} style={{ filter: "drop-shadow(0 0 2px rgba(167,139,250,0.9))" }} />
      <path d="M14 5 L8 14 H12 L13 10 Z" fill="white" fillOpacity="0.28" />
      {/* Crown */}
      <path d="M8 5.5 L10 2 L12 4 L14 2 L16 5.5" fill={`url(#${id}-gd)`} />
    </B>
  );
}

function TidalInline({ size }: { size: number }) {
  const id = `itd-${size}`;
  return (
    <B size={size} title="Tidal" anim="cosm-aura-pulse 2.2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(14,165,233,0.85))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" /><stop offset="50%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Gold shield */}
      <path d="M12 2 L19 5 L20 13 L16 20 L12 22 L8 20 L4 13 L5 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 4 L17 6.5 L18 13 L15 18 L12 20 L9 18 L6 13 L7 6.5 Z" fill="#041c30" />
      {/* Wave */}
      <path d="M6 13 C8 11 10 14 12 12 C14 10 16 13 18 11" stroke="#bae6fd" strokeWidth="1.8" fill="none" strokeOpacity="0.9"
        style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />
      <path d="M6 16 C8 14 10 17 12 15 C14 13 16 16 18 14" stroke="#bae6fd" strokeWidth="1.2" fill="none" strokeOpacity="0.6"
        style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite", animationDelay: "0.4s" }} />
      {/* Trident */}
      <line x1="12" y1="5" x2="12" y2="20" stroke={`url(#${id}-gd)`} strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="5" x2="9" y2="9" stroke={`url(#${id}-gd)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="5" x2="15" y2="9" stroke={`url(#${id}-gd)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="5" x2="16" y2="5" stroke={`url(#${id}-gd)`} strokeWidth="1.5" strokeLinecap="round" />
      {/* Center gem */}
      <circle cx="12" cy="14" r="2" fill={`url(#${id}-g)`} style={{ filter: "drop-shadow(0 0 3px #0ea5e9)", animation: "sticker-ice-shimmer 1.8s ease-in-out infinite" }} />
    </B>
  );
}

function GalaxyInline({ size }: { size: number }) {
  const id = `igl-${size}`;
  return (
    <B size={size} title="Galaxy" anim="sticker-void-rotate 6s linear infinite" filter="drop-shadow(0 0 4px rgba(129,140,248,0.85))">
      <defs>
        <radialGradient id={`${id}-g`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="25%" stopColor="#818cf8" /><stop offset="60%" stopColor="#7c3aed" stopOpacity="0.5" /><stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="#1e1b4b" />
      <path d="M12 12 C12 12 20 8 22 3 C20 8 17 10 12 12 Z" fill="#818cf8" fillOpacity="0.7" />
      <path d="M12 12 C12 12 4 16 2 21 C4 16 8 14 12 12 Z" fill="#818cf8" fillOpacity="0.7" />
      <path d="M12 12 C12 12 18 18 22 18 C18 16 15 14 12 12 Z" fill="#a78bfa" fillOpacity="0.55" />
      <path d="M12 12 C12 12 6 6 2 6 C6 8 9 10 12 12 Z" fill="#a78bfa" fillOpacity="0.55" />
      {[{ x: 5, y: 4 }, { x: 19, y: 4 }, { x: 3, y: 18 }, { x: 21, y: 18 }].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="0.9" fill="white" fillOpacity={0.5 + i * 0.1}
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
      <circle cx="12" cy="12" r="5" fill={`url(#${id}-g)`} />
      <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
    </B>
  );
}

function NovaInline({ size }: { size: number }) {
  const id = `inv-${size}`;
  return (
    <B size={size} title="Nova" anim="cosm-aura-pulse 2s ease-in-out infinite" filter="drop-shadow(0 0 5px rgba(251,146,60,0.9)) drop-shadow(0 0 2px rgba(251,191,36,0.6))">
      <defs>
        <radialGradient id={`${id}-g`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" /><stop offset="20%" stopColor="#fef3c7" /><stop offset="55%" stopColor="#fb923c" /><stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-r`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg, i) => {
        const r = (deg * Math.PI) / 180, len = i % 2 === 0 ? 11 : 8;
        return <line key={i} x1="12" y1="12" x2={12 + len * Math.cos(r)} y2={12 + len * Math.sin(r)}
          stroke={`url(#${id}-r)`} strokeWidth={i % 2 === 0 ? 1.8 : 0.9} strokeLinecap="round" strokeOpacity={i % 2 === 0 ? 0.9 : 0.5} />;
      })}
      <circle cx="12" cy="12" r="7" fill={`url(#${id}-g)`} />
      <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 0.9s ease-in-out infinite" }} />
    </B>
  );
}

function SolarInline({ size }: { size: number }) {
  const id = `isl-${size}`;
  return (
    <B size={size} title="Solar" anim="cosm-star-spin 7s linear infinite" filter="drop-shadow(0 0 5px rgba(251,191,36,0.9))">
      <defs>
        <radialGradient id={`${id}-g`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="40%" stopColor="#fbbf24" /><stop offset="80%" stopColor="#f97316" /><stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }, (_, i) => {
        const r = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={12 + 6 * Math.cos(r)} y1={12 + 6 * Math.sin(r)} x2={12 + 11 * Math.cos(r)} y2={12 + 11 * Math.sin(r)}
          stroke="#fbbf24" strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round" strokeOpacity={i % 3 === 0 ? 0.9 : 0.55} />;
      })}
      <circle cx="12" cy="12" r="6" fill={`url(#${id}-g)`} />
      <circle cx="10" cy="10" r="1.5" fill="#fef9c3" fillOpacity="0.4" />
      <circle cx="12" cy="12" r="2.2" fill="white" fillOpacity="0.9" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
    </B>
  );
}

function LunarInline({ size }: { size: number }) {
  const id = `ilu-${size}`;
  return (
    <B size={size} title="Lunar" anim="sticker-float 4s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(226,232,240,0.7))">
      <defs>
        <radialGradient id={`${id}-g`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f8fafc" /><stop offset="50%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <radialGradient id={`${id}-s`} cx="70%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0f172a" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="#0f172a" />
      <circle cx="12" cy="12" r="9" fill={`url(#${id}-g)`} />
      <circle cx="15" cy="11" r="8" fill={`url(#${id}-s)`} />
      <circle cx="8" cy="9" r="1.5" fill="#94a3b8" fillOpacity="0.4" />
      <circle cx="13" cy="15" r="1" fill="#94a3b8" fillOpacity="0.35" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
      {[{ x: 4, y: 5 }, { x: 20, y: 4 }, { x: 2, y: 15 }, { x: 22, y: 17 }].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="white" fillOpacity={0.5 + i * 0.1}
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </B>
  );
}

function VoidInline({ size }: { size: number }) {
  const id = `ivo-${size}`;
  return (
    <B size={size} title="Void" anim="cosm-aura-pulse 2.5s ease-in-out infinite" filter="drop-shadow(0 0 5px rgba(124,58,237,0.9))">
      <defs>
        <radialGradient id={`${id}-g`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" /><stop offset="50%" stopColor="#1e1040" /><stop offset="80%" stopColor="#312e81" /><stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <radialGradient id={`${id}-r`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${id}-g)`} />
      <circle cx="12" cy="12" r="11" fill={`url(#${id}-r)`} />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return <line key={i} x1="12" y1="12" x2={12 + 7 * Math.cos(r)} y2={12 + 7 * Math.sin(r)}
          stroke="#a78bfa" strokeWidth="0.6" strokeOpacity={0.3 + (i % 3) * 0.1} strokeLinecap="round" />;
      })}
      <circle cx="12" cy="12" r="4" fill="#000" style={{ filter: "drop-shadow(0 0 5px #7c3aed)" }} />
      <ellipse cx="12" cy="12" rx="1.5" ry="2.5" fill="#a78bfa" style={{ animation: "cosm-aura-pulse 1.8s ease-in-out infinite" }} />
      <circle cx="12" cy="12" r="0.8" fill="white" fillOpacity="0.9" />
    </B>
  );
}

function ShadowInline({ size }: { size: number }) {
  const id = `ish-${size}`;
  return (
    <B size={size} title="Shadow" anim="cosm-aura-pulse 2.5s ease-in-out infinite" filter="drop-shadow(0 0 3px rgba(148,163,184,0.6))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" /><stop offset="100%" stopColor="#030712" />
        </linearGradient>
        <linearGradient id={`${id}-sv`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <path d="M12 2 L19 5 L20 13 L16 20 L12 22 L8 20 L4 13 L5 5 Z" fill={`url(#${id}-sv)`} />
      <path d="M12 4 L17 6.5 L18 13 L15 18 L12 20 L9 18 L6 13 L7 6.5 Z" fill={`url(#${id}-g)`} />
      <path d="M8 8 C9 5 12 4 12 4 C12 4 15 5 16 8 C17 11 16 14 12 14 C8 14 7 11 8 8 Z" fill="#1f2937" stroke={`url(#${id}-sv)`} strokeWidth="0.6" />
      <ellipse cx="9.5" cy="9.5" rx="1.8" ry="1.3" fill="#374151" style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />
      <ellipse cx="14.5" cy="9.5" rx="1.8" ry="1.3" fill="#374151" style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite", animationDelay: "0.3s" }} />
      <circle cx="9" cy="9" r="0.6" fill="white" fillOpacity="0.5" />
      <circle cx="14" cy="9" r="0.6" fill="white" fillOpacity="0.5" />
      <polygon points="12,15 16,19 12,21 8,19" fill={`url(#${id}-sv)`} opacity="0.7" />
      <circle cx="12" cy="18" r="1.2" fill="#94a3b8" style={{ animation: "sticker-ice-shimmer 2s ease-in-out infinite" }} />
    </B>
  );
}

function AngelInline({ size }: { size: number }) {
  const id = `ian-${size}`;
  return (
    <B size={size} title="Angel" anim="sticker-float 3.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(251,191,36,0.7)) drop-shadow(0 0 2px rgba(255,255,255,0.5))">
      <defs>
        <linearGradient id={`${id}-w`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" /><stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {/* Halo */}
      <ellipse cx="12" cy="3.5" rx="6" ry="2.2" fill="none" stroke={`url(#${id}-gd)`} strokeWidth="2" style={{ filter: "drop-shadow(0 0 3px rgba(251,191,36,0.8))", animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }} />
      {/* Wings */}
      <path d="M6 11 C3 8 0 6 0 2 C1 5 2 9 3 12 L5 13 Z" fill={`url(#${id}-w)`} opacity="0.9" />
      <path d="M6 14 C2 12 0 10 0 7 C1 10 2 13 3 14 Z" fill={`url(#${id}-w)`} opacity="0.75" />
      <path d="M18 11 C21 8 24 6 24 2 C23 5 22 9 21 12 L19 13 Z" fill={`url(#${id}-w)`} opacity="0.9" />
      <path d="M18 14 C22 12 24 10 24 7 C23 10 22 13 21 14 Z" fill={`url(#${id}-w)`} opacity="0.75" />
      {/* Body gem */}
      <path d="M12 7 L17 13 L12 20 L7 13 Z" fill={`url(#${id}-gd)`} style={{ filter: "drop-shadow(0 0 3px rgba(251,191,36,0.7))" }} />
      <path d="M12 7 L17 13 L12 13 Z" fill="white" fillOpacity="0.35" />
      <circle cx="12" cy="11" r="1.8" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
      {[{ x: 4, y: 4 }, { x: 20, y: 4 }].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="0.9" fill="white"
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.4}s ease-in-out infinite` }} />
      ))}
    </B>
  );
}

function DivineInline({ size }: { size: number }) {
  const id = `idv-${size}`;
  return (
    <B size={size} title="Divine" anim="cosm-star-spin 5s linear infinite" filter="drop-shadow(0 0 5px rgba(251,191,36,0.95))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" /><stop offset="35%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id={`${id}-c`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" /><stop offset="50%" stopColor="#fef9c3" /><stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <path d="M12 1 L14.2 8 H21.5 L15.7 12.4 L17.9 19.4 L12 15 L6.1 19.4 L8.3 12.4 L2.5 8 H9.8 Z" fill={`url(#${id}-g)`} />
      <path d="M12 1 L14.2 8 H9.8 Z" fill="white" fillOpacity="0.38" />
      <circle cx="12" cy="11" r="4" fill={`url(#${id}-c)`} />
      <circle cx="12" cy="11" r="1.8" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 1.2s ease-in-out infinite" }} />
      {[{ x: 12, y: 1 }, { x: 21.5, y: 8 }, { x: 17.9, y: 19.4 }, { x: 6.1, y: 19.4 }, { x: 2.5, y: 8 }].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="0.9" fill="#fef9c3"
          style={{ animation: `sticker-ice-shimmer ${1 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </B>
  );
}

function TechInline({ size }: { size: number }) {
  const id = `ite-${size}`;
  return (
    <B size={size} title="Tech" anim="sticker-pulse-scale 2.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(34,211,238,0.85))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" /><stop offset="50%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <polygon points="12,1 21,6 22,18 12,23 2,18 3,6" fill={`url(#${id}-gd)`} />
      <polygon points="12,3 19,7 20,17 12,21 4,17 5,7" fill="#0a1628" />
      <line x1="12" y1="5" x2="12" y2="19" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="5" y1="12" x2="19" y2="12" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeOpacity="0.5" />
      {[[12, 5], [12, 19], [5, 12], [19, 12], [7, 7], [17, 7], [7, 17], [17, 17]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#22d3ee"
          style={{ animation: `sticker-ice-shimmer ${1 + i * 0.15}s ease-in-out infinite`, animationDelay: `${i * 0.08}s`, filter: "drop-shadow(0 0 2px #22d3ee)" }} />
      ))}
      <rect x="9" y="9" width="6" height="6" rx="1" fill="#0e2a3a" stroke={`url(#${id}-g)`} strokeWidth="0.8" />
      <circle cx="12" cy="12" r="1.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 3px #22d3ee)", animation: "cosm-aura-pulse 1.8s ease-in-out infinite" }} />
    </B>
  );
}

function NeonInline({ size }: { size: number }) {
  const id = `ine-${size}`;
  return (
    <B size={size} title="Neon" anim="cosm-aura-pulse 2s ease-in-out infinite" filter="drop-shadow(0 0 5px rgba(34,211,238,0.9)) drop-shadow(0 0 2px rgba(34,211,238,0.5))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" /><stop offset="50%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#020a14" stroke={`url(#${id}-g)`} strokeWidth="1.8" />
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="none" stroke="#67e8f9" strokeWidth="0.8" strokeDasharray="4 2.5" strokeOpacity="0.5"
        style={{ animation: "cosm-ring-spin 5s linear infinite", transformOrigin: "12px 12px" }} />
      {[[4.5, 4.5], [19.5, 4.5], [4.5, 19.5], [19.5, 19.5]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#22d3ee"
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.25}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
      ))}
      <circle cx="12" cy="12" r="4.5" fill="#022030" stroke={`url(#${id}-g)`} strokeWidth="1" />
      <circle cx="12" cy="12" r="2" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 4px #22d3ee)", animation: "cosm-aura-pulse 1.8s ease-in-out infinite" }} />
      <circle cx="12" cy="12" r="0.9" fill="white" fillOpacity="0.95" />
    </B>
  );
}

function GoldInline({ size }: { size: number }) {
  const id = `igo-${size}`;
  return (
    <B size={size} title="Gold" anim="cosm-crown-shimmer 2.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(251,191,36,0.9))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" /><stop offset="25%" stopColor="#fde68a" /><stop offset="55%" stopColor="#fbbf24" /><stop offset="80%" stopColor="#d97706" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" /><stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M12 1 L20 5 L21 13 L17 21 L12 23 L7 21 L3 13 L4 5 Z" fill={`url(#${id}-g)`} />
      <path d="M12 1 L20 5 L21 13 L17 21 L12 23 L7 21 L3 13 L4 5 Z" fill={`url(#${id}-s)`} />
      <path d="M12 4 L17.5 7 L18.5 13 L15.5 19 L12 20.5 L8.5 19 L5.5 13 L6.5 7 Z" fill="#b45309" />
      <path d="M12 4 L17.5 7 L18.5 13 L15.5 19 L12 20.5 L8.5 19 L5.5 13 L6.5 7 Z" fill={`url(#${id}-s)`} opacity="0.4" />
      <path d="M7.5 7.5 L9.5 3 L11 6 L12 2.5 L13 6 L14.5 3 L16.5 7.5" fill={`url(#${id}-g)`} />
      <polygon points="12,9 16,14 12,19 8,14" fill={`url(#${id}-g)`} style={{ filter: "drop-shadow(0 0 3px rgba(251,191,36,0.7))" }} />
      <polygon points="12,9 16,14 12,14" fill="white" fillOpacity="0.3" />
      <circle cx="12" cy="12" r="1.6" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 2s ease-in-out infinite" }} />
    </B>
  );
}

function RubyInline({ size }: { size: number }) {
  const id = `iru-${size}`;
  return (
    <B size={size} title="Ruby" anim="cosm-aura-pulse 2.2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(220,38,38,0.85)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <radialGradient id={`${id}-r`} cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fca5a5" /><stop offset="40%" stopColor="#f87171" /><stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <path d="M12 1 L20 5 L21 14 L17 21 L12 23 L7 21 L3 14 L4 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 3 L18 6.5 L19 14 L16 19 L12 21 L8 19 L5 14 L6 6.5 Z" fill="#2d0000" />
      {/* Ruby multifacet */}
      <polygon points="12,5 19,13 16,21 8,21 5,13" fill={`url(#${id}-r)`} />
      <polygon points="12,5 19,13 12,13" fill="white" fillOpacity="0.28" />
      <polygon points="5,13 12,13 8,21" fill="black" fillOpacity="0.2" />
      {/* Crown */}
      <path d="M7.5 5 L9.5 1.5 L11 4 L12 1 L13 4 L14.5 1.5 L16.5 5" fill={`url(#${id}-gd)`} />
      <circle cx="10" cy="9" r="1.8" fill="white" fillOpacity="0.8" style={{ animation: "sticker-ice-shimmer 1.6s ease-in-out infinite" }} />
    </B>
  );
}

function ObsidianInline({ size }: { size: number }) {
  const id = `iob-${size}`;
  return (
    <B size={size} title="Obsidian" anim="cosm-aura-pulse 2.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(124,58,237,0.7))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" /><stop offset="50%" stopColor="#111827" /><stop offset="100%" stopColor="#030712" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" /><stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-p`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <path d="M12 1 L20 5 L21 14 L16 21 L12 23 L8 21 L3 14 L4 5 Z" fill={`url(#${id}-g)`} />
      <path d="M12 1 L20 5 L21 14 L16 21 L12 23 L8 21 L3 14 L4 5 Z" fill={`url(#${id}-s)`} />
      <path d="M12 3 L18 6.5 L19 14 L15 19.5 L12 21 L9 19.5 L5 14 L6 6.5 Z" fill="none" stroke={`url(#${id}-p)`} strokeWidth="1.2" strokeOpacity="0.8" />
      {/* Glass facets */}
      <path d="M12 3 L18 6.5 L12 13 Z" fill="white" fillOpacity="0.06" />
      {/* Crown */}
      <path d="M7.5 5.5 L9.5 2 L11 4.5 L12 1.5 L13 4.5 L14.5 2 L16.5 5.5" fill={`url(#${id}-g)`} stroke={`url(#${id}-p)`} strokeWidth="0.7" />
      {/* Purple gem */}
      <polygon points="12,8 17,14 12,19 7,14" fill={`url(#${id}-p)`} style={{ filter: "drop-shadow(0 0 3px rgba(124,58,237,0.8))" }} />
      <polygon points="12,8 17,14 12,14" fill="white" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.8" style={{ animation: "sticker-ice-shimmer 2s ease-in-out infinite" }} />
    </B>
  );
}

function DemonInline({ size }: { size: number }) {
  const id = `ide-${size}`;
  return (
    <B size={size} title="Demon" anim="cosm-aura-pulse 1.8s ease-in-out infinite" filter="drop-shadow(0 0 5px rgba(220,38,38,0.9))">
      <defs>
        <radialGradient id={`${id}-e`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fca5a5" /><stop offset="50%" stopColor="#dc2626" /><stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id={`${id}-h`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7f1d1d" /><stop offset="100%" stopColor="#fca5a5" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="#1a0000" />
      {/* Horns */}
      <path d="M7 6 C5 2 2 0 1 0 C3 2 5 5 6 7 Z" fill={`url(#${id}-h)`} />
      <path d="M17 6 C19 2 22 0 23 0 C21 2 19 5 18 7 Z" fill={`url(#${id}-h)`} />
      {/* Face */}
      <path d="M7 9 C8 6 12 5 12 5 C12 5 16 6 17 9 C18 12 16 16 12 16 C8 16 6 12 7 9 Z" fill="#450a0a" stroke="#7f1d1d" strokeWidth="0.5" />
      {/* Eyes */}
      <ellipse cx="9" cy="10" rx="2.2" ry="1.6" fill={`url(#${id}-e)`} style={{ animation: "cosm-aura-pulse 1.6s ease-in-out infinite", filter: "drop-shadow(0 0 3px rgba(220,38,38,0.9))" }} />
      <ellipse cx="15" cy="10" rx="2.2" ry="1.6" fill={`url(#${id}-e)`} style={{ animation: "cosm-aura-pulse 1.6s ease-in-out infinite", animationDelay: "0.3s", filter: "drop-shadow(0 0 3px rgba(220,38,38,0.9))" }} />
      <circle cx="8.3" cy="9.3" r="0.7" fill="white" fillOpacity="0.6" />
      <circle cx="14.3" cy="9.3" r="0.7" fill="white" fillOpacity="0.6" />
      {/* Fangs */}
      <path d="M10 14 L9 18 M14 14 L15 18" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <circle cx="12" cy="20" r="2" fill="#7f1d1d" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
    </B>
  );
}

function SkullInline({ size }: { size: number }) {
  const id = `isk-${size}`;
  return (
    <B size={size} title="Skull" anim="cosm-aura-pulse 2.5s ease-in-out infinite" filter="drop-shadow(0 0 3px rgba(148,163,184,0.7))">
      <defs>
        <radialGradient id={`${id}-g`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f8fafc" /><stop offset="60%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <linearGradient id={`${id}-sv`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <path d="M12 2 L19 5 L20 13 L16 20 L12 22 L8 20 L4 13 L5 5 Z" fill={`url(#${id}-sv)`} />
      <path d="M12 3.5 L17.5 6.5 L18.5 13 L15 19 L12 20.5 L9 19 L5.5 13 L6.5 6.5 Z" fill="#0f172a" />
      {/* Crown */}
      <path d="M7.5 6 L9.5 2.5 L11 5 L12 2 L13 5 L14.5 2.5 L16.5 6" fill={`url(#${id}-sv)`} />
      {/* Skull cranium */}
      <ellipse cx="12" cy="11" rx="5.5" ry="6" fill={`url(#${id}-g)`} />
      {/* Jaw */}
      <rect x="8.5" y="15" width="7" height="4" rx="1.5" fill={`url(#${id}-g)`} />
      <rect x="9.8" y="16.5" width="1.2" height="2.5" fill="#0f172a" rx="0.5" />
      <rect x="11.4" y="16.5" width="1.2" height="2.5" fill="#0f172a" rx="0.5" />
      <rect x="13" y="16.5" width="1.2" height="2.5" fill="#0f172a" rx="0.5" />
      {/* Eye sockets */}
      <ellipse cx="9.5" cy="10.5" rx="2" ry="1.8" fill="#0f172a" />
      <ellipse cx="14.5" cy="10.5" rx="2" ry="1.8" fill="#0f172a" />
      <ellipse cx="9.5" cy="10.5" rx="1.4" ry="1.3" fill="#1e3a5f" style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite" }} />
      <ellipse cx="14.5" cy="10.5" rx="1.4" ry="1.3" fill="#1e3a5f" style={{ animation: "cosm-aura-pulse 2.2s ease-in-out infinite", animationDelay: "0.5s" }} />
      {/* Nose cavity */}
      <path d="M11.2 13 L12 12 L12.8 13 L12.5 14.2 L11.5 14.2 Z" fill="#0f172a" />
    </B>
  );
}

function WindInline({ size }: { size: number }) {
  const id = `iwd-${size}`;
  return (
    <B size={size} title="Wind" anim="cosm-ring-spin 6s linear infinite" filter="drop-shadow(0 0 4px rgba(52,211,153,0.8))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" /><stop offset="50%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M8 10 C10 6 16 7 16 12 C16 17 10 18 8 14" stroke={`url(#${id}-g)`} strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite" }} />
      <path d="M10 13 C12 9 18 10 18 15 C18 19 13 20 11 17" stroke={`url(#${id}-g)`} strokeWidth="2" fill="none" strokeLinecap="round" style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite", animationDelay: "0.3s" }} opacity="0.7" />
      <path d="M6 16 C8 12 14 13 14 18 C14 21 10 22 8 20" stroke={`url(#${id}-g)`} strokeWidth="1.5" fill="none" strokeLinecap="round" style={{ animation: "cosm-aura-pulse 2s ease-in-out infinite", animationDelay: "0.6s" }} opacity="0.5" />
      {[[5, 8], [19, 8], [4, 17], [20, 18]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#34d399"
          style={{ animation: `sticker-float ${1.2 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </B>
  );
}

function MatrixInline({ size }: { size: number }) {
  const id = `ima-${size}`;
  return (
    <B size={size} title="Matrix" anim="cosm-aura-pulse 2s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(34,197,94,0.85))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bbf7d0" /><stop offset="50%" stopColor="#22c55e" /><stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#000a00" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      {[5, 9, 13, 17, 21].map((y, i) => (
        <line key={i} x1="2" y1={y} x2="22" y2={y} stroke="#22c55e" strokeWidth="0.4" strokeOpacity={0.12 + i * 0.04} />
      ))}
      {[4, 8, 12, 16, 20].map((x, i) => (
        <text key={i} x={x} y={8 + (i % 3) * 6} fontSize="4" fill="#22c55e" fillOpacity={0.4 + i * 0.08} fontFamily="monospace"
          style={{ animation: `sticker-float ${1.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }}>
          {String.fromCharCode(48 + i * 7 % 10)}
        </text>
      ))}
      <path d="M8 7 L6 12 H9 L8 17 L15 10 H12 Z" fill={`url(#${id}-g)`} style={{ filter: "drop-shadow(0 0 3px #22c55e)" }} />
      <circle cx="18" cy="5" r="2" fill="#22c55e" style={{ filter: "drop-shadow(0 0 3px #22c55e)", animation: "cosm-aura-pulse 1.8s ease-in-out infinite" }} />
    </B>
  );
}

function EarthInline({ size }: { size: number }) {
  const id = `iea-${size}`;
  return (
    <B size={size} title="Earth" anim="cosm-aura-pulse 2.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(34,197,94,0.7)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <radialGradient id={`${id}-g`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#86efac" /><stop offset="40%" stopColor="#22c55e" /><stop offset="100%" stopColor="#14532d" />
        </radialGradient>
        <linearGradient id={`${id}-st`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8a29e" /><stop offset="100%" stopColor="#44403c" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <path d="M12 1 L20 5 L21 13 L17 21 L12 23 L7 21 L3 13 L4 5 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 3 L18 6.5 L19 13 L16 19 L12 21 L8 19 L5 13 L6 6.5 Z" fill={`url(#${id}-st)`} />
      <path d="M12 3 L18 6.5 L19 13 L16 19 L12 21 L8 19 L5 13 L6 6.5 Z" fill="#1a1100" opacity="0.55" />
      {/* Crown */}
      <path d="M7.5 5 L9.5 1.5 L11 4 L12 1 L13 4 L14.5 1.5 L16.5 5" fill={`url(#${id}-gd)`} />
      {/* Emerald gem */}
      <polygon points="12,6 18,13 12,20 6,13" fill={`url(#${id}-g)`} style={{ filter: "drop-shadow(0 0 3px rgba(34,197,94,0.7))" }} />
      <polygon points="12,6 18,13 12,13" fill="white" fillOpacity="0.26" />
      <circle cx="12" cy="11" r="1.8" fill="white" fillOpacity="0.85" style={{ animation: "sticker-ice-shimmer 2s ease-in-out infinite" }} />
    </B>
  );
}

function CosmicInline({ size }: { size: number }) {
  const id = `ico-${size}`;
  return (
    <B size={size} title="Cosmic" anim="cosm-star-spin 4s linear infinite" filter="drop-shadow(0 0 4px rgba(129,140,248,0.8)) drop-shadow(0 0 3px rgba(232,121,249,0.5))">
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" /><stop offset="33%" stopColor="#facc15" /><stop offset="66%" stopColor="#4ade80" /><stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Rainbow glow ring */}
      <circle cx="12" cy="12" r="11" fill="none" stroke={`url(#${id}-g)`} strokeWidth="2" style={{ filter: "drop-shadow(0 0 3px rgba(129,140,248,0.6))" }} />
      {/* Gold shield */}
      <path d="M12 4 L17.5 7 L18.5 14 L15 19 L12 20.5 L9 19 L5.5 14 L6.5 7 Z" fill={`url(#${id}-gd)`} />
      <path d="M12 6 L16 8.5 L16.8 14 L14 18 L12 19 L10 18 L7.2 14 L8 8.5 Z" fill="#0a0018" />
      {/* Cosmic gem */}
      <polygon points="12,8 16,14 12,19 8,14" fill={`url(#${id}-g)`} />
      <polygon points="12,8 16,14 12,14" fill="white" fillOpacity="0.2" />
      {["#f87171", "#facc15", "#4ade80", "#818cf8"].map((c, i) => {
        const r = (i * 90 * Math.PI) / 180;
        return <circle key={i} cx={12 + 4.5 * Math.cos(r)} cy={14 + 4.5 * Math.sin(r)} r="1"
          fill={c} style={{ filter: `drop-shadow(0 0 2px ${c})`, animation: `sticker-ice-shimmer ${1.2 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />;
      })}
      <circle cx="12" cy="13" r="1.5" fill="white" fillOpacity="0.95" style={{ animation: "sticker-ice-shimmer 1.2s ease-in-out infinite" }} />
    </B>
  );
}

function CrystalHeraldInline({ size }: { size: number }) {
  const id = `ich-${size}`;
  return (
    <B size={size} title="Crystal Herald" anim="cosm-crystal-refract 3.5s ease-in-out infinite" filter="drop-shadow(0 0 4px rgba(125,211,252,0.85)) drop-shadow(0 0 2px rgba(251,191,36,0.4))">
      <defs>
        <linearGradient id={`${id}-i`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" /><stop offset="40%" stopColor="#7dd3fc" /><stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={`${id}-gd`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" /><stop offset="50%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" /><stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M12 1 L20 5 L21 13 L17 21 L12 23 L7 21 L3 13 L4 5 Z" fill={`url(#${id}-gd)`} />
      <polygon points="12,3 19,7 19,17 12,21 5,17 5,7" fill={`url(#${id}-i)`} />
      <polygon points="12,3 19,7 12,12" fill={`url(#${id}-f)`} />
      <polygon points="5,7 12,12 5,17" fill="black" fillOpacity="0.15" />
      <polygon points="12,3 19,7 19,17 12,21 5,17 5,7" fill="none" stroke="rgba(186,230,253,0.7)" strokeWidth="0.7" />
      {[[12, 3], [19, 7], [19, 17], [12, 21], [5, 17], [5, 7]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="white" fillOpacity="0.9"
          style={{ animation: `sticker-ice-shimmer ${1.2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
      ))}
      <circle cx="12" cy="11" r="1.8" fill="white" style={{ animation: "sticker-ice-shimmer 1.5s ease-in-out infinite" }} />
    </B>
  );
}

/* ── Main switch ── */
export default function CosmeticBadge({ effectType, size = 18, className = "" }: Props) {
  const wrap = (node: React.ReactNode) => (
    <span className={`inline-flex items-center justify-center ${className}`}>{node}</span>
  );

  switch (effectType) {
    /* Existing */
    case "badge_diamond":      return wrap(<DiamondBadge size={size} />);
    case "badge_crown":        return <CrownBadge size={size} />;
    case "badge_fire":         return <FireBadge size={size} />;
    case "badge_lightning":    return <LightningBadge size={size} />;
    case "badge_star":         return <StarBadge size={size} />;
    case "badge_verified_plus":return <VerifiedPlusBadge size={size} />;
    case "badge_crystal":      return <CrystalBadge size={size} />;
    /* New heraldic */
    case "badge_amethyst":     return <AmethystInline size={size} />;
    case "badge_phoenix":      return <PhoenixInline size={size} />;
    case "badge_dragon":       return <DragonInline size={size} />;
    case "badge_royal":        return <RoyalInline size={size} />;
    case "badge_warrior":      return <WarriorInline size={size} />;
    case "badge_azure":        return <AzureInline size={size} />;
    /* Elemental */
    case "badge_inferno":      return <InfernoInline size={size} />;
    case "badge_frost":        return <FrostInline size={size} />;
    case "badge_storm":        return <StormInline size={size} />;
    case "badge_tidal":        return <TidalInline size={size} />;
    case "badge_earth":        return <EarthInline size={size} />;
    /* Celestial */
    case "badge_galaxy":       return <GalaxyInline size={size} />;
    case "badge_nova":         return <NovaInline size={size} />;
    case "badge_solar":        return <SolarInline size={size} />;
    case "badge_lunar":        return <LunarInline size={size} />;
    /* Dark */
    case "badge_void":         return <VoidInline size={size} />;
    case "badge_shadow":       return <ShadowInline size={size} />;
    case "badge_demon":        return <DemonInline size={size} />;
    case "badge_skull":        return <SkullInline size={size} />;
    /* Divine / light */
    case "badge_angel":        return <AngelInline size={size} />;
    case "badge_divine":       return <DivineInline size={size} />;
    /* Tech */
    case "badge_tech":         return <TechInline size={size} />;
    case "badge_neon":         return <NeonInline size={size} />;
    case "badge_matrix":       return <MatrixInline size={size} />;
    /* Premium */
    case "badge_gold":         return <GoldInline size={size} />;
    case "badge_ruby":         return <RubyInline size={size} />;
    case "badge_obsidian":     return <ObsidianInline size={size} />;
    /* Special */
    case "badge_wind":         return <WindInline size={size} />;
    case "badge_cosmic":       return <CosmicInline size={size} />;
    case "badge_crystal_herald": return <CrystalHeraldInline size={size} />;
    /* Sovereign */
    case "badge_sovereign":    return <SovereignInline size={size} />;
    /* New badges */
    case "badge_lion":         return <LionInline size={size} />;
    case "badge_fist":         return <FistInline size={size} />;
    default:                   return null;
  }
}

function SovereignInline({ size }: { size: number }) {
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
        style={{
          objectFit: "contain",
          filter:
            "drop-shadow(0 0 3px rgba(180,100,255,0.9)) drop-shadow(0 0 7px rgba(255,200,50,0.5))",
          animation: "cosm-aura-pulse 3s ease-in-out infinite",
        }}
      />
    </span>
  );
}

function LionInline({ size }: { size: number }) {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Lion of LAWSA"
    >
      <img
        src="/badge-lion.jpg"
        alt="Lion of LAWSA"
        width={size}
        height={size}
        style={{
          objectFit: "contain",
          borderRadius: "50%",
          filter:
            "drop-shadow(0 0 3px rgba(251,191,36,0.9)) drop-shadow(0 0 7px rgba(251,191,36,0.5))",
          animation: "cosm-crown-shimmer 2.5s ease-in-out infinite",
        }}
      />
    </span>
  );
}

function FistInline({ size }: { size: number }) {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 select-none"
      style={{ width: size, height: size }}
      title="Iron Fist"
    >
      <img
        src="/badge-fist.png"
        alt="Iron Fist"
        width={size}
        height={size}
        style={{
          objectFit: "contain",
          filter:
            "drop-shadow(0 0 2px rgba(180,83,9,0.8)) drop-shadow(0 0 5px rgba(180,83,9,0.4))",
          animation: "cosm-aura-pulse 3s ease-in-out infinite",
        }}
      />
    </span>
  );
}
