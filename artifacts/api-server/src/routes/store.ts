import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { getStoreItems, getUserStoreItems, grantStoreItem, equipStoreItem, savePayment } from "../lib/queries.js";

const router = Router();

router.get("/store", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    const items = await getStoreItems();
    let userItemMap = new Map<string, any>();
    if (auth) {
      const userItems = await getUserStoreItems(auth.userId);
      userItemMap = new Map(userItems.map((ui: any) => [ui.item_id, ui]));
    }
    const enriched = items.map((item: any) => ({
      id: item.id, name: item.name, description: item.description,
      category: item.category, effectType: item.effect_type, effectData: item.effect_data || {},
      price: item.price, isFree: item.is_free,
      unlockCondition: item.unlock_condition, unlockThreshold: item.unlock_threshold,
      previewColor: item.preview_color || "#3b82f6", icon: item.icon || "",
      owned: userItemMap.has(item.id),
      equipped: userItemMap.get(item.id)?.equipped || false,
    }));
    res.json({ items: enriched });
  } catch (e) { console.error("[store/get]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/store/purchase", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId required" });
    const items = await getStoreItems();
    const item = items.find((i: any) => i.id === itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.is_free) {
      await grantStoreItem(auth.userId, itemId);
      return res.json({ success: true });
    }
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return res.status(400).json({ error: "Payment not configured" });
    const reference = `lawsa-${itemId}-${auth.userId}-${Date.now()}`;
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${paystackKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: auth.email || `${auth.userId}@lawsa.app`, amount: item.price, reference, metadata: { itemId, userId: auth.userId } }),
    });
    const paystackData = await paystackRes.json() as any;
    if (paystackData.status) res.json({ authorization_url: paystackData.data.authorization_url, reference });
    else res.status(400).json({ error: "Payment initialization failed" });
  } catch (e) { console.error("[store/purchase]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/store/verify-payment", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: "Reference required" });
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return res.status(400).json({ error: "Payment not configured" });
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const data = await verifyRes.json() as any;
    if (data.data?.status === "success") {
      const { itemId, userId } = data.data.metadata || {};
      if (itemId && userId === auth.userId) {
        await grantStoreItem(userId, itemId);
        await savePayment({ userId, planId: itemId, reference, amount: data.data.amount, status: "success" });
        res.json({ success: true });
      } else res.status(400).json({ error: "Metadata mismatch" });
    } else res.status(400).json({ error: "Payment not verified" });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/store/equip", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { itemId, equipped } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId required" });
    await equipStoreItem(auth.userId, itemId, !!equipped);
    res.json({ success: true, equipped: !!equipped });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
