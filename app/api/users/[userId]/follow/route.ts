import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { Notification } from "@/models/notification.model";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        if (authUser.userId === params.userId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        await connectDB();

        const [currentUser, targetUser] = await Promise.all([
            User.findById(authUser.userId),
            User.findById(params.userId),
        ]);
        if (!currentUser || !targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isFollowing = currentUser.following?.includes(params.userId);
        if (isFollowing) {
            currentUser.following = currentUser.following?.filter((id) => id !== params.userId);
            targetUser.followers = targetUser.followers?.filter((id) => id !== authUser.userId);
        } else {
            currentUser.following?.push(params.userId);
            targetUser.followers?.push(authUser.userId);
            await Notification.create({
                recipientId: params.userId,
                senderId: authUser.userId,
                senderName: authUser.name,
                senderImage: currentUser.profileImage || "",
                type: "follow",
                message: `${authUser.name} started following you`,
            });
        }

        await Promise.all([currentUser.save(), targetUser.save()]);
        return NextResponse.json({ following: !isFollowing });
    } catch (error) {
        return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
    }
}
