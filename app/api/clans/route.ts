import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getClans, createClan, getClanBySlug, updateUser, getUserById } from "@/lib/queries";
import { saveBase64Media } from "@/lib/upload";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const clans = await getClans();
    return NextResponse.json({ clans });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { name, description, logo } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Clan name required" }, { status: 400 });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await getClanBySlug(slug);
    if (existing) return NextResponse.json({ error: "Clan name taken" }, { status: 409 });
    let savedLogo = "";
    if (logo?.startsWith("data:")) savedLogo = await saveBase64Media(logo, "clans");
    const clan = await createClan({ name: name.trim(), slug, description: description?.trim() || "", logo: savedLogo, ownerId: authUser.userId, ownerName: authUser.name });
    if (!clan) return NextResponse.json({ error: "Failed to create clan" }, { status: 500 });
    await updateUser(authUser.userId, { clanId: clan._id, clanName: clan.name, clanLogo: savedLogo });
    return NextResponse.json({ clan }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
