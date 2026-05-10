import { NextRequest, NextResponse } from "next/server";
import { getMediaFile } from "@/lib/queries";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    const file = await getMediaFile(fileId);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const buffer = Buffer.from(file.data, "base64");
    const mime: Record<string, string> = {
      "image/jpeg": "image/jpeg", "image/png": "image/png", "image/gif": "image/gif",
      "image/webp": "image/webp", "video/mp4": "video/mp4", "video/webm": "video/webm",
      "video/ogg": "video/ogg", "audio/mpeg": "audio/mpeg", "audio/wav": "audio/wav",
      "audio/ogg": "audio/ogg",
    };
    const contentType = mime[file.mime_type] || file.mime_type || "application/octet-stream";
    const isVideo = contentType.startsWith("video/");
    const total = buffer.length;

    const rangeHeader = req.headers.get("range");
    if (isVideo && rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : Math.min(start + 2 * 1024 * 1024 - 1, total - 1);
        const chunkSize = end - start + 1;
        const chunk = buffer.slice(start, end + 1);
        return new NextResponse(chunk, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Cache-Control": "public, max-age=31536000",
          },
        });
      }
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(total),
        "Accept-Ranges": isVideo ? "bytes" : "none",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
