-- ── STORE ITEMS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'badge',
  effect_type TEXT NOT NULL,
  effect_data JSONB DEFAULT '{}',
  price INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  unlock_condition TEXT DEFAULT '',
  unlock_threshold INTEGER DEFAULT 0,
  preview_color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '⭐',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER STORE ITEMS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_store_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  equipped BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ── STICKER PACKS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sticker_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '🎭',
  is_free BOOLEAN DEFAULT TRUE,
  price INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── STICKERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stickers (
  id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  is_animated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER STICKER PACKS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sticker_packs (
  user_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, pack_id)
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_store_items_user ON user_store_items(user_id);
CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers(pack_id);

-- ── SEED STORE ITEMS ──────────────────────────────────────────────────────────
INSERT INTO store_items (id, name, description, category, effect_type, effect_data, price, is_free, unlock_condition, unlock_threshold, preview_color, icon)
VALUES
  ('golden_post_banner','Golden Post Banner','Your posts shine with a gold glowing border','post','golden_border','{"borderColor":"#f59e0b","glow":"0 0 12px #f59e0b"}',50000,false,'',0,'#f59e0b','✨'),
  ('username_reflection','Username Reflection Effect','Your username shimmers with a reflective light effect','username','reflection','{"effect":"reflect"}',80000,false,'',0,'#a78bfa','💫'),
  ('diamond_avatar_ring','Diamond Avatar Ring','A sparkling diamond ring frames your profile picture','avatar','diamond_ring','{"ring":"diamond","color":"#e0f2fe"}',60000,false,'',0,'#7dd3fc','💎'),
  ('purple_galaxy_aura','Purple Galaxy Aura','A deep purple cosmic glow surrounds your profile','avatar','aura','{"color":"#7c3aed","opacity":0.6}',70000,false,'',0,'#7c3aed','🌌'),
  ('neon_username_glow','Neon Username Glow','Your username glows neon under your posts','username','neon_glow','{"color":"#00ff9f"}',50000,false,'',0,'#00ff9f','⚡'),
  ('rainbow_gradient_name','Rainbow Gradient Name','Your display name appears as a rainbow gradient','username','gradient','{"gradient":"linear-gradient(90deg,#f00,#f90,#ff0,#0f0,#00f,#90f)"}',60000,false,'',0,'#ec4899','🌈'),
  ('fire_avatar_border','Fire Avatar Border','Animated fire ring burns around your avatar','avatar','fire_border','{"animation":"fire","color":"#ef4444"}',70000,false,'',0,'#ef4444','🔥'),
  ('ice_crown_badge','Ice Crown Badge','A frosty ice crown sits beside your username','badge','badge_icon','{"icon":"🧊👑","label":"Ice Crown"}',50000,false,'',0,'#bae6fd','❄️'),
  ('lightning_badge','Lightning Strike Badge','A bold lightning bolt badge marks your profile','badge','badge_icon','{"icon":"⚡","label":"Storm"}',40000,false,'',0,'#fde047','⚡'),
  ('star_aura_frame','Star Aura Frame','Tiny stars orbit around your avatar','avatar','star_orbit','{"count":8,"color":"#fbbf24"}',60000,false,'',0,'#fbbf24','⭐'),
  ('holographic_nameplate','Holographic Name Plate','Your name shimmers with a holographic oil-slick effect','username','holographic','{"effect":"holo","rainbow":true}',90000,false,'',0,'#f0abfc','🌟'),
  ('cosmic_profile_bg','Cosmic Background','A deep-space background appears on your profile','profile','bg_image','{"bg":"cosmic","stars":true}',80000,false,'',0,'#1e1b4b','🪐'),
  ('emerald_crown','Emerald Crown','A jewelled emerald crown badge next to your name','badge','badge_icon','{"icon":"👑","color":"#10b981","label":"Emerald"}',70000,false,'',0,'#10b981','👑'),
  ('ruby_badge','Ruby Gem Badge','A deep red ruby gem badge on your profile','badge','badge_icon','{"icon":"💎","color":"#ef4444","label":"Ruby"}',60000,false,'',0,'#ef4444','💎'),
  ('sapphire_glow','Sapphire Glow Effect','Your profile radiates a calming blue sapphire glow','avatar','aura','{"color":"#3b82f6","opacity":0.5}',70000,false,'',0,'#3b82f6','🔵'),
  ('dark_matter_aura','Dark Matter Aura','A swirling dark energy cloud surrounds your avatar','avatar','aura','{"color":"#1f2937","opacity":0.8,"swirl":true}',90000,false,'',0,'#374151','🌑'),
  ('phoenix_badge','Phoenix Wings Badge','A majestic phoenix wings icon beside your name','badge','badge_icon','{"icon":"🦅","label":"Phoenix","color":"#f97316"}',80000,false,'',0,'#f97316','🦅'),
  ('ocean_frame','Ocean Wave Frame','Gentle ocean waves animate around your avatar','avatar','animated_frame','{"animation":"wave","color":"#0ea5e9"}',60000,false,'',0,'#0ea5e9','🌊'),
  ('storm_caller_badge','Storm Caller Badge','A lightning storm badge that crackles with energy','badge','badge_icon','{"icon":"⛈️","label":"Storm Caller"}',70000,false,'',0,'#6366f1','⛈️'),
  ('night_owl_badge','Night Owl Badge','For the ones who rule the night — owl badge','badge','badge_icon','{"icon":"🦉","label":"Night Owl"}',40000,false,'',0,'#4c1d95','🦉'),
  ('trending_creator','Trending Creator Badge','Mark yourself as a Trending Creator on Sosa','badge','badge_icon','{"icon":"🔥","label":"Trending","color":"#f59e0b"}',100000,false,'',0,'#f59e0b','🔥'),
  ('elite_tag','Elite Member Tag','The exclusive Elite Member tag for top creators','badge','badge_icon','{"icon":"⭐","label":"Elite","color":"#eab308"}',120000,false,'',0,'#eab308','⭐'),
  ('vip_banner','VIP Access Banner','A stunning VIP banner sits on top of your profile','profile','banner_badge','{"badge":"VIP","color":"#7c3aed","style":"gradient"}',150000,false,'',0,'#7c3aed','👑'),
  ('exclusive_frame','Exclusive Frame','A rare, limited-edition frame around your avatar','avatar','exclusive_frame','{"pattern":"exclusive","rarity":"rare"}',100000,false,'',0,'#a16207','🖼️'),
  ('gold_trophy','Gold Trophy','Display a shining gold trophy next to your name','badge','badge_icon','{"icon":"🏆","label":"Champion","color":"#ca8a04"}',80000,false,'',0,'#ca8a04','🏆'),
  ('shadow_aura','Shadow Aura','A mysterious dark shadow ring surrounds your avatar','avatar','aura','{"color":"#000","blur":12,"opacity":0.9}',90000,false,'',0,'#111827','👤'),
  ('collectors_badge','Collector''s Edition Badge','A limited Collector''s Edition badge for your profile','badge','badge_icon','{"icon":"🎖️","label":"Collector","color":"#78716c"}',60000,false,'',0,'#78716c','🎖️'),
  ('rose_gold_ring','Rose Gold Ring','An elegant rose gold ring around your avatar','avatar','ring','{"color":"#f9a8d4","style":"rose_gold"}',70000,false,'',0,'#f9a8d4','💗'),
  ('pioneer_badge','Pioneer Badge','Awarded to the first 100 Sosa users — legendary','badge','badge_icon','{"icon":"🚀","label":"Pioneer","color":"#6366f1"}',0,true,'first_100',100,'#6366f1','🚀'),
  ('bronze_shield','Bronze Shield','Unlocked when you reach 10 followers','badge','badge_icon','{"icon":"🛡️","label":"Shield","color":"#a16207"}',0,true,'followers',10,'#a16207','🛡️'),
  ('community_legend','Community Legend','Unlocked when your posts receive 100 total likes','badge','badge_icon','{"icon":"🌟","label":"Legend","color":"#7c3aed"}',0,true,'total_likes',100,'#7c3aed','🌟'),
  ('early_bird_tag','Early Bird Tag','Free for all early Sosa members — welcome!','badge','badge_icon','{"icon":"🐦","label":"Early Bird","color":"#10b981"}',0,true,'always',0,'#10b981','🐦')
ON CONFLICT (id) DO NOTHING;

-- ── SEED STICKER PACKS ────────────────────────────────────────────────────────
INSERT INTO sticker_packs (id, name, description, emoji, is_free, price)
VALUES
  ('sosa_basics','Sosa Basics','The essential Sosa sticker pack — free for everyone','🎭',true,0),
  ('vibe_check','Vibe Check','Level up your chats with these cool vibe stickers','🔮',false,30000),
  ('legends_only','Legends Only','Premium pack for the realest ones on Sosa','👑',false,50000)
ON CONFLICT (id) DO NOTHING;

-- ── SEED STICKERS ─────────────────────────────────────────────────────────────
INSERT INTO stickers (id, pack_id, name, value, is_animated)
VALUES
  ('s_basics_01','sosa_basics','Wave','👋',false),
  ('s_basics_02','sosa_basics','Fire','🔥',false),
  ('s_basics_03','sosa_basics','Heart','❤️',false),
  ('s_basics_04','sosa_basics','Laugh','😂',false),
  ('s_basics_05','sosa_basics','Mind Blown','🤯',false),
  ('s_basics_06','sosa_basics','Cool','😎',false),
  ('s_basics_07','sosa_basics','Fist','👊',false),
  ('s_basics_08','sosa_basics','Party','🎉',false),
  ('s_basics_09','sosa_basics','Pray','🙏',false),
  ('s_basics_10','sosa_basics','Strong','💪',false),
  ('s_basics_11','sosa_basics','Cry','😭',false),
  ('s_basics_12','sosa_basics','Cap','🧢',false),
  ('s_basics_13','sosa_basics','Correct','✅',false),
  ('s_basics_14','sosa_basics','Drooling','🤤',false),
  ('s_basics_15','sosa_basics','Shush','🤫',false),
  ('s_basics_16','sosa_basics','Wave','🌊',false),
  ('s_basics_17','sosa_basics','100','💯',false),
  ('s_basics_18','sosa_basics','Target','🎯',false),
  ('s_basics_19','sosa_basics','Butterfly','🦋',false),
  ('s_basics_20','sosa_basics','Lightning','⚡',false),
  ('s_vibe_01','vibe_check','Frozen','🥶',true),
  ('s_vibe_02','vibe_check','Crystal Ball','🔮',true),
  ('s_vibe_03','vibe_check','Diamond','💎',true),
  ('s_vibe_04','vibe_check','Moon','🌙',true),
  ('s_vibe_05','vibe_check','Star','⭐',true),
  ('s_vibe_06','vibe_check','Mask','🎭',true),
  ('s_vibe_07','vibe_check','Rainbow','🌈',true),
  ('s_vibe_08','vibe_check','Unicorn','🦄',true),
  ('s_vibe_09','vibe_check','Music','🎵',true),
  ('s_vibe_10','vibe_check','Guitar','🎸',true),
  ('s_vibe_11','vibe_check','Flower','🌺',true),
  ('s_vibe_12','vibe_check','Clover','🍀',true),
  ('s_vibe_13','vibe_check','Fox','🦊',true),
  ('s_vibe_14','vibe_check','Circus','🎪',true),
  ('s_vibe_15','vibe_check','Leaf','🍃',true),
  ('s_leg_01','legends_only','Crown','👑',true),
  ('s_leg_02','legends_only','Trophy','🏆',true),
  ('s_leg_03','legends_only','Money','💰',true),
  ('s_leg_04','legends_only','Medal','🎖️',true),
  ('s_leg_05','legends_only','Shield','🛡️',true),
  ('s_leg_06','legends_only','Sword','⚔️',true),
  ('s_leg_07','legends_only','Trident','🔱',true),
  ('s_leg_08','legends_only','Sparkles','💫',true),
  ('s_leg_09','legends_only','Star','🌟',true),
  ('s_leg_10','legends_only','Glitter','✨',true),
  ('s_leg_11','legends_only','Confetti','🎊',true),
  ('s_leg_12','legends_only','Gold Medal','🥇',true),
  ('s_leg_13','legends_only','Explosion','💥',true),
  ('s_leg_14','legends_only','Rocket','🚀',true),
  ('s_leg_15','legends_only','UFO','🛸',true)
ON CONFLICT (id) DO NOTHING;
