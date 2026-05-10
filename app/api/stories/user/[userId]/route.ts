import { NextRequest, NextResponse } from "next/server";
import { getStoriesByUser } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const stories = await getStoriesByUser(userId);
    return NextResponse.json({ stories });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
