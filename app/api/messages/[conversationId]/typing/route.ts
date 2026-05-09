import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateTypingUsers } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ ok: false });
    const { conversationId } = await params;
    await updateTypingUsers(conversationId, authUser.userId);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }); }
}
