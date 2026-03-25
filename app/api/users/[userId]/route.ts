import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { saveBase64Image } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await connectDB();
        const user = await User.findById(params.userId).select("-password");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
    } catch {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        if (authUser.userId !== params.userId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        await connectDB();

        const body = await request.json();
        const { name, bio, skills, profileImage, bannerImage } = body;

        const updates: Record<string, any> = {};
        if (name) updates.name = name;
        if (bio !== undefined) updates.bio = bio;
        if (skills) updates.skills = skills;
        if (profileImage) {
            if (profileImage.startsWith("data:")) {
                updates.profileImage = await saveBase64Image(profileImage, "profiles");
            } else {
                updates.profileImage = profileImage;
            }
        }
        if (bannerImage) {
            if (bannerImage.startsWith("data:")) {
                updates.bannerImage = await saveBase64Image(bannerImage, "banners");
            } else {
                updates.bannerImage = bannerImage;
            }
        }

        const user = await User.findByIdAndUpdate(params.userId, updates, { new: true }).select("-password");
        return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
