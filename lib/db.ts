import { createClient, Client } from '@libsql/client';

let _client: Client | null = null

export function turso(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!url) throw new Error('TURSO_DATABASE_URL is not set')
    if (!authToken) throw new Error('TURSO_AUTH_TOKEN is not set')
    _client = createClient({ url, authToken })
  }
  return _client
}

let _initialized = false
let _initializing: Promise<void> | null = null

export async function ensureSchema(): Promise<void> {
  if (_initialized) return
  if (_initializing) return _initializing
  _initializing = _doInit()
  await _initializing
}

async function _doInit() {
  const db = turso()
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profile_image TEXT DEFAULT '',
      banner_image TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      date_of_birth TEXT DEFAULT '',
      headline TEXT DEFAULT '',
      website TEXT DEFAULT '',
      location TEXT DEFAULT '',
      skills TEXT DEFAULT '[]',
      followers TEXT DEFAULT '[]',
      following TEXT DEFAULT '[]',
      connections TEXT DEFAULT '[]',
      pending_connections TEXT DEFAULT '[]',
      bookmarks TEXT DEFAULT '[]',
      experience TEXT DEFAULT '[]',
      education TEXT DEFAULT '[]',
      clan_id TEXT DEFAULT '',
      clan_name TEXT DEFAULT '',
      clan_logo TEXT DEFAULT '',
      is_verified INTEGER DEFAULT 0,
      is_boosted INTEGER DEFAULT 0,
      premium_theme INTEGER DEFAULT 0,
      last_online TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_username TEXT NOT NULL,
      author_image TEXT DEFAULT '',
      content TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      videos TEXT DEFAULT '[]',
      likes TEXT DEFAULT '[]',
      bookmarks TEXT DEFAULT '[]',
      reactions TEXT DEFAULT '{}',
      shares TEXT DEFAULT '[]',
      reshares INTEGER DEFAULT 0,
      category TEXT DEFAULT 'general',
      reposted_from TEXT,
      poll TEXT,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_username TEXT NOT NULL,
      author_image TEXT DEFAULT '',
      content TEXT NOT NULL,
      likes TEXT DEFAULT '[]',
      parent_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_image TEXT DEFAULT '',
      type TEXT NOT NULL,
      post_id TEXT,
      comment_id TEXT,
      message TEXT DEFAULT '',
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participants TEXT NOT NULL DEFAULT '[]',
      last_message TEXT DEFAULT '',
      last_message_time TEXT,
      unread_count TEXT DEFAULT '{}',
      typing_users TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_image TEXT DEFAULT '',
      receiver_id TEXT NOT NULL,
      content TEXT DEFAULT '',
      media_url TEXT DEFAULT '',
      media_type TEXT DEFAULT '',
      read INTEGER DEFAULT 0,
      edited INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      reply_to_id TEXT,
      reply_to_content TEXT DEFAULT '',
      reply_to_sender TEXT DEFAULT '',
      reactions TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_username TEXT NOT NULL,
      author_image TEXT DEFAULT '',
      content TEXT DEFAULT '',
      image TEXT DEFAULT '',
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS clans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo TEXT DEFAULT '',
      description TEXT DEFAULT '',
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      members TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS world_chat_messages (
      id TEXT PRIMARY KEY,
      clan_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_username TEXT NOT NULL,
      sender_image TEXT DEFAULT '',
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS upload_chunks (
      id TEXT PRIMARY KEY,
      upload_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      total_chunks INTEGER NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      subfolder TEXT DEFAULT '',
      data BLOB NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(upload_id, chunk_index)
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)`,
    `CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_world_chat_clan ON world_chat_messages(clan_id)`,
  ]
  for (const sql of statements) {
    await db.execute(sql)
  }
  _initialized = true
}

export default turso
