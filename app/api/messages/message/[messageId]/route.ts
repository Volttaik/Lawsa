import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getMessageById, updateMessage, reactToMessage } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { messageId } = await params;
    const body = await request.json();
    const msg = await getMessageById(messageId);
    if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (msg.senderId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (body.emoji) {
      const updated = await reactToMessage(messageId, authUser.userId, body.emoji);
      return NextResponse.json({ message: updated });
    }
    if (!body.content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
    const updated = await updateMessage(messageId, { content: body.content.trim(), edited: true });
    return NextResponse.json({ message: updated });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { messageId } = await params;
    const msg = await getMessageById(messageId);
    if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (msg.senderId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await updateMessage(messageId, { isDeleted: true, content: "", mediaUrl: "", mediaType: "" });
    return NextResponse.json({ success: true, message: updated });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
