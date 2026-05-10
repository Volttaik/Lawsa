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

export async function PUT(request: NextRequest, { params }: { params: { postId: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const pool = getPool();

  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  if (body.content !== undefined) { sets.push(`content = $${i++}`); vals.push(body.content); }
  if (body.category !== undefined) { sets.push(`category = $${i++}`); vals.push(body.category); }

  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  sets.push(`updated_at = NOW()`);
  vals.push(params.postId);

  const { rows } = await pool.query(
    `UPDATE posts SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    vals
  );

  return NextResponse.json({ post: mapPost(rows[0]) });
}

export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pool = getPool();
  await pool.query(`DELETE FROM comments WHERE post_id = $1`, [params.postId]);
  await pool.query(`DELETE FROM notifications WHERE post_id = $1`, [params.postId]);
  await pool.query(`DELETE FROM posts WHERE id = $1`, [params.postId]);

  return NextResponse.json({ success: true });
}
