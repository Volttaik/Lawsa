# Lawsa Socials

A modern professional social networking platform built for law students and professionals. A LinkedIn-style app built with Next.js, MongoDB, and Tailwind CSS.

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (auth, posts, messages, notifications, users)
│   │   ├── users/heartbeat/ # POST — updates lastOnline timestamp
│   │   └── users/recommendations/ # GET — smart profile recommendations
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── connect/        # User discovery & follow
│   │   ├── messages/       # Real-time messaging with chat overlay
│   │   ├── notifications/  # Notification feed
│   │   ├── post/           # Create post (with category + video FormData upload)
│   │   ├── profile/[userId]/ # User profiles
│   │   └── settings/       # Account settings
│   ├── login/              # Login page
│   ├── register/           # Multi-step registration
│   ├── globals.css         # Global styles + animation utilities
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Shared UI components
├── lib/                    # Utilities (db, auth, server actions)
│   ├── db.ts               # MongoDB connection
│   └── auth.ts             # JWT sign/verify helpers
├── models/                 # Mongoose schemas
│   └── post.model.ts       # Post schema (includes `category` field)
├── middleware.ts            # Route protection (JWT verification)
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript config (target: ES2017)
```

## Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript (target: ES2017)
- **Database**: MongoDB via Mongoose (requires `MONGO_URI` secret)
- **Authentication**: Custom JWT via `jose` + `bcryptjs` (requires `JWT_SECRET` secret)
- **Styling**: Tailwind CSS + Framer Motion animations
- **Icons**: Lucide React

## Key Features

- Custom JWT authentication (no Clerk, no OAuth)
- Multi-step user registration (6 steps with animated transitions)
- **Home Feed** with horizontal category filter chips (All, Law, Tech, Sports, News, Lectures, Career, Events, etc.)
- **Smart feed algorithm** — followed users' posts prioritized on page 1, rest sorted by recency
- **Profile recommendations** — inline "People you may know" card in the feed with follow/unfollow
- Post cards with smooth fade-in media (blur → sharp), skeleton loaders, video players
- Likes, comments, share buttons with animated counters
- **Post creation** with category selector, video uploaded via FormData (`/api/upload`) before posting (fixes large video upload issues)
- **Chat** full-screen overlay (z-200) that properly hides bottom nav
- **Voice note bubble** — styled audio player bubble matching the chat color scheme
- **Chat background customization** — palette button in header with 9 gradient/pattern/dark themes
- Real-time typing indicators, online/offline status from heartbeat
- Heartbeat endpoint (`/api/users/heartbeat`) pinged every 30s from the dashboard layout to update `lastOnline`
- Online status shows "Online" only if `lastOnline` is within 5 minutes
- User profile with banner, skills, and bio
- Follow/unfollow connections; "Follows you" badges on Connect page
- Notification system with unread dot on bottom nav
- Settings as cards layout (profile, security, privacy, notifications, dark mode)
- Dark mode support via next-themes (Light/Dark/System)
- `FadeImg` component used throughout for smooth opacity + blur-to-sharp image loading
- `shadow-btn` utility added to globals.css
- New CSS keyframe animations: `animate-fade-up`, `animate-pop-in`

## Environment Variables / Secrets

The following secrets must be set in the Replit Secrets tab:

- `MONGO_URI` — MongoDB connection string (e.g. from MongoDB Atlas)
- `JWT_SECRET` — Secret for JWT signing (long random string)

## Running the App

```bash
npm run dev
```

The app runs on port 5000.

## Replit Workflow

- Workflow: `Start application` → `npm install && npm run dev` → port 5000 (webview)

## Design System

- **Background**: White (`#ffffff`)
- **Accent**: Blue (`#2563EB`)
- **Borders**: Thin black with opacity (`border-black/10`)
- **Shadows**: Soft elevation only (`shadow-soft`, `shadow-card`, `shadow-card-hover`, `shadow-btn`)
- **Typography**: Clean, balanced, no oversized headings
- **Animations**: Framer Motion (smooth, subtle) + CSS keyframes for page elements
- **Form inputs**: `.form-input` CSS class (defined in globals.css)

## Important Notes

- TypeScript `target: ES2017` is required to support `Set` spread iteration (`new Set([...prev, id])`)
- `experimental.serverActions.bodySizeLimit` is set to `20mb` for large file uploads
- Videos in posts are uploaded via `/api/upload` (FormData) before post creation to avoid JSON body size limits
- Chat overlay uses `z-[200]` which places it above the bottom nav (`z-50`) and top header (`z-50`)
- `lastOnline` is updated via `POST /api/users/heartbeat` (called every 30s from dashboard layout)
- Post `category` field added to schema (defaults to `"general"`); existing posts show as "general"
