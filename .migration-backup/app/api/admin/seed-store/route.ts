import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const BADGES = [
  { effectType: "badge_crown",         name: "Golden Crown",      description: "The classic mark of royalty. A gleaming golden crown for the bold.",                price: 100000, previewColor: "#fbbf24" },
  { effectType: "badge_fire",          name: "Inferno",           description: "Burning bright — this fiery badge signals unstoppable energy.",                      price: 100000, previewColor: "#f97316" },
  { effectType: "badge_lightning",     name: "Storm",             description: "Charged with electricity. Strike fast, strike first.",                               price: 100000, previewColor: "#a78bfa" },
  { effectType: "badge_star",          name: "Supernova",         description: "You are the star. A spinning celestial badge that commands attention.",              price: 100000, previewColor: "#facc15" },
  { effectType: "badge_verified_plus", name: "Verified+",         description: "The premium verification mark. Stand out from the crowd.",                          price: 150000, previewColor: "#60a5fa" },
  { effectType: "badge_crystal",       name: "Crystal",           description: "Clear as glass, rare as gemstone. A refracting crystal hexagon.",                   price: 150000, previewColor: "#38bdf8" },
  { effectType: "badge_amethyst",      name: "Amethyst",          description: "A deep purple gemstone badge framed in gold. Rare and regal.",                      price: 200000, previewColor: "#a855f7" },
  { effectType: "badge_phoenix",       name: "Phoenix",           description: "Rise from the ashes. An orange flame-forged heraldic shield.",                      price: 200000, previewColor: "#f97316" },
  { effectType: "badge_dragon",        name: "Dragon",            description: "The ancient beast. Gold-framed with glowing dragon eyes.",                          price: 250000, previewColor: "#e879f9" },
  { effectType: "badge_royal",         name: "Royal",             description: "Wings of purple and a crown of gold. True royalty.",                                price: 250000, previewColor: "#8b5cf6" },
  { effectType: "badge_warrior",       name: "Warrior",           description: "Forged in battle. Silver wings, spike crown, and a ruby core.",                     price: 200000, previewColor: "#ef4444" },
  { effectType: "badge_azure",         name: "Azure",             description: "Sky blue wings with a glittering gem cross. Light and power combined.",             price: 200000, previewColor: "#38bdf8" },
  { effectType: "badge_inferno",       name: "Inferno Flame",     description: "A towering flame badge with a bright white-hot core.",                              price: 150000, previewColor: "#fb923c" },
  { effectType: "badge_frost",         name: "Frost",             description: "A snowflake crystal badge, cool and pristine.",                                     price: 150000, previewColor: "#7dd3fc" },
  { effectType: "badge_storm",         name: "Thunderstorm",      description: "Storm clouds with a crackling bolt. Lightning never strikes twice — except here.",  price: 200000, previewColor: "#a78bfa" },
  { effectType: "badge_tidal",         name: "Tidal",             description: "Ocean waves held inside a gold shield. Deep and powerful.",                         price: 200000, previewColor: "#0ea5e9" },
  { effectType: "badge_earth",         name: "Earth",             description: "An emerald gemstone crowned in gold. Grounded and fierce.",                         price: 200000, previewColor: "#22c55e" },
  { effectType: "badge_galaxy",        name: "Galaxy",            description: "Swirling cosmos in a badge. You contain multitudes.",                               price: 250000, previewColor: "#818cf8" },
  { effectType: "badge_nova",          name: "Nova",              description: "A stellar explosion of colour. Bright, brilliant, rare.",                           price: 250000, previewColor: "#f472b6" },
  { effectType: "badge_solar",         name: "Solar",             description: "The power of the sun captured in gold and flame.",                                  price: 250000, previewColor: "#fbbf24" },
  { effectType: "badge_lunar",         name: "Lunar",             description: "Moonlit silver and soft glow. Quiet but unmistakable.",                             price: 200000, previewColor: "#e2e8f0" },
  { effectType: "badge_void",          name: "Void",              description: "A dark circle with glowing purple rays. The abyss stares back.",                   price: 300000, previewColor: "#7c3aed" },
  { effectType: "badge_shadow",        name: "Shadow",            description: "Silver frame, dark soul. A masked badge for the mysterious.",                       price: 250000, previewColor: "#94a3b8" },
  { effectType: "badge_demon",         name: "Demon",             description: "Horns, glowing red eyes, and fangs. Not for the faint-hearted.",                   price: 300000, previewColor: "#dc2626" },
  { effectType: "badge_skull",         name: "Skull",             description: "Silver shield, crowned skull. Wear it with pride.",                                 price: 250000, previewColor: "#e2e8f0" },
  { effectType: "badge_angel",         name: "Angel",             description: "Golden halo, white wings, divine gem. Pure and radiant.",                          price: 250000, previewColor: "#fbbf24" },
  { effectType: "badge_divine",        name: "Divine",            description: "A spinning golden star with a blazing white core. Heaven-touched.",                 price: 350000, previewColor: "#fbbf24" },
  { effectType: "badge_tech",          name: "Tech",              description: "A gold hexagon with cyan circuit nodes. Engineered for the elite.",                 price: 200000, previewColor: "#22d3ee" },
  { effectType: "badge_neon",          name: "Neon",              description: "Glowing cyan frame with a pulsing neon core. Future is now.",                      price: 200000, previewColor: "#22d3ee" },
  { effectType: "badge_matrix",        name: "Matrix",            description: "Green code raining inside a dark box. You see what others can't.",                  price: 200000, previewColor: "#22c55e" },
  { effectType: "badge_gold",          name: "Gold Elite",        description: "Full gold crest with a crown spike and radiant gem. The pinnacle.",                 price: 400000, previewColor: "#fbbf24" },
  { effectType: "badge_ruby",          name: "Ruby",              description: "A crimson multifacet gem in a gold crown frame. Precious and fierce.",              price: 350000, previewColor: "#f87171" },
  { effectType: "badge_obsidian",      name: "Obsidian",          description: "Black glass with a purple gem core. Rare, dark, and coveted.",                     price: 350000, previewColor: "#7c3aed" },
  { effectType: "badge_wind",          name: "Wind",              description: "Flowing emerald wind curls that shimmer with life.",                                price: 150000, previewColor: "#34d399" },
  { effectType: "badge_cosmic",        name: "Cosmic",            description: "Every colour of the universe spinning in one badge.",                               price: 400000, previewColor: "#818cf8" },
  { effectType: "badge_crystal_herald", name: "Crystal Herald",  description: "The rarest badge — a crystal herald gem of extraordinary clarity.",                 price: 500000, previewColor: "#67e8f9" },
];

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_BACKFILL_KEY || "sossa-admin";
  if (key !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pool = getPool();
  const report = { inserted: 0, skipped: 0, errors: 0 };

  for (const badge of BADGES) {
    try {
      const existing = await pool.query(
        `SELECT id FROM store_items WHERE effect_type = $1`,
        [badge.effectType]
      );
      if (existing.rows.length > 0) {
        report.skipped++;
        continue;
      }
      await pool.query(
        `INSERT INTO store_items (id, name, description, category, effect_type, effect_data, price, is_free, unlock_condition, unlock_threshold, preview_color, icon)
         VALUES ($1, $2, $3, 'badge', $4, '{}', $5, false, 'always', 0, $6, 'badge')`,
        [randomUUID(), badge.name, badge.description, badge.effectType, badge.price, badge.previewColor]
      );
      report.inserted++;
    } catch (e: any) {
      console.error(`[seed-store] Failed to insert ${badge.effectType}:`, e.message);
      report.errors++;
    }
  }

  return NextResponse.json({ ok: true, report });
}
