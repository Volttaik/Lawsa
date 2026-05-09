import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { saveCallSignal, getCallSignals, getIncomingCall } from "../lib/queries.js";

const router = Router();

router.get("/calls/incoming", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.json({ call: null });
    const call = await getIncomingCall(auth.userId);
    res.json({ call });
  } catch { res.json({ call: null }); }
});

router.post("/calls/signal", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { sessionId, toUserId, type, payload } = req.body;
    await saveCallSignal({ sessionId, fromUserId: auth.userId, toUserId, type, payload });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.get("/calls/signals/:sessionId", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const signals = await getCallSignals(auth.userId, req.params.sessionId);
    res.json({ signals });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
