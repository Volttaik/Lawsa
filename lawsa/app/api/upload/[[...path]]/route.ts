import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { saveMediaFile, saveChunk, countChunks, getChunks, deleteChunks } from "@/lib/queries";

export const dynamic = "force-dynamic";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/avi"];

function isVideo(mimeType: string) {
  return VIDEO_TYPES.includes(mimeType) || mimeType.startsWith("video/");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const action = path[0];

  if (!action || action === "") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded"))
        return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || "application/octet-stream";

      const fileId = await saveMediaFile({ buffer, mimeType, filename: file.name, userId: authUser.userId });
      return NextResponse.json({ url: `/api/files/${fileId}` });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
    }
  }

  if (action === "chunk") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded"))
        return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
      const formData = await request.formData();
      const chunk = formData.get("chunk") as File;
      const uploadId = formData.get("uploadId") as string;
      const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
      const totalChunks = parseInt(formData.get("totalChunks") as string, 10);
      const filename = formData.get("filename") as string;
      const mimeType = formData.get("mimeType") as string;
      const subfolder = (formData.get("subfolder") as string) || "";
      if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks))
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      const buffer = Buffer.from(await chunk.arrayBuffer());
      await saveChunk({ uploadId, chunkIndex, totalChunks, filename, mimeType, subfolder, buffer, userId: authUser.userId });
      const receivedCount = await countChunks(uploadId);
      return NextResponse.json({ ok: true, chunkIndex, receivedCount, totalChunks, complete: receivedCount >= totalChunks });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json({ error: e.message || "Chunk upload failed" }, { status: 500 });
    }
  }

  if (action === "assemble") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { uploadId, filename, mimeType, subfolder } = await request.json();
      if (!uploadId || !filename || !mimeType)
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      const chunks = await getChunks(uploadId);
      if (!chunks.length) return NextResponse.json({ error: "No chunks found" }, { status: 404 });
      const buffers = chunks.map((c: any) => {
        const d = c.data;
        if (Buffer.isBuffer(d)) return d;
        if (typeof d === "string") return Buffer.from(d, "base64");
        if (d?.buffer) return Buffer.from(d.buffer);
        return Buffer.from(d);
      });
      const assembled = Buffer.concat(buffers);
      await deleteChunks(uploadId);

      const fileId = await saveMediaFile({ buffer: assembled, mimeType, filename, userId: authUser.userId });
      return NextResponse.json({ url: `/api/files/${fileId}` });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json({ error: e.message || "Assembly failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
