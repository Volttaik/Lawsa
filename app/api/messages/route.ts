import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getConversationsByUser, getUserById, findConversationByParticipants, createConversation, createMessage, updateConversation, createNotification } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const conversations = await getConversationsByUser(authUser.userId);
    const enriched = await Promise.all(conversations.map(async (conv: any) => {
      const otherId = conv.participants.find((p: string) => p !== authUser.userId);
      const other = otherId ? await getUserById(otherId) : null;
      const otherSafe = other ? (({ password: _pw, ...u }) => u)(other as any) : null;
      return { ...conv, otherUser: otherSafe };
    }));
    return NextResponse.json({ conversations: enriched });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { recipientId, content, mediaUrl, mediaData, mediaType, replyToId, replyToContent, replyToSender } = await request.json();
    if (!recipientId || (!content?.trim() && !mediaUrl && !mediaData)) return NextResponse.json({ error: "Recipient and content required" }, { status: 400 });
    const participants = [authUser.userId, recipientId].sort();
    const savedMediaUrl = mediaUrl || mediaData || "";
    const lastMsg = content?.trim() || (mediaType === "image" ? "📷 Photo" : mediaType === "video" ? "🎥 Video" : mediaType === "audio" ? "🎤 Voice note" : "📎 File");
    let conv = await findConversationByParticipants(participants);
    if (!conv) conv = await createConversation(participants);
    else await updateConversation(conv._id, { lastMessage: lastMsg, lastMessageTime: new Date() });
    if (!conv) return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    const me = await getUserById(authUser.userId);
    const msg = await createMessage({ conversationId: conv._id, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", receiverId: recipientId, content: content?.trim() || "", mediaUrl: savedMediaUrl, mediaType: savedMediaUrl ? (mediaType || "file") : "", replyToId: replyToId || null, replyToContent: replyToContent || "", replyToSender: replyToSender || "" });
    if (!msg) return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    await updateConversation(conv._id, { lastMessage: lastMsg, lastMessageTime: new Date() });
    await createNotification({ recipientId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "message", message: `${authUser.name} sent you a message` });
    return NextResponse.json({ message: msg, conversationId: conv._id }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
