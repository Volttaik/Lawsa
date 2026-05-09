import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getMessages, getConversationById, markMessagesRead, getUserById } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { conversationId } = await params;
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
