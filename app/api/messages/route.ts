import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getConversationsByUser, getUserById, getUsersByIds, findConversationByParticipants, createConversation, createMessage, updateConversation, createNotification } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const conversations = await getConversationsByUser(authUser.userId);
    // Batch-load all other users in ONE query instead of N sequential getUserById calls
    const otherIds = conversations
      .map((c: any) => c.participants.find((p: string) => p !== authUser.userId))
      .filter(Boolean) as string[];
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
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { recipientId, content, mediaUrl, mediaData, mediaType, replyToId, replyToContent, replyToSender } = await request.json();
    if (!recipientId || (!content?.trim() && !mediaUrl && !mediaData)) return NextResponse.json({ error: "Recipient and content required" }, { status: 400 });
    const recipient = await getUserById(recipientId);
    if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    const me = await getUserById(authUser.userId);
    const participants = [authUser.userId, recipientId].sort();
    // Check if a conversation already exists — if so, always allow continuing it
    const existingConv = await findConversationByParticipants(participants);
    if (!existingConv) {
      // Only require mutual follow to START a brand-new conversation
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
