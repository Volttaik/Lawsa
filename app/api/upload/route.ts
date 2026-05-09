import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    return NextResponse.json({ url });
  } catch (e: any) { console.error(e); return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 }); }
}
