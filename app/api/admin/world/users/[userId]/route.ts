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

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pool = getPool();
  const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [params.userId]);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const postsResult = await pool.query(
    `SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [params.userId]
  );

  return NextResponse.json({ user: mapUser(rows[0]), posts: postsResult.rows });
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const pool = getPool();

  const allowed = [
    "name", "username", "email", "bio", "headline", "website",
    "location", "phone", "is_verified", "is_boosted", "premium_theme",
    "email_verified", "ban", "profile_image", "banner_image",
  ];

  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;

  if (body.name !== undefined)          { sets.push(`name = $${i++}`);           vals.push(body.name); }
  if (body.username !== undefined)      { sets.push(`username = $${i++}`);       vals.push(body.username); }
  if (body.email !== undefined)         { sets.push(`email = $${i++}`);          vals.push(body.email); }
  if (body.bio !== undefined)           { sets.push(`bio = $${i++}`);            vals.push(body.bio); }
  if (body.headline !== undefined)      { sets.push(`headline = $${i++}`);       vals.push(body.headline); }
  if (body.website !== undefined)       { sets.push(`website = $${i++}`);        vals.push(body.website); }
  if (body.location !== undefined)      { sets.push(`location = $${i++}`);       vals.push(body.location); }
  if (body.phone !== undefined)         { sets.push(`phone = $${i++}`);          vals.push(body.phone); }
  if (body.isVerified !== undefined)    { sets.push(`is_verified = $${i++}`);    vals.push(body.isVerified); }
  if (body.isBoosted !== undefined)     { sets.push(`is_boosted = $${i++}`);     vals.push(body.isBoosted); }
  if (body.premiumTheme !== undefined)  { sets.push(`premium_theme = $${i++}`);  vals.push(body.premiumTheme); }
  if (body.emailVerified !== undefined) { sets.push(`email_verified = $${i++}`); vals.push(body.emailVerified); }
  if (body.profileImage !== undefined)  { sets.push(`profile_image = $${i++}`);  vals.push(body.profileImage); }
  if (body.bannerImage !== undefined)   { sets.push(`banner_image = $${i++}`);   vals.push(body.bannerImage); }

  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  sets.push(`updated_at = NOW()`);
  vals.push(params.userId);

  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    vals
  );

  return NextResponse.json({ user: mapUser(rows[0]) });
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pool = getPool();
  await pool.query(`DELETE FROM posts WHERE author_id = $1`, [params.userId]);
  await pool.query(`DELETE FROM comments WHERE author_id = $1`, [params.userId]);
  await pool.query(`DELETE FROM notifications WHERE recipient_id = $1 OR sender_id = $1`, [params.userId]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [params.userId]);

  return NextResponse.json({ success: true });
}
