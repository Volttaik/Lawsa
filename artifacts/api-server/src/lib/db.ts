import pg from "pg";
const { Pool } = pg;

let _pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!_pool) {
    const url = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set.");
    const isExternal = !!process.env.EXTERNAL_DATABASE_URL;
    _pool = new Pool({
      connectionString: url,
      ssl: isExternal ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return _pool;
}

export async function query(sql: string, params: any[] = []) {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function queryOne(sql: string, params: any[] = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}
