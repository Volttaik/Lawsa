"use client";

export interface StickerDef {
  id: string;
  name: string;
  packId: string;
}

export interface BuiltinPack {
  id: string;
  name: string;
  icon: string;
  isFree: boolean;
  stickers: StickerDef[];
}

export const BUILTIN_PACKS: BuiltinPack[] = [
  {
    id: "vibes",
    name: "Vibes",
    icon: "😂",
    isFree: true,
    stickers: [
      { id: "1F600", name: "Grinning",       packId: "vibes" },
      { id: "1F602", name: "Crying Laughing", packId: "vibes" },
      { id: "1F970", name: "Smiling Hearts",  packId: "vibes" },
      { id: "1F60D", name: "Heart Eyes",      packId: "vibes" },
      { id: "1F929", name: "Star-Struck",     packId: "vibes" },
      { id: "1F62D", name: "Sobbing",         packId: "vibes" },
      { id: "1F624", name: "Steaming",        packId: "vibes" },
      { id: "1F92F", name: "Mind Blown",      packId: "vibes" },
      { id: "1F97A", name: "Pleading",        packId: "vibes" },
      { id: "1F60E", name: "Cool",            packId: "vibes" },
      { id: "1F621", name: "Pouting",         packId: "vibes" },
      { id: "1FAE1", name: "Saluting",        packId: "vibes" },
    ],
  },
  {
    id: "hype",
    name: "Hype",
    icon: "🔥",
    isFree: true,
    stickers: [
      { id: "1F525", name: "Fire",         packId: "hype" },
      { id: "1F451", name: "Crown",        packId: "hype" },
      { id: "1F48E", name: "Diamond",      packId: "hype" },
      { id: "26A1",  name: "Lightning",    packId: "hype" },
      { id: "1F680", name: "Rocket",       packId: "hype" },
      { id: "1F3C6", name: "Trophy",       packId: "hype" },
      { id: "1F4AF", name: "100",          packId: "hype" },
      { id: "1F389", name: "Party",        packId: "hype" },
      { id: "1F4AA", name: "Strong",       packId: "hype" },
      { id: "2728",  name: "Sparkles",     packId: "hype" },
      { id: "1F31F", name: "Glowing Star", packId: "hype" },
      { id: "1F4A5", name: "Boom",         packId: "hype" },
    ],
  },
  {
    id: "mood",
    name: "Mood",
    icon: "💜",
    isFree: true,
    stickers: [
      { id: "1F911", name: "Money Mouth",  packId: "mood" },
      { id: "1F440", name: "Eyes",         packId: "mood" },
      { id: "1F480", name: "Skull",        packId: "mood" },
      { id: "1F608", name: "Smiling Devil",packId: "mood" },
      { id: "2764",  name: "Red Heart",    packId: "mood" },
      { id: "1F49C", name: "Purple Heart", packId: "mood" },
      { id: "1F38A", name: "Confetti",     packId: "mood" },
      { id: "1F3AF", name: "Bullseye",     packId: "mood" },
      { id: "1F44F", name: "Clap",         packId: "mood" },
      { id: "1F90D", name: "White Heart",  packId: "mood" },
      { id: "1F49B", name: "Yellow Heart", packId: "mood" },
      { id: "1F64F", name: "Folded Hands", packId: "mood" },
    ],
  },
];

export function toStickerToken(id: string) { return `[s:${id}]`; }
export function parseStickerToken(value: string): string | null {
  const m = value.match(/^\[s:([0-9A-Fa-f-]+)\]$/);
  return m ? m[1] : null;
}
export function hasStickerToken(text: string) { return /\[s:[0-9A-Fa-f-]+\]/.test(text); }

const ALL_IDS = new Set(
  BUILTIN_PACKS.flatMap(p => p.stickers.map(s => s.id.toUpperCase()))
);
export function isStickerKnown(id: string) { return ALL_IDS.has(id.toUpperCase()); }

export function getStickerUrl(id: string) {
  return `https://openmoji.org/data/color/svg/${id.toUpperCase()}.svg`;
}

interface StickerProps { id: string; size?: number; }
export function Sticker({ id, size = 48 }: StickerProps) {
  return (
    <img
      src={getStickerUrl(id)}
      alt={id}
      width={size}
      height={size}
      style={{ display: "inline-block" }}
      loading="lazy"
      draggable={false}
    />
  );
}

export function PackIcon({ packId, size = 24 }: { packId: string; size?: number }) {
  const pack = BUILTIN_PACKS.find(p => p.id === packId);
  return (
    <span style={{ fontSize: size * 0.78, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {pack?.icon ?? "✦"}
    </span>
  );
}
