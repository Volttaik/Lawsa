# Sosa

This repository hosts the source code for Sosa, a social platform built with Next.js, TypeScript, Turso, Tailwind CSS, and Framer Motion.

## Features

- User authentication
- Create and delete posts
- Like, comment, repost, bookmark, follow, and message
- Profile pages with edit support
- Notifications
- Clans and community chat
- PWA install support

## Database

The app uses Turso for persistence.

Required env vars:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `JWT_SECRET`

## Run Locally

```bash
npm install
npm run dev
```
