import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  getConversationsByUser, getUserById, getUsersByIds,
  findConversationByParticipants, createConversation, createMessage,
  updateConversation, createNotification, countUnreadMessages,
  getMessages, getConversationById, markMessagesRead,
  getMessageById, updateMessage, reactToMessage, updateTypingUsers,
} from "@/lib/queries";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // GET /api/messages (conversations list)
  if (!seg0) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const conversations = await getConversationsByUser(authUser.userId);
      const otherIds = conversations.map((c: any) => c.participants.find((p: string) => p !== authUser.userId)).filter(Boolean) as string[];
      const otherUsers = await getUsersByIds(otherIds);
      const userMap: Record<string, any> = {};
      for (const u of otherUsers) { if (u) userMap[u._id] = u; }
      const enriched = conversations.map((conv: any) => {
        const otherId = conv.participants.find((p: string) => p !== authUser.userId);
        const other = otherId ? userMap[otherId] : null;
        const { password: _pw, ...otherSafe } = (other || {}) as any;
        return { ...conv, otherUser: other ? otherSafe : null };
      });
      return NextResponse.json({ conversations: enriched });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // GET /api/messages/count
  if (seg0 === "count") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ count: 0 });
      const count = await countUnreadMessages(authUser.userId);
      return NextResponse.json({ count });
    } catch { return NextResponse.json({ count: 0 }); }
  }

  // GET /api/messages/calls/incoming
  if (seg0 === "calls" && seg1 === "incoming") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ call: null });
      const since = new Date(Date.now() - 30_000).toISOString();
      const pool = getPool();
      const { rows } = await pool.query(
        `SELECT * FROM call_signals WHERE to_user_id = $1 AND type = 'call-invite' AND created_at > $2 ORDER BY created_at DESC LIMIT 1`,
        [authUser.userId, since]
      );
      if (!rows.length) return NextResponse.json({ call: null });
      const invite = rows[0];
      const { rows: hangups } = await pool.query(
        `SELECT id FROM call_signals WHERE session_id = $1 AND type IN ('hangup','decline') LIMIT 1`,
        [invite.session_id]
      );
      if (hangups.length > 0) return NextResponse.json({ call: null });
      return NextResponse.json({ call: { sessionId: invite.session_id, callerId: invite.from_user_id, callerName: invite.payload?.callerName || "Someone", callerImage: invite.payload?.callerImage || "", callType: invite.payload?.callType || "video" } });
    } catch { return NextResponse.json({ call: null }); }
  }

  // GET /api/messages/calls/signal
  if (seg0 === "calls" && seg1 === "signal") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get("sessionId");
      const since = searchParams.get("since") || new Date(0).toISOString();
      const types = searchParams.get("types");
      const pool = getPool();
      let sql = `SELECT * FROM call_signals WHERE to_user_id = $1 AND created_at > $2`;
      const qParams: any[] = [authUser.userId, since];
      if (sessionId) { sql += ` AND session_id = $${qParams.length + 1}`; qParams.push(sessionId); }
      if (types) { const list = types.split(","); sql += ` AND type = ANY($${qParams.length + 1}::text[])`; qParams.push(list); }
      sql += ` ORDER BY created_at ASC LIMIT 50`;
      const { rows } = await pool.query(sql, qParams);
      return NextResponse.json({ signals: rows });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  const conversationId = seg0;

  // GET /api/messages/[conversationId]/stream (SSE)
  if (seg1 === "stream") {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return new Response("Not authenticated", { status: 401 });
    const conv = await getConversationById(conversationId);
    if (!conv || !conv.participants.includes(authUser.userId)) return new Response("Not found", { status: 404 });
    const otherId = conv.participants.find((p: string) => p !== authUser.userId);
    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
        };
        try {
          await markMessagesRead(conversationId, authUser.userId);
          const [messages, other, freshConv] = await Promise.all([getMessages(conversationId), otherId ? getUserById(otherId) : Promise.resolve(null), getConversationById(conversationId)]);
          const otherUserOnline = !!other?.lastOnline && (Date.now() - new Date(other.lastOnline).getTime()) < 90000;
          const typingExpiry = otherId ? (freshConv?.typingUsers || {})[otherId] : null;
          const otherUserTyping = !!(typingExpiry && new Date(typingExpiry).getTime() > Date.now());
          send({ type: "snapshot", messages, otherUserOnline, otherUserTyping });
        } catch (e) { send({ type: "error", message: "Failed to load messages" }); }
        let tickCount = 0;
        const timer = setInterval(async () => {
          if (closed) { clearInterval(timer); return; }
          tickCount++;
          try {
            const shouldRefreshUser = tickCount % 5 === 0;
            const [_, messages, freshConv, other] = await Promise.all([markMessagesRead(conversationId, authUser.userId), getMessages(conversationId), getConversationById(conversationId), shouldRefreshUser && otherId ? getUserById(otherId) : Promise.resolve(null)]);
            const isOnline = other ? !!other.lastOnline && (Date.now() - new Date(other.lastOnline).getTime()) < 90000 : undefined;
            const typingExpiry = otherId ? (freshConv?.typingUsers || {})[otherId] : null;
            const isTyping = !!(typingExpiry && new Date(typingExpiry).getTime() > Date.now());
            const payload: any = { type: "update", messages, otherUserTyping: isTyping };
            if (isOnline !== undefined) payload.otherUserOnline = isOnline;
            send(payload);
          } catch {}
        }, 5000);
        const keepAlive = setInterval(() => {
          if (!closed) { try { controller.enqueue(encoder.encode(`: keep-alive\n\n`)); } catch {} }
        }, 20000);
        request.signal.addEventListener("abort", () => {
          closed = true; clearInterval(timer); clearInterval(keepAlive);
          try { controller.close(); } catch {}
        });
      },
      cancel() { closed = true; },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Accel-Buffering": "no" } });
  }

  // GET /api/messages/[conversationId]
  if (!seg1) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const [messages, conv] = await Promise.all([getMessages(conversationId), getConversationById(conversationId)]);
      await markMessagesRead(conversationId, authUser.userId);
      let otherUserOnline = false, otherUserLastOnline: string | null = null, otherUserTyping = false;
      if (conv) {
        const otherId = conv.participants.find((p: string) => p !== authUser.userId);
        if (otherId) {
          const other = await getUserById(otherId);
          if (other?.lastOnline) {
            otherUserLastOnline = other.lastOnline;
            otherUserOnline = (Date.now() - new Date(other.lastOnline).getTime()) < 90000;
          }
          const typingUsers = conv.typingUsers || {};
          const expiry = typingUsers[otherId];
          if (expiry && new Date(expiry).getTime() > Date.now()) otherUserTyping = true;
        }
      }
      return NextResponse.json({ messages, otherUserOnline, otherUserLastOnline, otherUserTyping });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // POST /api/messages (send message)
  if (!seg0) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { recipientId, content, mediaUrl, mediaData, mediaType, replyToId, replyToContent, replyToSender } = await request.json();
      if (!recipientId || (!content?.trim() && !mediaUrl && !mediaData))
        return NextResponse.json({ error: "Recipient and content required" }, { status: 400 });
      const recipient = await getUserById(recipientId);
      if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
      const me = await getUserById(authUser.userId);
      const participants = [authUser.userId, recipientId].sort();
      const existingConv = await findConversationByParticipants(participants);
      if (!existingConv) {
        const canMessage = !!me && !!recipient && (me.following || []).includes(recipientId) && (recipient.following || []).includes(authUser.userId);
        if (!canMessage) return NextResponse.json({ error: "You can only message mutual followers" }, { status: 403 });
      }
      const savedMediaUrl = mediaUrl || mediaData || "";
      const lastMsg = content?.trim() || (mediaType === "image" ? "📷 Photo" : mediaType === "video" ? "🎥 Video" : mediaType === "audio" ? "🎤 Voice note" : "📎 File");
      let conv = existingConv;
      if (!conv) conv = await createConversation(participants);
      else await updateConversation(conv._id, { lastMessage: lastMsg, lastMessageTime: new Date() });
      if (!conv) return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      const msg = await createMessage({ conversationId: conv._id, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", receiverId: recipientId, content: content?.trim() || "", mediaUrl: savedMediaUrl, mediaType: savedMediaUrl ? (mediaType || "file") : "", replyToId: replyToId || null, replyToContent: replyToContent || "", replyToSender: replyToSender || "" });
      if (!msg) return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
      await updateConversation(conv._id, { lastMessage: lastMsg, lastMessageTime: new Date() });
      await createNotification({ recipientId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "message", message: `${authUser.name} sent you a message` });
      return NextResponse.json({ message: msg, conversationId: conv._id }, { status: 201 });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/messages/calls/signal
  if (seg0 === "calls" && seg1 === "signal") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { sessionId, toUserId, type, payload } = await request.json();
      if (!sessionId || !toUserId || !type) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      const pool = getPool();
      await pool.query(
        `INSERT INTO call_signals (id, session_id, from_user_id, to_user_id, type, payload) VALUES ($1,$2,$3,$4,$5,$6)`,
        [randomUUID(), sessionId, authUser.userId, toUserId, type, JSON.stringify(payload || {})]
      );
      return NextResponse.json({ ok: true });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/messages/[conversationId]/typing
  if (seg1 === "typing") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ ok: false });
      await updateTypingUsers(seg0, authUser.userId);
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // PATCH /api/messages/message/[messageId]
  if (seg0 === "message" && seg1) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const body = await request.json();
      const msg = await getMessageById(seg1);
      if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (msg.senderId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (body.emoji) {
        const updated = await reactToMessage(seg1, authUser.userId, body.emoji);
        return NextResponse.json({ message: updated });
      }
      if (!body.content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
      const updated = await updateMessage(seg1, { content: body.content.trim(), edited: true });
      return NextResponse.json({ message: updated });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // DELETE /api/messages/message/[messageId]
  if (seg0 === "message" && seg1) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const msg = await getMessageById(seg1);
      if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (msg.senderId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const updated = await updateMessage(seg1, { isDeleted: true, content: "", mediaUrl: "", mediaType: "" });
      return NextResponse.json({ success: true, message: updated });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
