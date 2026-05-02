import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const posts = await getPosts({ authorId: userId }, 0, 50);
    return NextResponse.json({ posts });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
