import { NextRequest, NextResponse } from "next/server";
import { getFollowerEvents, getUserById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    // Primary: social_events table (enriched with actorName, actorImage, followedAt)
    const events = await getFollowerEvents(userId);

    if (events.length > 0) {
      const enriched = await Promise.all(
        events.map(async (e) => {
          const user = await getUserById(e!.actorId);
          if (!user) {
            return {
              _id: e!.actorId, id: e!.actorId,
              name: e!.actorName, username: e!.actorUsername,
              profileImage: e!.actorImage,
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
    const followerIds: string[] = user.followers || [];
    const followers = await Promise.all(followerIds.map((id) => getUserById(id)));
    const result = followers.filter(Boolean).map((u) => {
      const { password: _pw, ...safe } = u as any;
      return safe;
    });
    return NextResponse.json({ users: result });
  } catch (e) {
    console.error("[/api/users/[userId]/followers]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
