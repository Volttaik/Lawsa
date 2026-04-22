# Lawsa Socials

A modern professional social networking platform built for law students and professionals. A LinkedIn-style app built with Next.js, MongoDB, and Tailwind CSS.

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (auth, posts, messages, notifications, users)
│   │   ├── upload/         # Upload API with chunked upload support
│   │   │   ├── route.ts        # Direct upload (small files)
│   │   │   ├── chunk/route.ts  # Chunk receiver (stores chunks in MongoDB)
│   │   │   └── assemble/route.ts # Assembles chunks → GridFS
│   │   ├── files/[fileId]/ # GridFS file server
│   │   ├── users/heartbeat/ # POST — updates lastOnline timestamp
│   │   └── users/recommendations/ # GET — smart profile recommendations
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── connect/        # User discovery & follow
│   │   ├── messages/       # Real-time messaging with chat overlay
│   │   ├── notifications/  # Notification feed
│   │   ├── post/           # Create post (media library rework with chunked uploads)
│   │   ├── profile/[userId]/ # User profiles
│   │   └── settings/       # Account settings
│   ├── login/              # Login page
│   ├── register/           # Multi-step registration
│   ├── globals.css         # Global styles + animation utilities
│   ├── layout.tsx          # Root layout (favicon: /icon.jpg)
│   └── page.tsx            # Landing page
├── components/             # Shared UI components
├── lib/                    # Utilities (db, auth, server actions)
│   ├── db.ts               # MongoDB connection
│   ├── auth.ts             # JWT sign/verify helpers
│   ├── gridfs.ts           # MongoDB GridFS upload/download utilities
│   └── uploadClient.ts     # Client-side chunked upload utility (3.5MB chunks)
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
- **Post creation** with category selector, media library with drag-drop zone, file size display, progress indicators, and chunked uploads (3.5MB per HTTP request) for Vercel compatibility
- **Post cards** redesigned: author/avatar at TOP, media (image/video) in CENTER, text UNDER media, actions at bottom
- **Lightbox viewer** — clicking any image/video in a post opens full-screen viewer with prev/next navigation and keyboard support
- **Share links** — copy to clipboard generates `/dashboard?post=ID` URL that opens a shared post modal
- **Chat** full-screen overlay (z-200) that properly hides bottom nav
- **Voice note bubble** — styled audio player bubble matching the chat color scheme
- **Chat background customization** — palette button in header with 9 gradient/pattern/dark themes
- **Chat message bubbles** — received messages use solid white with dark text (readable on any background); sent messages use blue with white text
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

- **Page Background**: Muted cool grey (`#e8ecf0`) — set globally in `app/layout.tsx` body and repeated per-page
- **Card Background**: Pure white (`#ffffff`) — cards sit on muted bg for depth contrast
- **Input Background**: `#eef0f4` with inset shadow — softer than white, focused state returns to white
- **Accent**: Blue (`#2563EB`)
- **Borders**: Very thin black with opacity (`border-black/8`)
- **Shadows**: Layered elevation (`shadow-soft`, `shadow-card`, `shadow-card-hover`, `shadow-btn`)
- **Header/Nav**: Frosted glass (`.glass-strong` = rgba(255,255,255,0.95) + 24px blur + saturate(200%))
- **Typography**: Clean, balanced, no oversized headings
- **Border Radius**: `rounded-2xl` for cards, `rounded-xl` for buttons/inputs, `rounded-full` for chips/avatars
- **Animations**: Framer Motion spring (`stiffness: 500, damping: 30`) + 5-keyframe like bounce + slide-in variants
- **Form inputs**: `.form-input` CSS class (defined in globals.css)

### UI Overhaul Completed (April 2026)

Pages updated with spring/slide animations, glass headers, muted bg, card lift hovers:
- `app/globals.css` — full color system, animations, glass utilities, skeleton, post-card-hover
- `app/layout.tsx` — body background changed to `#e8ecf0`
- `app/dashboard/layout.tsx` — glass-strong frosted header + spring-animated bottom nav with pill active states
- `app/dashboard/page.tsx` — PostCard hover lift + heartbeat like bounce + category filter chips
- `app/dashboard/messages/page.tsx` — white cards on muted bg, staggered fade-in, spring new-chat button
- `app/dashboard/profile/[userId]/page.tsx` — full skeleton loader, tab spring animation, card hover lift
- `app/dashboard/connect/page.tsx` — rounded-2xl cards, styled search input
- `app/login/page.tsx` — muted background, glass header
- `app/register/page.tsx` — muted background, glass header
- `app/page.tsx` — landing page background updated

## Important Notes

- TypeScript `target: ES2017` is required to support `Set` spread iteration (`new Set([...prev, id])`)
- `experimental.serverActions.bodySizeLimit` is set to `20mb` for large file uploads
- Videos in posts are uploaded via `/api/upload` (FormData) before post creation to avoid JSON body size limits
- Chat overlay uses `z-[200]` which places it above the bottom nav (`z-50`) and top header (`z-50`)
- `lastOnline` is updated via `POST /api/users/heartbeat` (called every 30s from dashboard layout)
- Post `category` field added to schema (defaults to `"general"`); existing posts show as "general"
