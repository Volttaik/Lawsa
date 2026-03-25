import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Story } from "@/models/story.model";
import { User } from "@/models/user.model";
import { saveBase64Image } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const stories = await Story.find({}).sort({ createdAt: -1 }).limit(100);
        const grouped: Record<string, { authorId: string; authorName: string; authorUsername: string; authorImage: string; stories: any[] }> = {};
        for (const s of stories) {
            if (!grouped[s.authorId]) {
                grouped[s.authorId] = {
                    authorId: s.authorId,
                    authorName: s.authorName,
                    authorUsername: s.authorUsername,
                    authorImage: s.authorImage || "",
                    stories: [],
                };
            }
            grouped[s.authorId].stories.push(JSON.parse(JSON.stringify(s)));
        }
        return NextResponse.json({ groups: Object.values(grouped) });
    } catch {
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const { content, image } = await request.json();
        if (!content?.trim() && !image) return NextResponse.json({ error: "Content or image required" }, { status: 400 });

        const user = await User.findById(authUser.userId).select("username profileImage");
        let savedImage = "";
        if (image && image.startsWith("data:")) {
            savedImage = await saveBase64Image(image, "stories");
        }

        const story = await Story.create({
            authorId: authUser.userId,
            authorName: authUser.name,
            authorUsername: user?.username || "",
            authorImage: user?.profileImage || "",
            content: content?.trim() || "",
            image: savedImage,
        });
        return NextResponse.json({ story: JSON.parse(JSON.stringify(story)) }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
    }
}
