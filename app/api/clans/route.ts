import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Clan } from "@/models/clan.model";
import { User } from "@/models/user.model";
import { saveBase64Image } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        const clans = await Clan.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ clans: JSON.parse(JSON.stringify(clans)) });
    } catch {
        return NextResponse.json({ error: "Failed to fetch clans" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();

        const { name, description, logo } = await request.json();
        if (!name?.trim()) return NextResponse.json({ error: "Clan name is required" }, { status: 400 });

        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const existing = await Clan.findOne({ slug });
        if (existing) return NextResponse.json({ error: "A clan with this name already exists" }, { status: 409 });

        let savedLogo = "";
        if (logo && logo.startsWith("data:")) {
            savedLogo = await saveBase64Image(logo, "clans");
        }

        const clan = await Clan.create({
            name: name.trim(),
            slug,
            description: description?.trim() || "",
            logo: savedLogo,
            ownerId: authUser.userId,
            ownerName: authUser.name,
            members: [authUser.userId],
        });

        await User.findByIdAndUpdate(authUser.userId, {
            clanId: clan._id.toString(),
            clanName: clan.name,
            clanLogo: savedLogo,
        });

        return NextResponse.json({ clan: JSON.parse(JSON.stringify(clan)) }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create clan" }, { status: 500 });
    }
}
