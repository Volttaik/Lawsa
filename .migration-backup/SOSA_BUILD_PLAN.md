# SOSA SOCIALS — Complete Build Plan

## 🎯 Vision
A next-gen social platform combining the best of every major app:
- 💬 **Chat** → WhatsApp (dark bubbles, ticks, reply, reactions, voice notes, media)
- 📝 **Posts** → X/Twitter (feed, likes, reposts, bookmarks, polls, quotes, trending)
- 👤 **Profile** → LinkedIn (cover banner, skills, bio, experience, connections, stats)
- 📖 **Stories** → Instagram (24h stories, viewer, reactions)
- 👥 **Clans** → Discord (group rooms, clan chat, member list)
- 🔔 **Notifications** → full real-time feel

---

## 🗄️ Database: Supabase (PostgreSQL)
**Tables:** users, posts, comments, notifications, messages, conversations,
           stories, clans, world_chat_messages, upload_chunks

**Fallback:** Replit built-in PostgreSQL (DATABASE_URL) if SUPABASE_URL not set

---

## 💬 Chat System (WhatsApp-exact)

### UI Design
- Dark background: #0B141A (WhatsApp dark)
- Outgoing bubble: #005C4B (dark green) — right aligned
- Incoming bubble: #1F2C34 (dark charcoal) — left aligned
- Subtle tiled background pattern
- Header: avatar + name + online status + video/call/menu icons
- Input bar: emoji | text | attachment | camera | 🎤 mic (green circle)

### Features
- ✅ Message bubbles with exact WhatsApp layout
- ✅ Timestamps inside bubbles (19:38 style)
- ✅ Double-tick read receipts (✓✓ gray = sent, ✓✓ blue = read)
- ✅ Typing indicator (animated "..." dots)
- ✅ Online/offline + last seen
- ✅ Reply to specific message (swipe/button — quoted preview)
- ✅ React to messages (emoji reactions on long press)
- ✅ Delete message (for me / for everyone)
- ✅ Edit message
- ✅ Image/video sharing
- ✅ Voice note recording + waveform playback
- ✅ File attachment
- ✅ Message search
- ✅ Conversation list (WhatsApp home screen style)
- ✅ Unread count badges
- ✅ Pull-to-refresh / auto-poll

---

## 📝 Post System (X/Twitter-exact)

### Features
- ✅ Infinite scroll feed with algorithm (following boost + weighted random)
- ✅ Rich composer: text + images + videos + polls + GIF
- ✅ @mentions and #hashtags (linkified, clickable)
- ✅ Like with heart animation
- ✅ Multi-emoji Reactions (❤️ 🔥 😂 😮 😢 👏)
- ✅ Repost / Quote tweet
- ✅ Bookmark (save for later)
- ✅ Threaded comments with replies
- ✅ Category filter tabs
- ✅ Trending topics sidebar
- ✅ Stories bar at top
- ✅ Share sheet (WhatsApp, Telegram, X, copy link)
- ✅ Post media lightbox (full-screen swipe gallery)
- ✅ New posts banner ("↑ 5 new posts")
- ✅ Polls (create + vote + see results)
- ✅ Explore / trending page

---

## 👤 Profile System (LinkedIn-exact)

### Layout
- Full-width banner/cover image
- Profile photo overlapping banner (circle, bordered)
- Name + username + verification badge
- Headline / tagline
- Bio paragraph
- Location + website link
- Skills tags (with endorsement counts)
- Follower / Following / Posts counts
- Follow / Connect / Message button

### Sections
- 📌 Featured Posts
- 📝 Activity Feed (their posts)
- 💼 Experience (work history)
- 🎓 Education
- 🛠️ Skills & Endorsements
- 🏆 Achievements / Badges
- 🤝 Connections / Mutual friends

### Edit Profile
- Edit banner, avatar, name, bio, skills
- Privacy settings

---

## 🔔 Notifications
- Like, comment, follow, repost, mention, reaction, message
- Grouped by type
- Unread badge on nav icon
- Mark all read
- Notification cards with action buttons

---

## 🔍 Explore / Discover
- Trending posts (most liked last 24h)
- Trending topics / hashtags
- People you may know (smart recs)
- Category browsing
- Search (posts + people)

---

## 🎨 Design System
- **Brand**: Sosa (purple-violet gradient as accent)
- **Primary**: #7C3AED (violet-600) with gradient to #6366F1 (indigo-500)
- **Dark mode**: True black (#000) background
- **Light mode**: Clean off-white (#F8FAFC)
- **Font**: Inter (current, keep)
- **Radius**: Consistent 16px cards, 24px modals
- **Animations**: Framer Motion throughout (spring physics)

---

## 📁 File Architecture

\`\`\`
lib/
  db.ts              → Supabase + pg client ✓
  queries.ts         → all DB operations
  auth.ts            → JWT (sosa-token cookie)
  server-auth.ts     → server-side auth helper
  upload.ts          → Supabase Storage / local fallback

app/
  page.tsx           → Landing page (Sosa branding)
  login/             → Auth pages
  register/
  dashboard/
    page.tsx         → Main feed (X-style)
    messages/        → WhatsApp-style chat
    profile/[id]/    → LinkedIn-style profile
    notifications/   → Notification center
    explore/         → Discover + trending
    clans/           → Discord-style groups
    settings/        → User settings
    bookmarks/       → Saved posts

components/
  chat/
    ChatWindow.tsx   → Full WhatsApp chat UI
    MessageBubble.tsx
    ChatList.tsx
    VoiceNote.tsx
  posts/
    PostCard.tsx
    PostComposer.tsx
    ReactionPicker.tsx
    PollCard.tsx
  profile/
    ProfileHeader.tsx
    SkillsSection.tsx
    ExperienceSection.tsx
  shared/
    Avatar.tsx
    Sidebar.tsx (nav)
    SearchBar.tsx
\`\`\`

---

## 🚀 Build Order
1. ✅ Supabase DB layer (lib/db.ts done)
2. 🔄 lib/queries.ts — all DB operations
3. 🔄 Auth layer — sosa-token, middleware
4. 🔄 All API routes (31 routes)
5. 🔄 Chat UI — WhatsApp clone
6. 🔄 Feed UI — X clone  
7. 🔄 Profile UI — LinkedIn clone
8. 🔄 Landing page — Sosa brand
9. 🔄 Request Supabase credentials
10. 🔄 Run schema + test
