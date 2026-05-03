import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password: _pw, ...safe } = user as any;
    return NextResponse.json({ user: safe });
  } catch { return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 }); }
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { userId } = await params;
    if (authUser.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const updates: any = {};
    if (body.name) updates.name = body.name;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.headline !== undefined) updates.headline = body.headline;
    if (body.website !== undefined) updates.website = body.website;
    if (body.location !== undefined) updates.location = body.location;
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.experience !== undefined) updates.experience = body.experience;
    if (body.education !== undefined) updates.education = body.education;
    if (body.profileImage) updates.profileImage = body.profileImage;
    if (body.bannerImage) updates.bannerImage = body.bannerImage;
    const updated = await updateUser(userId, updates);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password: _pw, ...safe } = updated as any;
    return NextResponse.json({ user: safe });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed to update user" }, { status: 500 }); }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  return PUT(request, { params });
}
