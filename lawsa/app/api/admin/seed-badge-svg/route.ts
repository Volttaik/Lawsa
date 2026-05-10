import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_BACKFILL_KEY || "sossa-admin";
  if (key !== expected) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const pool = getPool();
    const svgPath = path.join(process.cwd(), "public", "badge-herald.svg");
    const svgBuffer = await readFile(svgPath);
    const base64 = svgBuffer.toString("base64");
    await pool.query(`DELETE FROM media_files WHERE filename = 'badge-herald.svg'`);
    const id = randomUUID();
    await pool.query(
      `INSERT INTO media_files (id, filename, mime_type, data, user_id) VALUES ($1, $2, $3, $4, $5)`,
      [id, "badge-herald.svg", "image/svg+xml", base64, "system"]
    );
    return NextResponse.json({ ok: true, id, sizeKB: Math.round(svgBuffer.length / 1024) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
