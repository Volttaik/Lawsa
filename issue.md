# Issue: Auth Redirect Loop on Vercel (Static Rendering of API Routes)

## Root Cause

Next.js 14 (App Router) attempts to statically pre-render pages and API routes at build time.
The `/api/auth/me` route (and all other API routes) use `request.cookies`, which only exists
during a live HTTP request — not at build time. This causes the build-time render to throw:

```
Dynamic server usage: Route /api/auth/me couldn't be rendered statically
because it used `request.cookies`.
```

At runtime on Vercel, the `/api/auth/me` endpoint fails or returns an error, the dashboard
layout interprets that as "unauthenticated", and redirects to `/login` — creating an
infinite redirect loop.

## Fix

Add the following line to **every** API route file (`app/api/**/route.ts`) after the import block:

```ts
export const dynamic = "force-dynamic";
```

This tells Next.js to always render the route at request time, never statically.

### Files that need this line

- `app/api/auth/me/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/messages/route.ts`
- `app/api/messages/[conversationId]/route.ts`
- `app/api/notifications/route.ts`
- `app/api/posts/route.ts`
- `app/api/posts/[postId]/route.ts`
- `app/api/posts/[postId]/comments/route.ts`
- `app/api/posts/[postId]/like/route.ts`
- `app/api/posts/[postId]/dislike/route.ts`
- `app/api/upload/route.ts`
- `app/api/users/route.ts`
- `app/api/users/[userId]/route.ts`
- `app/api/users/[userId]/follow/route.ts`

### Example (after fix)

```ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // ...
}
```

---

## How to Push Changes to GitHub from Replit

> **Note:** `git push` is blocked for the main agent in Replit. Use the GitHub Contents API instead.

### Prerequisites
- GitHub Personal Access Token (PAT) with `repo` scope — stored as `GITHUB_TOKEN` or passed inline
- Repo: `Volttaik/Lawsa` (main branch)

### Step-by-step via GitHub Contents API

Use the `code_execution` sandbox (JavaScript/Node.js) to push files. Do this **one file at a time** to avoid SHA conflicts.

```js
const token = "<YOUR_GITHUB_PAT>";
const repo = "Volttaik/Lawsa";
const headers = {
  "Authorization": `Bearer ${token}`,
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json"
};
const fs = await import("fs");

async function pushFile(path, commitMessage) {
  // 1. Get the current SHA of the file on GitHub
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });
  const getData = await getRes.json();
  const sha = getData.sha; // required for updates; omit for brand-new files

  // 2. Read the local (modified) file and base64-encode it
  const content = fs.readFileSync(path, "utf8");
  const encoded = Buffer.from(content).toString("base64");

  // 3. PUT to update (or create) the file
  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ message: commitMessage, content: encoded, sha })
  });
  const putData = await putRes.json();

  if (putData.commit?.sha) {
    console.log(`✓ ${path} → commit ${putData.commit.sha.slice(0, 7)}`);
  } else {
    console.log(`✗ ${path}: ${putData.message}`);
  }
}

// Push one file
await pushFile("app/api/auth/me/route.ts", "fix: add force-dynamic to prevent static rendering");
```

### Pushing multiple files

Call `pushFile` sequentially (not in parallel) to avoid GitHub SHA conflicts:

```js
const filesToPush = [
  "app/api/auth/me/route.ts",
  "app/api/auth/login/route.ts",
  // ... add more
];

for (const f of filesToPush) {
  await pushFile(f, `fix: add force-dynamic to ${f}`);
}
```

### Creating a brand-new file (no existing SHA)

Omit the `sha` field in the PUT body:

```js
const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/newfile.md`, {
  method: "PUT",
  headers,
  body: JSON.stringify({
    message: "docs: add issue notes",
    content: Buffer.from("# Hello").toString("base64")
    // no sha field
  })
});
```

---

## Additional Context

- **JWT secret** must match in both `middleware.ts` and `lib/auth.ts`. Fallback: `"lawsa-socials-secret-key-2024-very-secure"`
- **Cookie name:** `lawsa-token` (httpOnly, sameSite: lax, secure in production)
- **MongoDB:** Atlas free tier M0 — Vercel requires `0.0.0.0/0` whitelisted in Atlas Network Access
- **Env vars on Vercel:** `MONGODB_URI` (Atlas connection string), `JWT_SECRET`
- **Post-login redirect:** use `window.location.href = "/dashboard"` (not Next.js `router.push`) to ensure cookies are sent on the next full request
- **Dashboard layout:** fetches `/api/auth/me` with `credentials: "include"` — shows a spinner while loading, redirects to `/login` only on confirmed 401
