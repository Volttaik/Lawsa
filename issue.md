# Notes

- The app uses Turso for persistence.
- Ensure every API route that reads request cookies is marked `export const dynamic = "force-dynamic";`.
- Social interactions, profile edits, posts, messages, notifications, stories, and clans should all persist to the database.
