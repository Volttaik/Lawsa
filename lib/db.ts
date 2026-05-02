import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

let _supabase: SupabaseClient | null = null
let _pool: Pool | null = null

export function supabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!_supabase) _supabase = createClient(url, key, { auth: { persistSession: false } })
  return _supabase
}

export function pg(): Pool {
  if (!_pool) _pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  return _pool
}

export async function initSchema() {
  const sb = supabase()
  if (sb) return
  await pg().query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, profile_image TEXT DEFAULT '', banner_image TEXT DEFAULT '',
      bio TEXT DEFAULT '', phone TEXT DEFAULT '', date_of_birth TEXT DEFAULT '',
      skills TEXT[] DEFAULT '{}', followers TEXT[] DEFAULT '{}', following TEXT[] DEFAULT '{}',
      connections TEXT[] DEFAULT '{}', pending_connections TEXT[] DEFAULT '{}',
      last_online TIMESTAMPTZ DEFAULT NOW(), clan_id TEXT DEFAULT '', clan_name TEXT DEFAULT '',
      clan_logo TEXT DEFAULT '', bookmarks TEXT[] DEFAULT '{}',
      headline TEXT DEFAULT '', website TEXT DEFAULT '', location TEXT DEFAULT '',
      experience JSONB DEFAULT '[]', education JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      author_id TEXT NOT NULL, author_name TEXT NOT NULL, author_username TEXT NOT NULL,
      author_image TEXT DEFAULT '', content TEXT DEFAULT '',
      images TEXT[] DEFAULT '{}', videos TEXT[] DEFAULT '{}',
      likes TEXT[] DEFAULT '{}', bookmarks TEXT[] DEFAULT '{}',
      reactions JSONB DEFAULT '{}', shares TEXT[] DEFAULT '{}',
      reshares INTEGER DEFAULT 0, category TEXT DEFAULT 'general',
      reposted_from JSONB, poll JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id TEXT NOT NULL, author_id TEXT NOT NULL, author_name TEXT NOT NULL,
      author_username TEXT NOT NULL, author_image TEXT DEFAULT '',
      content TEXT NOT NULL, likes TEXT[] DEFAULT '{}', parent_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      recipient_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_name TEXT NOT NULL,
      sender_image TEXT DEFAULT '', type TEXT NOT NULL, post_id TEXT, comment_id TEXT,
      message TEXT DEFAULT '', read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      conversation_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_name TEXT NOT NULL,
      sender_image TEXT DEFAULT '', receiver_id TEXT NOT NULL,
      content TEXT DEFAULT '', media_url TEXT DEFAULT '', media_type TEXT DEFAULT '',
      read BOOLEAN DEFAULT FALSE, edited BOOLEAN DEFAULT FALSE, is_deleted BOOLEAN DEFAULT FALSE,
      reply_to_id TEXT, reply_to_content TEXT DEFAULT '', reply_to_sender TEXT DEFAULT '',
      reactions JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      participants TEXT[] NOT NULL, last_message TEXT DEFAULT '',
      last_message_time TIMESTAMPTZ DEFAULT NOW(),
      unread_count JSONB DEFAULT '{}', typing_users JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS stories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      author_id TEXT NOT NULL, author_name TEXT NOT NULL, author_username TEXT NOT NULL,
      author_image TEXT DEFAULT '', content TEXT DEFAULT '', image TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS clans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, logo TEXT DEFAULT '',
      description TEXT DEFAULT '', owner_id TEXT NOT NULL, owner_name TEXT NOT NULL,
      members TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS world_chat_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      clan_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_name TEXT NOT NULL,
      sender_username TEXT NOT NULL, sender_image TEXT DEFAULT '', content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS upload_chunks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      upload_id TEXT NOT NULL, chunk_index INTEGER NOT NULL, total_chunks INTEGER NOT NULL,
      filename TEXT, mime_type TEXT, subfolder TEXT, data BYTEA NOT NULL, user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(upload_id, chunk_index)
    );
  `)
}

let _schemaInit = false
export async function ensureSchema() {
  if (_schemaInit) return
  _schemaInit = true
  try { await initSchema() } catch (e) { console.error('Schema init:', e) }
}
