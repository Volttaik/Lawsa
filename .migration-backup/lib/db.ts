import { Pool } from 'pg'

let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    const url = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set.')
    const isExternal = !!process.env.EXTERNAL_DATABASE_URL
    _pool = new Pool({
      connectionString: url,
      ssl: isExternal ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  }
  return _pool
}

export default getPool
