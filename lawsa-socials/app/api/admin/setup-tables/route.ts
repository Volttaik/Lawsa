import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_BACKFILL_KEY || "sossa-admin";
  if (key !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pool = getPool();
  const results: string[] = [];

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS upload_chunks (
        id            TEXT PRIMARY KEY,
        upload_id     TEXT        NOT NULL,
        chunk_index   INTEGER     NOT NULL,
        total_chunks  INTEGER     NOT NULL,
        filename      TEXT        NOT NULL,
        mime_type     TEXT        NOT NULL,
        subfolder     TEXT        NOT NULL DEFAULT '',
        data          BYTEA       NOT NULL,
        user_id       TEXT        NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    results.push("upload_chunks table: OK");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS upload_chunks_upload_id_idx
        ON upload_chunks (upload_id)
    `);
    results.push("upload_chunks index: OK");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_items (
        id                TEXT PRIMARY KEY,
        name              TEXT        NOT NULL,
        description       TEXT        NOT NULL DEFAULT '',
        category          TEXT        NOT NULL DEFAULT 'badge',
        effect_type       TEXT        NOT NULL UNIQUE,
        effect_data       JSONB       NOT NULL DEFAULT '{}',
        price             INTEGER     NOT NULL DEFAULT 0,
        is_free           BOOLEAN     NOT NULL DEFAULT false,
        unlock_condition  TEXT        NOT NULL DEFAULT 'always',
        unlock_threshold  INTEGER     NOT NULL DEFAULT 0,
        preview_color     TEXT        NOT NULL DEFAULT '#ffffff',
        icon              TEXT        NOT NULL DEFAULT 'badge',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    results.push("store_items table: OK");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_store_items (
        id          TEXT PRIMARY KEY,
        user_id     TEXT        NOT NULL,
        item_id     TEXT        NOT NULL REFERENCES store_items(id),
        equipped    BOOLEAN     NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, item_id)
      )
    `);
    results.push("user_store_items table: OK");

    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results }, { status: 500 });
  }
}
