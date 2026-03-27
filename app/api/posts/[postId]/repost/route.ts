import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const original = await Post.findById(params.postId).lean() as any;
  if (!original) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (original.repostedFrom?._id) {
    return NextResponse.json({ error: "Cannot repost a repost" }, { status: 400 });
  }

  const me = await User.findById(authUser.userId).select("name username profileImage");
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await Post.findOne({
    authorId: authUser.userId,
    "repostedFrom._id": original._id.toString(),
  });

  if (existing) {
    await Post.deleteOne({ _id: existing._id });
    await Post.updateOne({ _id: original._id }, { $inc: { reshares: -1 } });
    return NextResponse.json({ reposted: false, reshares: Math.max(0, (original.reshares || 1) - 1) });
  }

  await Post.create({
    authorId: authUser.userId,
    authorName: me.name,
    authorUsername: me.username,
    authorImage: me.profileImage || "",
    content: "",
    category: original.category || "general",
    repostedFrom: {
      _id: original._id.toString(),
      authorName: original.authorName,
      authorUsername: original.authorUsername,
      authorImage: original.authorImage || "",
      content: original.content,
      images: original.images || [],
    },
  });

  await Post.updateOne({ _id: original._id }, { $inc: { reshares: 1 } });

  return NextResponse.json({ reposted: true, reshares: (original.reshares || 0) + 1 });
}
