import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { getConversationsByUser, getConversationBetween, createConversation, getMessagesByConversation, createMessage, markMessagesRead, updateMessage, reactToMessage, getUnreadMessageCount, getUserById, updateConversation } from "../lib/queries.js";

const router = Router();

router.get("/messages/count", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.json({ count: 0 });
    const count = await getUnreadMessageCount(auth.userId);
    res.json({ count });
  } catch { res.json({ count: 0 }); }
});

router.get("/messages/conversations", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const conversations = await getConversationsByUser(auth.userId);
    res.json({ conversations });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.get("/messages/conversations/:convId", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { limit = "50", offset = "0" } = req.query as any;
    const messages = await getMessagesByConversation(req.params.convId, parseInt(limit), parseInt(offset));
    await markMessagesRead(req.params.convId, auth.userId);
    res.json({ messages });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/messages/conversations/:convId/messages", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const me = await getUserById(auth.userId);
    if (!me) return res.status(401).json({ error: "User not found" });
    const { content, mediaUrl, mediaType, replyToId, replyToContent, replyToSender } = req.body;
    if (!content?.trim() && !mediaUrl) return res.status(400).json({ error: "Content required" });
    const { query: dbQuery } = await import("../lib/db.js");
    const rows = await dbQuery("SELECT * FROM conversations WHERE id = $1", [req.params.convId]);
    if (!rows[0]) return res.status(404).json({ error: "Conversation not found" });
    const participants: string[] = rows[0].participants || [];
    const receiverId = participants.find(id => id !== auth.userId) || "";
    const message = await createMessage({ conversationId: req.params.convId, senderId: me.id, senderName: me.name, senderImage: me.profileImage || "", receiverId, content: content?.trim() || "", mediaUrl: mediaUrl || "", mediaType: mediaType || "", replyToId, replyToContent, replyToSender });
    res.json({ message });
  } catch (e) { console.error("[messages/send]", e); res.status(500).json({ error: "Failed" }); }
});

router.get("/messages/with/:userId", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    let conv = await getConversationBetween(auth.userId, req.params.userId);
    if (!conv) conv = await createConversation([auth.userId, req.params.userId]);
    const messages = await getMessagesByConversation(conv!.id, 50, 0);
    await markMessagesRead(conv!.id, auth.userId);
    res.json({ conversation: conv, messages });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/messages/with/:userId", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const me = await getUserById(auth.userId);
    if (!me) return res.status(401).json({ error: "User not found" });
    const { content, mediaUrl, mediaType, replyToId, replyToContent, replyToSender } = req.body;
    if (!content?.trim() && !mediaUrl) return res.status(400).json({ error: "Content required" });
    let conv = await getConversationBetween(auth.userId, req.params.userId);
    if (!conv) conv = await createConversation([auth.userId, req.params.userId]);
    const message = await createMessage({ conversationId: conv!.id, senderId: me.id, senderName: me.name, senderImage: me.profileImage || "", receiverId: req.params.userId, content: content?.trim() || "", mediaUrl: mediaUrl || "", mediaType: mediaType || "", replyToId, replyToContent, replyToSender });
    res.json({ message, conversation: conv });
  } catch (e) { console.error("[messages/with/post]", e); res.status(500).json({ error: "Failed" }); }
});

router.put("/messages/:id", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { query: dbQuery } = await import("../lib/db.js");
    const rows = await dbQuery("SELECT * FROM messages WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    if (rows[0].sender_id !== auth.userId) return res.status(403).json({ error: "Forbidden" });
    const updated = await updateMessage(req.params.id, { content: req.body.content, edited: true });
    res.json({ message: updated });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { query: dbQuery } = await import("../lib/db.js");
    const rows = await dbQuery("SELECT * FROM messages WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    if (rows[0].sender_id !== auth.userId) return res.status(403).json({ error: "Forbidden" });
    await updateMessage(req.params.id, { isDeleted: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/messages/:id/react", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: "Emoji required" });
    const updated = await reactToMessage(req.params.id, auth.userId, emoji);
    res.json({ message: updated });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/messages/typing/:convId", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.json({ success: true });
    const { query: dbQuery } = await import("../lib/db.js");
    const rows = await dbQuery("SELECT typing_users FROM conversations WHERE id = $1", [req.params.convId]);
    if (!rows[0]) return res.json({ success: true });
    const typingUsers: any = rows[0].typing_users || {};
    typingUsers[auth.userId] = new Date(Date.now() + 3500).toISOString();
    await updateConversation(req.params.convId, { typingUsers });
    res.json({ success: true });
  } catch { res.json({ success: true }); }
});

export default router;
