import { NextRequest, NextResponse } from "next/server";
import { getFollowingEvents, getUserById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    // Primary: social_events table (enriched with targetName, targetImage, followedAt)
    const events = await getFollowingEvents(userId);

    if (events.length > 0) {
      const enriched = await Promise.all(
        events.map(async (e) => {
          const user = await getUserById(e!.targetId);
          if (!user) {
            return {
              _id: e!.targetId, id: e!.targetId,
              name: e!.metadata?.targetName || '',
              username: e!.metadata?.targetUsername || '',
              profileImage: '',
              followedAt: e!.createdAt,
              eventId: e!._id,
            };
          }
          const { password: _pw, ...safe } = user as any;
          return { ...safe, followedAt: e!.createdAt, eventId: e!._id };
        })
      );
      return NextResponse.json({ users: enriched.filter(Boolean) });
    }

    // Fallback: array-based (covers data predating social_events)
    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const followingIds: string[] = user.following || [];
    const following = await Promise.all(followingIds.map((id) => getUserById(id)));
    const result = following.filter(Boolean).map((u) => {
      const { password: _pw, ...safe } = u as any;
      return safe;
    });
    return NextResponse.json({ users: result });
  } catch (e) {
    console.error("[/api/users/[userId]/following]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
