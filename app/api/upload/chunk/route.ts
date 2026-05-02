import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { saveChunk, countChunks } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File;
    const uploadId = formData.get("uploadId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
    const totalChunks = parseInt(formData.get("totalChunks") as string, 10);
    const filename = formData.get("filename") as string;
    const mimeType = formData.get("mimeType") as string;
    const subfolder = (formData.get("subfolder") as string) || "";
    if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await saveChunk({ uploadId, chunkIndex, totalChunks, filename, mimeType, subfolder, buffer, userId: authUser.userId });
    const receivedCount = await countChunks(uploadId);
    return NextResponse.json({ ok: true, chunkIndex, receivedCount, totalChunks, complete: receivedCount >= totalChunks });
  } catch (e: any) { console.error(e); return NextResponse.json({ error: e.message || "Chunk upload failed" }, { status: 500 }); }
}
