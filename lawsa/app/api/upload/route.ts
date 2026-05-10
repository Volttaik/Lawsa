import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { saveMediaFile } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await saveMediaFile({ buffer, mimeType: file.type || "application/octet-stream", filename: file.name, userId: authUser.userId });
    return NextResponse.json({ url: `/api/files/${fileId}` });
  } catch (e: any) { console.error(e); return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 }); }
}
