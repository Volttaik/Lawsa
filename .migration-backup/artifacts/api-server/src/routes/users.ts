import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { getUserById, updateUser, searchUsers, getNotifications } from "../lib/queries.js";

const router = Router();

router.get("/users/search", async (req, res) => {
  try {
    const { q = "", limit = "20" } = req.query as any;
    const users = await searchUsers(q, parseInt(limit));
    const safe = users.map((u: any) => { if (!u) return null; const { password, ...rest } = u; return rest; }).filter(Boolean);
    res.json({ users: safe });
  } catch (e) { res.status(500).json({ error: "Search failed" }); }
});

router.get("/users/suggestions", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    const { query: q } = req.query as any;
    const { query: dbQuery } = await import("../lib/db.js");
    let rows;
    if (q) {
      const like = `%${q.toLowerCase()}%`;
      rows = await dbQuery("SELECT * FROM users WHERE LOWER(name) LIKE $1 OR LOWER(username) LIKE $1 LIMIT 20", [like]);
    } else {
      rows = await dbQuery("SELECT * FROM users ORDER BY followers_count DESC LIMIT 20", []);
    }
    const { mapUser } = await import("../lib/queries.js");
    const users = rows.map(mapUser).filter((u: any) => u && (!auth || u.id !== auth.userId));
    const safe = users.map((u: any) => { const { password, ...rest } = u; return rest; });
    res.json({ users: safe });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/users/heartbeat", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    await updateUser(auth.userId, { lastOnline: new Date().toISOString() });
    res.json({ success: true });
  } catch { res.json({ success: true }); }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user as any;
    res.json({ user: safe });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.put("/users/:id", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    if (auth.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
    const allowed = ["name", "bio", "phone", "dateOfBirth", "headline", "website", "location", "skills", "experience", "education", "profileImage", "bannerImage"];
    const updates: any = {};
    for (const k of allowed) { if (req.body[k] !== undefined) updates[k] = req.body[k]; }
    const updated = await updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = updated as any;
    res.json({ user: safe });
  } catch (e) { console.error("[updateUser]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/users/:id/follow", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const target = await getUserById(req.params.id);
    const me = await getUserById(auth.userId);
    if (!target || !me || target.id === me.id) return res.status(400).json({ error: "Invalid" });
    const isFollowing = (me.following || []).includes(target.id);
    if (isFollowing) {
      await updateUser(me.id, { following: me.following.filter((id: string) => id !== target.id), followingCount: Math.max((me.followingCount || 1) - 1, 0) });
      await updateUser(target.id, { followers: (target.followers || []).filter((id: string) => id !== me.id), followersCount: Math.max((target.followersCount || 1) - 1, 0) });
      res.json({ following: false });
    } else {
      await updateUser(me.id, { following: [...(me.following || []), target.id], followingCount: (me.followingCount || 0) + 1 });
      await updateUser(target.id, { followers: [...(target.followers || []), me.id], followersCount: (target.followersCount || 0) + 1 });
      res.json({ following: true });
    }
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
