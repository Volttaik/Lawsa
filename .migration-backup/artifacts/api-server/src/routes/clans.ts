import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { getClans, getClanById, createClan, updateClan, deleteClan, getWorldChatMessages, createWorldChatMessage, getUserById, updateUser } from "../lib/queries.js";

const router = Router();

router.get("/clans", async (_req, res) => {
  try { res.json({ clans: await getClans() }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/clans", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const me = await getUserById(auth.userId);
    if (!me) return res.status(401).json({ error: "User not found" });
    const { name, description, logo } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
    const clan = await createClan({ name: name.trim(), slug, logo: logo || "", description: description || "", ownerId: me.id, ownerName: me.name });
    await updateUser(me.id, { clanId: clan!.id, clanName: clan!.name, clanLogo: clan!.logo });
    res.json({ clan });
  } catch (e) { console.error("[clans/post]", e); res.status(500).json({ error: "Failed" }); }
});

router.get("/clans/:id", async (req, res) => {
  try {
    const clan = await getClanById(req.params.id);
    if (!clan) return res.status(404).json({ error: "Clan not found" });
    const { getUsersByIds } = await import("../lib/queries.js");
    const users = await getUsersByIds(clan.members || []);
    const onlineMs = 90000;
    const members = users.map((u: any) => u ? {
      _id: u.id, name: u.name, username: u.username, profileImage: u.profileImage || "",
      isOnline: u.lastOnline ? (Date.now() - new Date(u.lastOnline).getTime()) < onlineMs : false,
    } : null).filter(Boolean);
    res.json({ clan, members });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/clans/:id/join", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const clan = await getClanById(req.params.id);
    if (!clan) return res.status(404).json({ error: "Clan not found" });
    const members: string[] = clan.members || [];
    if (!members.includes(auth.userId)) {
      members.push(auth.userId);
      await updateClan(clan.id, { members });
      await updateUser(auth.userId, { clanId: clan.id, clanName: clan.name, clanLogo: clan.logo });
    }
    res.json({ success: true, clan });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/clans/:id/leave", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const clan = await getClanById(req.params.id);
    if (!clan) return res.status(404).json({ error: "Clan not found" });
    const members = (clan.members || []).filter((id: string) => id !== auth.userId);
    await updateClan(clan.id, { members });
    await updateUser(auth.userId, { clanId: "", clanName: "", clanLogo: "" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/clans/:id", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const clan = await getClanById(req.params.id);
    if (!clan) return res.status(404).json({ error: "Clan not found" });
    if (clan.ownerId !== auth.userId) return res.status(403).json({ error: "Forbidden" });
    await deleteClan(clan.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.get("/clans/:clanId/chat", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const clan = await getClanById(req.params.clanId);
    if (!clan) return res.status(404).json({ error: "Clan not found" });
    if (!(clan.members || []).includes(auth.userId)) return res.status(403).json({ error: "Not a member" });
    const since = req.query.since as string | undefined;
    const messages = await getWorldChatMessages(req.params.clanId, since);
    const onlineMs = 90000;
    const onlineCount = await (async () => {
      try {
        const { getUsersByIds } = await import("../lib/queries.js");
        const users = await getUsersByIds(clan.members || []);
        return users.filter((u: any) => u?.lastOnline && (Date.now() - new Date(u.lastOnline).getTime()) < onlineMs).length;
      } catch { return 0; }
    })();
    res.json({ messages, onlineCount });
  } catch (e) { console.error("[clans/chat/get]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/clans/:clanId/chat", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const clan = await getClanById(req.params.clanId);
    if (!clan) return res.status(404).json({ error: "Clan not found" });
    if (!(clan.members || []).includes(auth.userId)) return res.status(403).json({ error: "Not a member" });
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content required" });
    const me = await getUserById(auth.userId);
    const msg = await createWorldChatMessage({ clanId: clan.id, senderId: auth.userId, senderName: auth.name, senderUsername: me?.username || "", senderImage: me?.profileImage || "", content: content.trim() });
    res.status(201).json({ message: msg });
  } catch (e) { console.error("[clans/chat/post]", e); res.status(500).json({ error: "Failed" }); }
});

export default router;
