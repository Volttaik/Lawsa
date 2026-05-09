import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { getNotifications, getUnreadNotifCount, markNotificationsRead } from "../lib/queries.js";

const router = Router();

router.get("/notifications", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { offset = "0", limit = "30" } = req.query as any;
    const notifications = await getNotifications(auth.userId, parseInt(offset), parseInt(limit));
    res.json({ notifications });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.get("/notifications/count", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.json({ count: 0 });
    const count = await getUnreadNotifCount(auth.userId);
    res.json({ count });
  } catch { res.json({ count: 0 }); }
});

router.post("/notifications/read", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    await markNotificationsRead(auth.userId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
