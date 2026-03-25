import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Clan } from "@/models/clan.model";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { clanId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const clan = await Clan.findById(params.clanId);
        if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });

        const user = await User.findById(authUser.userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isLeaving = clan.members.includes(authUser.userId);

        if (isLeaving) {
            if (clan.ownerId === authUser.userId && clan.members.length > 1) {
                return NextResponse.json({ error: "Transfer ownership before leaving" }, { status: 400 });
            }
            clan.members = clan.members.filter((m: string) => m !== authUser.userId);
            await clan.save();
            await User.findByIdAndUpdate(authUser.userId, { clanId: "", clanName: "", clanLogo: "" });
            if (clan.members.length === 0) await clan.deleteOne();
            return NextResponse.json({ joined: false });
        } else {
            if (user.clanId) return NextResponse.json({ error: "Leave your current clan first" }, { status: 400 });
            clan.members.push(authUser.userId);
            await clan.save();
            await User.findByIdAndUpdate(authUser.userId, {
                clanId: clan._id.toString(),
                clanName: clan.name,
                clanLogo: clan.logo || "",
            });
            return NextResponse.json({ joined: true });
        }
    } catch {
        return NextResponse.json({ error: "Failed to update clan membership" }, { status: 500 });
    }
}
