import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Clan } from "@/models/clan.model";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { clanId: string } }) {
    try {
        await connectDB();
        const clan = await Clan.findById(params.clanId);
        if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });

        const memberDetails = await User.find({ _id: { $in: clan.members } })
            .select("_id name username profileImage lastOnline clanId");

        const now = Date.now();
        const members = memberDetails.map((u) => ({
            ...JSON.parse(JSON.stringify(u)),
            isOnline: u.lastOnline ? (now - new Date(u.lastOnline).getTime()) < 90000 : false,
        }));

        return NextResponse.json({ clan: JSON.parse(JSON.stringify(clan)), members });
    } catch {
        return NextResponse.json({ error: "Failed to fetch clan" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { clanId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const clan = await Clan.findById(params.clanId);
        if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
        if (clan.ownerId !== authUser.userId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        await User.updateMany({ clanId: params.clanId }, { clanId: "", clanName: "", clanLogo: "" });
        await clan.deleteOne();
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete clan" }, { status: 500 });
    }
}
