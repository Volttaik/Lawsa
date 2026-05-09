# Sosa Socials

A full-stack social networking app built with Next.js 14 App Router, Supabase (PostgreSQL), JWT auth, Tailwind CSS, Phosphor Icons, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Auth**: JWT tokens in `sosa-token` cookie (bcryptjs, jose)
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Phosphor Icons
- **File uploads**: chunked base64 uploads stored in `upload_chunks` table

## Environment Variables (Secrets)

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (bypasses RLS)
- `JWT_SECRET` — JWT signing secret

## Database Setup

Run `supabase/schema.sql` in the Supabase SQL Editor to create all tables and indexes.

## Key Files

- `lib/db.ts` — Supabase client singleton
- `lib/queries.ts` — All database operations (Supabase builder API)
- `lib/auth.ts` — JWT sign/verify helpers
- `app/api/` — All API routes (REST)
- `app/dashboard/` — Authenticated dashboard pages

## Features

- User registration / login with hashed passwords
- Post feed with likes, comments, reactions, reposts, bookmarks
- Real-time messaging (SSE polling) with typing indicators
- Follow / unfollow with mutual-follow requirement for messaging
- Notifications system (follow, like, comment, message)
- Clans (group chat rooms)
- Stories (24h expiry)
- PWA support with S.O.S.S.A logo

## Logo

New logo: `public/logo.png` (S.O.S.S.A — Social Sciences Students' Association)
Used everywhere via `components/Logo.tsx`.

## Avatar Fallback Pattern

Initials-based colored circles when no profile image:
```ts
const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
const colors = ["bg-blue-600","bg-purple-600","bg-green-600","bg-pink-600","bg-orange-600","bg-teal-600"]
const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
```

## Message Flow

1. POST `/api/messages` — send message (requires mutual follow)
2. GET `/api/messages/[conversationId]` — fetch messages (marks read)
3. GET `/api/messages/[conversationId]/stream` — SSE stream (polls every 2s)
4. POST `/api/messages/[conversationId]/typing` — update typing status

## Architecture Fixes Applied (May 2026)

### Problem 1: N+1 Query Performance Bug (CRITICAL)
**Root cause**: `getPosts()` in `lib/queries.ts` called `getCommentsByPostId()` for every single post individually. Loading 15 posts = 16 sequential DB round-trips → extremely slow feed loading.

**Fix**: Replaced with a single batch query that fetches all comment counts for all posts at once using an `IN` clause. Now 15 posts = 2 total DB queries. Comment full content loads lazily on-demand when the user opens the comment section.

### Problem 2: Follow Button Resetting to "Follow" After Navigation
**Root cause A**: `/api/auth/me` was missing `export const dynamic = "force-dynamic"` — Next.js could cache GET responses and return stale data after a follow action.

**Root cause B**: `isFollowing` was derived solely from `meData.following.includes(profileId)`. After navigation, if the cached `/api/auth/me` returned stale `following`, the button reset.

**Fix**:
- Added `force-dynamic`, `fetchCache = "force-no-store"`, and `revalidate = 0` to `/api/auth/me/route.ts`
- `isFollowing` now cross-checks BOTH sources: `profileData.followers.includes(myId)` (primary — always fresh since profile is fetched with `no-store`) AND `meData.following.includes(profileId)` (fallback). Either match = following.

### Problem 3: Stale Browser/Next.js Caches
**Root cause**: Multiple `fetch()` calls throughout client components lacked `cache: "no-store"`, allowing browsers or Next.js fetch deduplication to serve stale responses.

**Fix**: Added `cache: "no-store"` to all client-side `fetch()` calls for user data, posts, and notifications in:
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/profile/[userId]/page.tsx`
- `app/dashboard/explore/page.tsx`
- `app/dashboard/notifications/page.tsx`
- `app/dashboard/settings/page.tsx`

### Problem 4: Posts Count Showing "0"
**Root cause**: Profile header displayed `profile.postsCount` from the API, which could be 0 or stale even when the posts array was populated.

**Fix**: Header now displays the actual count of loaded posts (`posts.length`) with a "..." placeholder while posts are loading — always accurate.
