import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getChunks, deleteChunks } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { uploadId, filename, mimeType, subfolder } = await request.json();
    if (!uploadId || !filename || !mimeType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const chunks = await getChunks(uploadId);
    if (!chunks.length) return NextResponse.json({ error: "No chunks found" }, { status: 404 });
    const buffers = chunks.map((c: any) => {
      const d = c.data;
      if (Buffer.isBuffer(d)) return d;
      if (typeof d === 'string') return Buffer.from(d, 'base64');
      if (d?.buffer) return Buffer.from(d.buffer);
      return Buffer.from(d);
    });
    const assembled = Buffer.concat(buffers);
    const url = `data:${mimeType};base64,${assembled.toString("base64")}`;
    await deleteChunks(uploadId);
    return NextResponse.json({ url });
  } catch (e: any) { console.error(e); return NextResponse.json({ error: e.message || "Assembly failed" }, { status: 500 }); }
}
