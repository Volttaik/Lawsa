import { NextRequest, NextResponse } from "next/server";
import { getMediaFile } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    const file = await getMediaFile(fileId);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
    const buffer = Buffer.from(file.data, 'base64');
    const mime: Record<string, string> = {
      "image/jpeg": "image/jpeg", "image/png": "image/png", "image/gif": "image/gif",
      "image/webp": "image/webp", "video/mp4": "video/mp4", "video/webm": "video/webm",
      "audio/mpeg": "audio/mpeg", "audio/wav": "audio/wav", "audio/ogg": "audio/ogg",
    };
    const contentType = mime[file.mime_type] || file.mime_type || "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (e: any) { console.error(e); return NextResponse.json({ error: "File not found" }, { status: 404 }); }
}
