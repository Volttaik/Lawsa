import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getClanById, getWorldChatMessages, createWorldChatMessage, getUserById } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ clanId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { clanId } = await params;
    const clan = await getClanById(clanId);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    if (!(clan.members || []).includes(authUser.userId)) return NextResponse.json({ error: "Not a member" }, { status: 403 });
    const since = request.nextUrl.searchParams.get("since") || undefined;
    const messages = await getWorldChatMessages(clanId, since);
    const onlineMembers: string[] = [];
    for (const id of clan.members || []) {
      const u = await getUserById(id);
      if (u?.lastOnline && (Date.now() - new Date(u.lastOnline).getTime()) < 90000) onlineMembers.push(u.name);
    }
    return NextResponse.json({ messages, onlineCount: onlineMembers.length, onlineMembers });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ clanId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { clanId } = await params;
    const clan = await getClanById(clanId);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    if (!(clan.members || []).includes(authUser.userId)) return NextResponse.json({ error: "Not a member" }, { status: 403 });
    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
    const me = await getUserById(authUser.userId);
    const msg = await createWorldChatMessage({ clanId, senderId: authUser.userId, senderName: authUser.name, senderUsername: me?.username || "", senderImage: me?.profileImage || "", content: content.trim() });
    if (!msg) return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
