-- ============================================================
-- LAWSA — Full Database Setup Script
-- Run this once against your PostgreSQL database to create
-- all required tables, columns, and indexes.
-- Usage:  psql $DATABASE_URL -f setup-database.sql
-- ============================================================

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
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
  skills JSONB DEFAULT '[]'::jsonb,
  followers JSONB DEFAULT '[]'::jsonb,
  following JSONB DEFAULT '[]'::jsonb,
  connections JSONB DEFAULT '[]'::jsonb,
  pending_connections JSONB DEFAULT '[]'::jsonb,
  bookmarks JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  clan_id TEXT DEFAULT '',
  clan_name TEXT DEFAULT '',
  clan_logo TEXT DEFAULT '',
  is_verified BOOLEAN DEFAULT FALSE,
  is_boosted BOOLEAN DEFAULT FALSE,
  premium_theme BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT DEFAULT '',
  password_reset_token TEXT DEFAULT '',
  password_reset_expires TIMESTAMPTZ,
  last_online TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to users if table already existed
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- ── POSTS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_image TEXT DEFAULT '',
  content TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  likes JSONB DEFAULT '[]'::jsonb,
  bookmarks JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  shares JSONB DEFAULT '[]'::jsonb,
  reshares INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  reposted_from JSONB,
  poll JSONB,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COMMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_image TEXT DEFAULT '',
  content TEXT NOT NULL,
  likes JSONB DEFAULT '[]'::jsonb,
  parent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_image TEXT DEFAULT '',
  type TEXT NOT NULL,
  post_id TEXT,
  comment_id TEXT,
  message TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONVERSATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_message TEXT DEFAULT '',
  last_message_time TIMESTAMPTZ DEFAULT NOW(),
  unread_count JSONB DEFAULT '{}'::jsonb,
  typing_users JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_image TEXT DEFAULT '',
  receiver_id TEXT NOT NULL,
  content TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  media_type TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  reply_to_id TEXT,
  reply_to_content TEXT DEFAULT '',
  reply_to_sender TEXT DEFAULT '',
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── STORIES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_image TEXT DEFAULT '',
  content TEXT DEFAULT '',
  image TEXT DEFAULT '',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLANS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT DEFAULT '',
  description TEXT DEFAULT '',
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── WORLD CHAT ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS world_chat_messages (
  id TEXT PRIMARY KEY,
  clan_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_username TEXT NOT NULL,
  sender_image TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SOCIAL EVENTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_username TEXT NOT NULL,
  actor_image TEXT DEFAULT '',
  recipient_id TEXT DEFAULT '',
  target_id TEXT DEFAULT '',
  target_type TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── UPLOAD CHUNKS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS upload_chunks (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  total_chunks INTEGER NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  subfolder TEXT DEFAULT '',
  data TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(upload_id, chunk_index)
);

-- ── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CALL SIGNALS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_signals (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LIVE STREAMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_streams (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL DEFAULT '',
  host_username TEXT NOT NULL DEFAULT '',
  host_image TEXT DEFAULT '',
  title TEXT DEFAULT 'Live',
  status TEXT DEFAULT 'live',
  viewer_count INTEGER DEFAULT 0,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_world_chat_clan ON world_chat_messages(clan_id);
CREATE INDEX IF NOT EXISTS idx_world_chat_created ON world_chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_conv_time ON conversations(last_message_time DESC);
CREATE INDEX IF NOT EXISTS idx_social_events_actor ON social_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_social_events_recipient ON social_events(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_events_target ON social_events(target_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);

-- ── DONE ─────────────────────────────────────────────────────────────────────
-- All tables and columns are now set up.
-- Run this script again at any time — it is safe to re-run (uses IF NOT EXISTS / IF NOT EXISTS).
