import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getClanById, deleteClan, getUserById, updateUser } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ clanId: string }> }) {
  try {
    const { clanId } = await params;
    const clan = await getClanById(clanId);
    if (!clan) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const memberDetails = await Promise.all((clan.members || []).map(async (id: string) => {
      const u = await getUserById(id);
      if (!u) return null;
      const { password: _pw, ...safe } = u as any;
      return { ...safe, isOnline: u.lastOnline ? (Date.now() - new Date(u.lastOnline).getTime()) < 90000 : false };
    }));
    return NextResponse.json({ clan, members: memberDetails.filter(Boolean) });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ clanId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { clanId } = await params;
    const clan = await getClanById(clanId);
    if (!clan) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (clan.ownerId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    for (const memberId of clan.members || []) await updateUser(memberId, { clanId: "", clanName: "", clanLogo: "" });
    await deleteClan(clanId);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
