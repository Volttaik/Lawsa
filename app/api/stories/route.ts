import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getStories, createStory, getUserById } from "@/lib/queries";
import { saveBase64Media } from "@/lib/upload";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const stories = await getStories();
    const grouped: Record<string, any> = {};
    for (const s of stories) {
      if (!grouped[s.authorId]) grouped[s.authorId] = { authorId: s.authorId, authorName: s.authorName, authorUsername: s.authorUsername, authorImage: s.authorImage || "", stories: [] };
      grouped[s.authorId].stories.push(s);
    }
    return NextResponse.json({ groups: Object.values(grouped) });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { content, image } = await request.json();
    if (!content?.trim() && !image) return NextResponse.json({ error: "Content or image required" }, { status: 400 });
    const me = await getUserById(authUser.userId);
    let savedImage = "";
    if (image?.startsWith("data:")) savedImage = await saveBase64Media(image, "stories");
    const story = await createStory({ authorId: authUser.userId, authorName: authUser.name, authorUsername: authUser.username, authorImage: me?.profileImage || "", content: content?.trim() || "", image: savedImage });
    return NextResponse.json({ story }, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
