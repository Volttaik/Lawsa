import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { query, queryOne } from "../lib/db.js";
import { randomUUID } from "crypto";

const router = Router();

router.get("/stickers", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    let ownedPackIds: string[] = [];
    if (auth) {
      const owned = await query("SELECT pack_id FROM user_sticker_packs WHERE user_id = $1", [auth.userId]).catch(() => []);
      ownedPackIds = owned.map((r: any) => r.pack_id);
    }
    const packs = await query("SELECT * FROM sticker_packs ORDER BY is_free DESC, created_at ASC", []).catch(() => []);
    const enriched = await Promise.all(packs.map(async (pack: any) => {
      const stickers = await query("SELECT * FROM stickers WHERE pack_id = $1 ORDER BY created_at ASC", [pack.id]).catch(() => []);
      return {
        id: pack.id, name: pack.name, description: pack.description || "",
        emoji: pack.emoji || "", isFree: pack.is_free, price: pack.price || 0,
        owned: pack.is_free || ownedPackIds.includes(pack.id),
        stickers: stickers.map((s: any) => ({ id: s.id, packId: s.pack_id, name: s.name || "", value: s.value, isAnimated: !!s.is_animated })),
      };
    }));
    res.json({ packs: enriched });
  } catch (e) { console.error("[stickers]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/stickers/purchase", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { packId } = req.body;
    if (!packId) return res.status(400).json({ error: "packId required" });
    const pack = await queryOne("SELECT * FROM sticker_packs WHERE id = $1", [packId]).catch(() => null);
    if (!pack) return res.status(404).json({ error: "Pack not found" });
    if (pack.is_free) {
      await query("INSERT INTO user_sticker_packs (id,user_id,pack_id,created_at) VALUES ($1,$2,$3,NOW()) ON CONFLICT DO NOTHING", [randomUUID(), auth.userId, packId]).catch(() => {});
      return res.json({ success: true });
    }
    res.json({ error: "Payment required" });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
