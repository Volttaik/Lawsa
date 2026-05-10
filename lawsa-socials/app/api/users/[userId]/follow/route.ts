import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { toggleFollow, getUserById, createNotification } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { userId } = await params;
    if (authUser.userId === userId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    const result = await toggleFollow(authUser.userId, userId);
    if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (result.following) {
      const me = await getUserById(authUser.userId);
      await createNotification({ recipientId: userId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "follow", message: `${authUser.name} started following you` });
    }
    return NextResponse.json(result);
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
