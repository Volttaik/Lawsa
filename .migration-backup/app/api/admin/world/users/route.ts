import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { mapUser } from "@/lib/queries";

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
      `SELECT *, 
        (SELECT COUNT(*) FROM posts WHERE author_id = users.id)::int AS posts_count,
        array_length(followers::jsonb::text[], 1) AS followers_count,
        array_length(following::jsonb::text[], 1) AS following_count
       FROM users 
       WHERE name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [q, limit, offset]
    );
    rows = result.rows;
  } else {
    const result = await pool.query(
      `SELECT *, 
        (SELECT COUNT(*) FROM posts WHERE author_id = users.id)::int AS posts_count
       FROM users 
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    rows = result.rows;
  }

  const countResult = await pool.query(
    search
      ? `SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1`
      : `SELECT COUNT(*) FROM users`,
    search ? [`%${search}%`] : []
  );

  return NextResponse.json({
    users: rows.map(mapUser),
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  });
}
