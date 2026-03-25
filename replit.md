# Lawsa Socials

A modern professional social networking platform built for law students and professionals. A LinkedIn-style app built with Next.js, MongoDB, and Tailwind CSS.

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (auth, posts, messages, notifications, users)
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── connect/        # User discovery & follow
│   │   ├── messages/       # Real-time messaging
│   │   ├── notifications/  # Notification feed
│   │   ├── post/           # Create post
│   │   ├── profile/[userId]/ # User profiles
│   │   └── settings/       # Account settings
│   ├── login/              # Login page
│   ├── register/           # Multi-step registration
│   ├── globals.css         # Global styles + .form-input component
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Shared UI components
├── lib/                    # Utilities (db, auth, server actions)
│   ├── db.ts               # MongoDB connection
│   └── auth.ts             # JWT sign/verify helpers
├── models/                 # Mongoose schemas
├── middleware.ts            # Route protection (JWT verification)
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript config (target: ES2017)
```

## Tech Stack

- **Framework**: Next.js 14.2.18 (App Router)
- **Language**: TypeScript (target: ES2017)
- **Database**: MongoDB via Mongoose (requires `MONGO_URI` secret)
- **Authentication**: Custom JWT via `jose` + `bcryptjs` (requires `JWT_SECRET` secret)
- **Styling**: Tailwind CSS + Framer Motion animations
- **Icons**: Lucide React

## Key Features

- Custom JWT authentication (no Clerk, no OAuth)
- Multi-step user registration (6 steps with animated transitions)
- Post feed with likes, comments, images and video (media shown before text)
- Video support with skeleton loading placeholders
- Real-time messaging with image, video, and file attachments
- Borderless open-feel chat UI
- User profile with banner, skills, and bio
- Follow/unfollow connections
- Notification system
- Settings as cards layout (profile, security, privacy, notifications, dark mode)
- Dark mode support via next-themes (Light/Dark/System)
- New logo (logo.jpg) replacing SVG
- User avatar in header and bottom nav profile button
- Profile link correctly resolves user _id

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

- Workflow: `Start application` → `npm run dev` → port 5000 (webview)

## Design System

- **Background**: White (`#ffffff`)
- **Accent**: Blue (`#2563EB`)
- **Borders**: Thin black with opacity (`border-black/10`)
- **Shadows**: Soft elevation only (`shadow-soft`, `shadow-card`, `shadow-card-hover`)
- **Typography**: Clean, balanced, no oversized headings
- **Animations**: Framer Motion (smooth, subtle)
- **Form inputs**: `.form-input` CSS class (defined in globals.css)

## Important Notes

- TypeScript `target: ES2017` is required to support `Set` spread iteration (`new Set([...prev, id])`)
- `experimental.serverActions.bodySizeLimit` is set to `20mb` for large profile image uploads
- Profile images can be stored as base64 strings in MongoDB
- Images on the landing page use Unsplash CDN URLs
