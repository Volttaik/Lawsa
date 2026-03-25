import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { WorldChatMessage, Clan } from "@/models/clan.model";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { clanId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const clan = await Clan.findById(params.clanId);
        if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
        if (!clan.members.includes(authUser.userId)) return NextResponse.json({ error: "Not a member" }, { status: 403 });

        const since = request.nextUrl.searchParams.get("since");
        const query: Record<string, any> = { clanId: params.clanId };
        if (since) query.createdAt = { $gt: new Date(since) };

        const messages = await WorldChatMessage.find(query).sort({ createdAt: 1 }).limit(100);

        const memberDetails = await User.find({ _id: { $in: clan.members } }).select("_id name username lastOnline");
        const now = Date.now();
        const onlineMembers = memberDetails
            .filter((u) => u.lastOnline && (now - new Date(u.lastOnline).getTime()) < 90000)
            .map((u) => u.name);

        return NextResponse.json({
            messages: JSON.parse(JSON.stringify(messages)),
            onlineCount: onlineMembers.length,
            onlineMembers,
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { clanId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const clan = await Clan.findById(params.clanId);
        if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
        if (!clan.members.includes(authUser.userId)) return NextResponse.json({ error: "Not a member" }, { status: 403 });

        const { content } = await request.json();
        if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

        const user = await User.findById(authUser.userId).select("username profileImage");
        const msg = await WorldChatMessage.create({
            clanId: params.clanId,
            senderId: authUser.userId,
            senderName: authUser.name,
            senderUsername: user?.username || "",
            senderImage: user?.profileImage || "",
            content: content.trim(),
        });

        return NextResponse.json({ message: JSON.parse(JSON.stringify(msg)) }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
