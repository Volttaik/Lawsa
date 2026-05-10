import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import { getPosts, getPostById, createPost, updatePost, deletePost, getCommentsByPost, createComment, updateComment, deleteComment, getUserById, createNotification } from "../lib/queries.js";

const router = Router();

router.get("/posts", async (req, res) => {
  try {
    const { authorId, category, offset = "0", limit = "20" } = req.query as any;
    const posts = await getPosts({ authorId, category }, parseInt(offset), parseInt(limit));
    res.json({ posts });
  } catch (e) { console.error("[posts/get]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/posts", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const me = await getUserById(auth.userId);
    if (!me) return res.status(401).json({ error: "User not found" });
    const { content, images = [], videos = [], category = "general", repostedFrom, poll } = req.body;
    if (!content?.trim() && !images?.length && !videos?.length) return res.status(400).json({ error: "Content required" });
    const post = await createPost({ authorId: me.id, content: content?.trim() || "", images, videos, category, repostedFrom, poll });
    res.json({ post });
  } catch (e) { console.error("[posts/post]", e); res.status(500).json({ error: "Failed" }); }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    const comments = await getCommentsByPost(post.id);
    res.json({ post: { ...post, comments } });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.authorId !== auth.userId) return res.status(403).json({ error: "Forbidden" });
    await deletePost(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/posts/:id/like", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    const likes: string[] = post.likes || [];
    const liked = likes.includes(auth.userId);
    const newLikes = liked ? likes.filter(id => id !== auth.userId) : [...likes, auth.userId];
    const updated = await updatePost(post.id, { likes: newLikes });
    if (!liked && post.authorId !== auth.userId) {
      const me = await getUserById(auth.userId);
      await createNotification({ recipientId: post.authorId, senderId: auth.userId, senderName: me?.name || "Someone", senderImage: me?.profileImage || "", type: "like", postId: post.id, message: "liked your post" }).catch(() => {});
    }
    res.json({ liked: !liked, likesCount: newLikes.length, post: updated });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/posts/:id/bookmark", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    const bookmarks: string[] = post.bookmarks || [];
    const bookmarked = bookmarks.includes(auth.userId);
    const newBookmarks = bookmarked ? bookmarks.filter(id => id !== auth.userId) : [...bookmarks, auth.userId];
    await updatePost(post.id, { bookmarks: newBookmarks });
    res.json({ bookmarked: !bookmarked });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/posts/:id/repost", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const me = await getUserById(auth.userId);
    const orig = await getPostById(req.params.id);
    if (!orig || !me) return res.status(404).json({ error: "Not found" });
    const post = await createPost({ authorId: me.id, content: req.body.content || "", images: [], videos: [], category: orig.category, repostedFrom: orig });
    await updatePost(orig.id, { reshares: (orig.reshares || 0) + 1 });
    res.json({ post });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/posts/:id/view", async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (post) await updatePost(post.id, { views: (post.views || 0) + 1 });
    res.json({ success: true });
  } catch { res.json({ success: true }); }
});

router.get("/posts/:id/comments", async (req, res) => {
  try {
    const comments = await getCommentsByPost(req.params.id);
    res.json({ comments });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/posts/:id/comments", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const me = await getUserById(auth.userId);
    const post = await getPostById(req.params.id);
    if (!post || !me) return res.status(404).json({ error: "Not found" });
    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content required" });
    const comment = await createComment({ postId: post.id, authorId: me.id, authorName: me.name, authorUsername: me.username, authorImage: me.profileImage || "", content: content.trim(), parentId });
    if (post.authorId !== me.id) {
      await createNotification({ recipientId: post.authorId, senderId: me.id, senderName: me.name, senderImage: me.profileImage || "", type: "comment", postId: post.id, message: "commented on your post" }).catch(() => {});
    }
    res.json({ comment });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.post("/posts/:postId/comments/:commentId/like", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { query: dbQuery } = await import("../lib/db.js");
    const rows = await dbQuery("SELECT * FROM comments WHERE id = $1", [req.params.commentId]);
    const r = rows[0];
    if (!r) return res.status(404).json({ error: "Not found" });
    const likes: string[] = r.likes || [];
    const liked = likes.includes(auth.userId);
    const newLikes = liked ? likes.filter((id: string) => id !== auth.userId) : [...likes, auth.userId];
    await updateComment(r.id, { likes: newLikes });
    res.json({ liked: !liked });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { query: dbQuery } = await import("../lib/db.js");
    const rows = await dbQuery("SELECT * FROM comments WHERE id = $1", [req.params.commentId]);
    const r = rows[0];
    if (!r) return res.status(404).json({ error: "Not found" });
    if (r.author_id !== auth.userId) return res.status(403).json({ error: "Forbidden" });
    await deleteComment(r.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
