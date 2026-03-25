import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Story } from "@/models/story.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await connectDB();
        const stories = await Story.find({ authorId: params.userId }).sort({ createdAt: -1 });
        return NextResponse.json({ stories: JSON.parse(JSON.stringify(stories)) });
    } catch {
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}
