import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getClanById, updateClan, updateUser, getUserById } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, { params }: { params: Promise<{ clanId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { clanId } = await params;
    const [clan, user] = await Promise.all([getClanById(clanId), getUserById(authUser.userId)]);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const isLeaving = (clan.members || []).includes(authUser.userId);
    if (isLeaving) {
      if (clan.ownerId === authUser.userId && (clan.members || []).length > 1) return NextResponse.json({ error: "Transfer ownership first" }, { status: 400 });
      const newMembers = clan.members.filter((m: string) => m !== authUser.userId);
      await updateClan(clanId, { members: newMembers });
      await updateUser(authUser.userId, { clanId: "", clanName: "", clanLogo: "" });
      if (!newMembers.length) { const { deleteClan } = await import("@/lib/queries"); await deleteClan(clanId); }
      return NextResponse.json({ joined: false });
    } else {
      if (user.clanId) return NextResponse.json({ error: "Leave current clan first" }, { status: 400 });
      await updateClan(clanId, { members: [...(clan.members || []), authUser.userId] });
      await updateUser(authUser.userId, { clanId, clanName: clan.name, clanLogo: clan.logo || "" });
      return NextResponse.json({ joined: true });
    }
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
