import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest) {
  try {
    const pool = getPool();
    const r = await pool.query(`SELECT data FROM media_files WHERE filename = 'badge-herald.svg' ORDER BY created_at DESC LIMIT 1`);
    if (!r.rows.length) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    const svg = Buffer.from(r.rows[0].data, "base64").toString("utf-8");
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
