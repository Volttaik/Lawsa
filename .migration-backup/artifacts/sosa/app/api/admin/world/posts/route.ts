import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { mapPost } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "onyeaghorlouis@gmail.com";

async function requireAdmin(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth || auth.email.toLowerCase() !== ADMIN_EMAIL) return null;
  return auth;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const pool = getPool();
  let rows;

  if (search) {
    const q = `%${search}%`;
    const result = await pool.query(
      `SELECT p.*, u.is_verified AS author_is_verified, u.email_verified AS author_email_verified, u.email AS author_email
       FROM posts p LEFT JOIN users u ON u.id = p.author_id
       WHERE p.content ILIKE $1 OR p.author_name ILIKE $1 OR p.author_username ILIKE $1
       ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [q, limit, offset]
    );
    rows = result.rows;
  } else {
    const result = await pool.query(
      `SELECT p.*, u.is_verified AS author_is_verified, u.email_verified AS author_email_verified, u.email AS author_email
       FROM posts p LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    rows = result.rows;
  }

  const countResult = await pool.query(
    search
      ? `SELECT COUNT(*) FROM posts WHERE content ILIKE $1 OR author_name ILIKE $1 OR author_username ILIKE $1`
      : `SELECT COUNT(*) FROM posts`,
    search ? [`%${search}%`] : []
  );

  return NextResponse.json({
    posts: rows.map(mapPost),
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  });
}
