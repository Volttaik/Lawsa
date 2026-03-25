import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ users: [] }, { status: 401 });
        await connectDB();

        const me = await User.findById(authUser.userId).select("following followers");
        const followingIds: string[] = me?.following || [];
        const followerIds: string[] = me?.followers || [];

        const exclude = [authUser.userId, ...followingIds];

        const users = await User.find({
            _id: { $nin: exclude },
        })
            .select("-password")
            .sort({ followers: -1 })
            .limit(6);

        const scored = users.map((u) => {
            const uid = u._id.toString();
            let score = (u.followers?.length || 0) * 2;
            if (followerIds.includes(uid)) score += 10;
            return { user: JSON.parse(JSON.stringify(u)), score };
        });

        scored.sort((a, b) => b.score - a.score);

        return NextResponse.json({ users: scored.slice(0, 5).map((s) => s.user) });
    } catch {
        return NextResponse.json({ users: [] }, { status: 500 });
    }
}
