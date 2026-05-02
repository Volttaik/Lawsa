import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    const filePath = path.join(process.cwd(), "public", "uploads", fileId);
    const buffer = await readFile(filePath);
    const ext = fileId.split(".").pop()?.toLowerCase() || "";
    const mime: Record<string,string> = { jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",gif:"image/gif",webp:"image/webp",mp4:"video/mp4",webm:"video/webm",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",pdf:"application/pdf" };
    return new NextResponse(buffer, { headers: { "Content-Type": mime[ext] || "application/octet-stream", "Cache-Control": "public, max-age=31536000" } });
  } catch { return NextResponse.json({ error: "File not found" }, { status: 404 }); }
}
