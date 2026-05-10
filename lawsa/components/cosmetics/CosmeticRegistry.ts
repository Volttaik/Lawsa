export type CosmeticCategory = 'badge' | 'avatar' | 'username' | 'post' | 'chat' | 'clan';
export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CosmeticDef {
  id: string;
  name: string;
  description: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  effectType: string;
  previewColor: string;
  price: number;
  isFree: boolean;
  unlockCondition?: string;
  unlockThreshold?: number;
}

export const COSMETIC_REGISTRY: Record<string, CosmeticDef> = {
  badge_diamond: {
    id: 'badge_diamond', name: 'Diamond Badge', rarity: 'legendary', category: 'badge',
    effectType: 'badge_diamond', previewColor: '#67e8f9',
    description: 'The rarest badge on the platform. Animated prismatic diamond.',
    price: 0, isFree: false,
  },
  badge_crown: {
    id: 'badge_crown', name: 'Golden Crown', rarity: 'legendary', category: 'badge',
    effectType: 'badge_crown', previewColor: '#fbbf24',
    description: 'Animated golden crown with shimmer. Reserved for royalty.',
    price: 99900, isFree: false,
  },
  badge_fire: {
    id: 'badge_fire', name: 'Inferno Badge', rarity: 'epic', category: 'badge',
    effectType: 'badge_fire', previewColor: '#f97316',
    description: 'Flickering flame badge. For the most passionate creators.',
    price: 49900, isFree: false,
  },
  badge_lightning: {
    id: 'badge_lightning', name: 'Storm Badge', rarity: 'epic', category: 'badge',
    effectType: 'badge_lightning', previewColor: '#a78bfa',
    description: 'Electrified lightning bolt that pulses with energy.',
    price: 49900, isFree: false,
  },
  badge_star: {
    id: 'badge_star', name: 'Supernova', rarity: 'rare', category: 'badge',
    effectType: 'badge_star', previewColor: '#fde68a',
    description: 'Spinning star with trailing sparkles.',
    price: 24900, isFree: false,
  },
  badge_verified_plus: {
    id: 'badge_verified_plus', name: 'Verified+', rarity: 'rare', category: 'badge',
    effectType: 'badge_verified_plus', previewColor: '#3b82f6',
    description: 'Premium animated verification badge with glow.',
    price: 19900, isFree: false,
  },
  badge_crystal: {
    id: 'badge_crystal', name: 'Crystal Shard', rarity: 'rare', category: 'badge',
    effectType: 'badge_crystal', previewColor: '#e0f2fe',
    description: 'Refracting crystal with iridescent light.',
    price: 24900, isFree: false,
  },
  badge_sovereign: {
    id: 'badge_sovereign', name: "Sovereign's Herald", rarity: 'legendary', category: 'badge',
    effectType: 'badge_sovereign', previewColor: '#a855f7',
    description: 'The rarest mark on LAWSA — a hand-crafted animated heraldic crest.',
    price: 1000000, isFree: false,
  },
  badge_lion: {
    id: 'badge_lion', name: 'Lion of LAWSA', rarity: 'legendary', category: 'badge',
    effectType: 'badge_lion', previewColor: '#fbbf24',
    description: 'The golden lion — a mark of power and prestige on LAWSA.',
    price: 100000, isFree: false,
  },
  badge_fist: {
    id: 'badge_fist', name: 'Iron Fist', rarity: 'common', category: 'badge',
    effectType: 'badge_fist', previewColor: '#b45309',
    description: 'Earned by loyalty. Awarded to those who reach 10 followers.',
    price: 0, isFree: true,
    unlockCondition: 'followers',
    unlockThreshold: 10,
  },

  avatar_ring_gold: {
    id: 'avatar_ring_gold', name: 'Gold Ring', rarity: 'rare', category: 'avatar',
    effectType: 'avatar_ring_gold', previewColor: '#fbbf24',
    description: 'Animated spinning golden ring around your avatar.',
    price: 19900, isFree: false,
  },
  avatar_ring_rainbow: {
    id: 'avatar_ring_rainbow', name: 'Rainbow Ring', rarity: 'epic', category: 'avatar',
    effectType: 'avatar_ring_rainbow', previewColor: '#8b5cf6',
    description: 'Continuously rotating rainbow gradient avatar ring.',
    price: 39900, isFree: false,
  },
  avatar_ring_fire: {
    id: 'avatar_ring_fire', name: 'Fire Ring', rarity: 'epic', category: 'avatar',
    effectType: 'avatar_ring_fire', previewColor: '#ef4444',
    description: 'Flickering fire halo around your avatar.',
    price: 39900, isFree: false,
  },
  avatar_aura_blue: {
    id: 'avatar_aura_blue', name: 'Blue Aura', rarity: 'common', category: 'avatar',
    effectType: 'avatar_aura_blue', previewColor: '#3b82f6',
    description: 'Soft pulsing blue aura glow.',
    price: 0, isFree: true,
  },
  avatar_aura_neon: {
    id: 'avatar_aura_neon', name: 'Neon Aura', rarity: 'rare', category: 'avatar',
    effectType: 'avatar_aura_neon', previewColor: '#22d3ee',
    description: 'Vivid neon cyan glow around your avatar.',
    price: 19900, isFree: false,
  },
  avatar_aura_purple: {
    id: 'avatar_aura_purple', name: 'Void Aura', rarity: 'epic', category: 'avatar',
    effectType: 'avatar_aura_purple', previewColor: '#7c3aed',
    description: 'Dark purple void aura with particle shimmer.',
    price: 29900, isFree: false,
  },

  username_gold: {
    id: 'username_gold', name: 'Gold Name', rarity: 'rare', category: 'username',
    effectType: 'username_gold', previewColor: '#fbbf24',
    description: 'Your username rendered in animated gold gradient.',
    price: 14900, isFree: false,
  },
  username_neon: {
    id: 'username_neon', name: 'Neon Name', rarity: 'rare', category: 'username',
    effectType: 'username_neon', previewColor: '#22d3ee',
    description: 'Electric neon glow on your username.',
    price: 14900, isFree: false,
  },
  username_rainbow: {
    id: 'username_rainbow', name: 'Rainbow Name', rarity: 'epic', category: 'username',
    effectType: 'username_rainbow', previewColor: '#8b5cf6',
    description: 'Animated cycling rainbow gradient on your username.',
    price: 29900, isFree: false,
  },
  username_holographic: {
    id: 'username_holographic', name: 'Holographic', rarity: 'legendary', category: 'username',
    effectType: 'username_holographic', previewColor: '#e879f9',
    description: 'Prismatic holographic shimmer effect.',
    price: 49900, isFree: false,
  },
  username_fire: {
    id: 'username_fire', name: 'Fire Name', rarity: 'epic', category: 'username',
    effectType: 'username_fire', previewColor: '#f97316',
    description: 'Your name blazes with animated fire gradient.',
    price: 24900, isFree: false,
  },

  post_border_gold: {
    id: 'post_border_gold', name: 'Gold Border', rarity: 'rare', category: 'post',
    effectType: 'post_border_gold', previewColor: '#fbbf24',
    description: 'Animated golden border on every post.',
    price: 19900, isFree: false,
  },
  post_border_neon: {
    id: 'post_border_neon', name: 'Neon Border', rarity: 'rare', category: 'post',
    effectType: 'post_border_neon', previewColor: '#22d3ee',
    description: 'Electric neon outline on your posts.',
    price: 19900, isFree: false,
  },
  post_border_rainbow: {
    id: 'post_border_rainbow', name: 'Prismatic Border', rarity: 'epic', category: 'post',
    effectType: 'post_border_rainbow', previewColor: '#8b5cf6',
    description: 'Rotating rainbow gradient border.',
    price: 34900, isFree: false,
  },
  post_glow_elite: {
    id: 'post_glow_elite', name: 'Elite Glow', rarity: 'legendary', category: 'post',
    effectType: 'post_glow_elite', previewColor: '#f59e0b',
    description: 'Cinematic golden glow card effect.',
    price: 59900, isFree: false,
  },

  chat_bubble_premium: {
    id: 'chat_bubble_premium', name: 'Premium Bubble', rarity: 'rare', category: 'chat',
    effectType: 'chat_bubble_premium', previewColor: '#6366f1',
    description: 'Your messages rendered in a premium indigo bubble.',
    price: 14900, isFree: false,
  },
  chat_bubble_neon: {
    id: 'chat_bubble_neon', name: 'Neon Bubble', rarity: 'epic', category: 'chat',
    effectType: 'chat_bubble_neon', previewColor: '#22d3ee',
    description: 'Messages with an electric neon glow.',
    price: 24900, isFree: false,
  },
};

export function getCosmeticDef(effectType: string): CosmeticDef | undefined {
  return Object.values(COSMETIC_REGISTRY).find(c => c.effectType === effectType);
}

export const RARITY_CONFIG: Record<CosmeticRarity, { label: string; color: string; glow: string }> = {
  common:    { label: 'Common',    color: '#9ca3af', glow: 'rgba(156,163,175,0.4)' },
  rare:      { label: 'Rare',      color: '#3b82f6', glow: 'rgba(59,130,246,0.5)'  },
  epic:      { label: 'Epic',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)'  },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)'  },
};
