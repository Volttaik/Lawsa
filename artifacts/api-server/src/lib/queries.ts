import { query, queryOne } from "./db.js";
import { cache } from "./cache.js";
import { randomUUID } from "crypto";

const now = () => new Date().toISOString();

// ── MAPPERS ──────────────────────────────────────────────────────────────────
export function mapUser(r: any) {
  if (!r) return null;
  const followers: string[] = r.followers || [];
  const following: string[] = r.following || [];
  return {
    _id: r.id, id: r.id, name: r.name, username: r.username,
    email: r.email, password: r.password,
    profileImage: r.profile_image || "", bannerImage: r.banner_image || "",
    bio: r.bio || "", phone: r.phone || "", dateOfBirth: r.date_of_birth || "",
    headline: r.headline || "", website: r.website || "", location: r.location || "",
    skills: r.skills || [], followers, following,
    connections: r.connections || [], pendingConnections: r.pending_connections || [],
    bookmarks: r.bookmarks || [], experience: r.experience || [], education: r.education || [],
    followersCount: typeof r.followers_count === "number" ? r.followers_count : followers.length,
    followingCount: typeof r.following_count === "number" ? r.following_count : following.length,
    postsCount: typeof r.posts_count === "number" ? r.posts_count : 0,
    clanId: r.clan_id || "", clanName: r.clan_name || "", clanLogo: r.clan_logo || "",
    isSpecial: r.email?.toLowerCase() === "onyeaghorlouis@gmail.com",
    isVerified: r.email?.toLowerCase() === "onyeaghorlouis@gmail.com" ? true : !!r.is_verified,
    isBoosted: !!r.is_boosted, premiumTheme: !!r.premium_theme,
    emailVerified: !!r.email_verified,
    emailVerificationToken: r.email_verification_token || "",
    passwordResetToken: r.password_reset_token || "",
    lastOnline: r.last_online, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapPost(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name,
    authorUsername: r.author_username, authorImage: r.author_image || "",
    authorIsSpecial: r.author_email?.toLowerCase() === "onyeaghorlouis@gmail.com",
    authorIsVerified: r.author_email?.toLowerCase() === "onyeaghorlouis@gmail.com" ? true : !!r.author_is_verified,
    authorEmailVerified: !!r.author_email_verified,
    content: r.content || "", images: r.images || [], videos: r.videos || [],
    likes: r.likes || [], bookmarks: r.bookmarks || [],
    reactions: r.reactions || {}, shares: r.shares || [],
    reshares: r.reshares || 0, category: r.category || "general",
    repostedFrom: r.reposted_from || null, poll: r.poll || null,
    views: r.views || 0, comments: [] as any[],
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapComment(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, postId: r.post_id, authorId: r.author_id,
    authorName: r.author_name, authorUsername: r.author_username,
    authorImage: r.author_image || "", content: r.content,
    likes: r.likes || [], parentId: r.parent_id || null,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapNotification(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, recipientId: r.recipient_id, senderId: r.sender_id,
    senderName: r.sender_name, senderImage: r.sender_image || "",
    type: r.type, postId: r.post_id || null, commentId: r.comment_id || null,
    message: r.message || "", read: !!r.read,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapMessage(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, conversationId: r.conversation_id,
    senderId: r.sender_id, senderName: r.sender_name, senderImage: r.sender_image || "",
    receiverId: r.receiver_id, content: r.content || "",
    mediaUrl: r.media_url || "", mediaType: r.media_type || "",
    read: !!r.read, edited: !!r.edited, isDeleted: !!r.is_deleted,
    replyToId: r.reply_to_id || null, replyToContent: r.reply_to_content || "",
    replyToSender: r.reply_to_sender || "", reactions: r.reactions || {},
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapConversation(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, participants: r.participants || [],
    lastMessage: r.last_message || "", lastMessageTime: r.last_message_time,
    unreadCount: r.unread_count || {}, typingUsers: r.typing_users || {},
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapClan(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, name: r.name, slug: r.slug, logo: r.logo || "",
    description: r.description || "", ownerId: r.owner_id, ownerName: r.owner_name,
    members: r.members || [], createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapWorldChat(r: any) {
  if (!r) return null;
  return {
    _id: r.id, id: r.id, clanId: r.clan_id, senderId: r.sender_id,
    senderName: r.sender_name, senderUsername: r.sender_username,
    senderImage: r.sender_image || "", content: r.content, createdAt: r.created_at,
  };
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export async function getUserById(id: string) {
  const key = `user:${id}`;
  const hit = cache.get<any>(key);
  if (hit !== null) return hit;
  const r = await queryOne("SELECT * FROM users WHERE id = $1", [id]);
  const result = mapUser(r);
  cache.set(key, result, 120);
  return result;
}

export async function getUsersByIds(ids: string[]) {
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const cached: Record<string, any> = {};
  const missing: string[] = [];
  for (const id of unique) {
    const hit = cache.get<any>(`user:${id}`);
    if (hit !== null) cached[id] = hit; else missing.push(id);
  }
  if (missing.length) {
    const ph = missing.map((_, i) => `$${i + 1}`).join(",");
    const rows = await query(`SELECT * FROM users WHERE id IN (${ph})`, missing);
    for (const row of rows) { const u = mapUser(row); cache.set(`user:${row.id}`, u, 30); cached[row.id] = u; }
  }
  return unique.map(id => cached[id] || null).filter(Boolean);
}

export async function getUserByEmail(email: string) {
  const r = await queryOne("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  return mapUser(r);
}

export async function getUserByEmailOrUsername(val: string) {
  const v = val.toLowerCase();
  const r = await queryOne("SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1", [v]);
  return mapUser(r);
}

export async function getUserByVerificationToken(token: string) {
  return mapUser(await queryOne("SELECT * FROM users WHERE email_verification_token = $1", [token]));
}

export async function getUserByResetToken(token: string) {
  return mapUser(await queryOne("SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()", [token]));
}

export async function createUser(data: any) {
  const id = randomUUID();
  await query(
    `INSERT INTO users (id,name,username,email,password,profile_image,banner_image,bio,skills,followers,following,connections,pending_connections,bookmarks,experience,education,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,'','','','[]','[]','[]','[]','[]','[]','[]','[]',NOW(),NOW())`,
    [id, data.name, data.username, data.email.toLowerCase(), data.password]
  );
  return getUserById(id);
}

export async function updateUser(id: string, updates: any) {
  cache.del(`user:${id}`);
  const setClauses: string[] = ["updated_at = NOW()"];
  const values: any[] = [];
  let idx = 1;
  const fieldMap: Record<string, string> = {
    name: "name", bio: "bio", phone: "phone", dateOfBirth: "date_of_birth",
    headline: "headline", website: "website", location: "location",
    profileImage: "profile_image", bannerImage: "banner_image",
    skills: "skills", experience: "experience", education: "education",
    followers: "followers", following: "following", connections: "connections",
    pendingConnections: "pending_connections", bookmarks: "bookmarks",
    followersCount: "followers_count", followingCount: "following_count", postsCount: "posts_count",
    clanId: "clan_id", clanName: "clan_name", clanLogo: "clan_logo",
    isVerified: "is_verified", isBoosted: "is_boosted", premiumTheme: "premium_theme",
    emailVerified: "email_verified", emailVerificationToken: "email_verification_token",
    passwordResetToken: "password_reset_token", passwordResetExpires: "password_reset_expires",
    lastOnline: "last_online", password: "password",
  };
  for (const [k, col] of Object.entries(fieldMap)) {
    if (updates[k] !== undefined) {
      const v = Array.isArray(updates[k]) ? JSON.stringify(updates[k]) : updates[k];
      setClauses.push(`${col} = $${idx++}`); values.push(v);
    }
  }
  if (values.length === 0) return getUserById(id);
  values.push(id);
  await query(`UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx}`, values);
  return getUserById(id);
}

export async function searchUsers(q: string, limit = 20) {
  const like = `%${q.toLowerCase()}%`;
  const rows = await query(
    `SELECT * FROM users WHERE LOWER(name) LIKE $1 OR LOWER(username) LIKE $1 LIMIT $2`,
    [like, limit]
  );
  return rows.map(mapUser).filter(Boolean);
}

// ── POSTS ─────────────────────────────────────────────────────────────────────
export async function getPosts(filters: any = {}, offset = 0, limit = 20) {
  let sql = `SELECT p.*,
    u.name as author_name, u.username as author_username, u.profile_image as author_image,
    u.email as author_email, u.is_verified as author_is_verified, u.email_verified as author_email_verified
    FROM posts p JOIN users u ON u.id = p.author_id`;
  const params: any[] = [];
  let idx = 1;
  const wheres: string[] = [];
  if (filters.authorId) { wheres.push(`p.author_id = $${idx++}`); params.push(filters.authorId); }
  if (filters.category) { wheres.push(`p.category = $${idx++}`); params.push(filters.category); }
  if (wheres.length) sql += " WHERE " + wheres.join(" AND ");
  sql += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);
  const rows = await query(sql, params);
  return rows.map(mapPost).filter(Boolean);
}

export async function getPostById(id: string) {
  const r = await queryOne(
    `SELECT p.*, u.name as author_name, u.username as author_username, u.profile_image as author_image,
     u.email as author_email, u.is_verified as author_is_verified, u.email_verified as author_email_verified
     FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id = $1`, [id]
  );
  return mapPost(r);
}

export async function createPost(data: any) {
  const id = randomUUID();
  const ts = now();
  await query(
    `INSERT INTO posts (id,author_id,content,images,videos,likes,bookmarks,reactions,shares,reshares,category,reposted_from,poll,views,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,'[]','[]','{}','[]',0,$6,$7,$8,0,$9,$9)`,
    [id, data.authorId, data.content || "", JSON.stringify(data.images || []),
     JSON.stringify(data.videos || []), data.category || "general",
     data.repostedFrom ? JSON.stringify(data.repostedFrom) : null,
     data.poll ? JSON.stringify(data.poll) : null, ts]
  );
  await query("UPDATE users SET posts_count = posts_count + 1 WHERE id = $1", [data.authorId]);
  cache.del(`user:${data.authorId}`);
  return getPostById(id);
}

export async function updatePost(id: string, updates: any) {
  const setClauses = ["updated_at = NOW()"];
  const values: any[] = [];
  let idx = 1;
  if (updates.likes !== undefined) { setClauses.push(`likes = $${idx++}`); values.push(JSON.stringify(updates.likes)); }
  if (updates.bookmarks !== undefined) { setClauses.push(`bookmarks = $${idx++}`); values.push(JSON.stringify(updates.bookmarks)); }
  if (updates.reactions !== undefined) { setClauses.push(`reactions = $${idx++}`); values.push(JSON.stringify(updates.reactions)); }
  if (updates.reshares !== undefined) { setClauses.push(`reshares = $${idx++}`); values.push(updates.reshares); }
  if (updates.views !== undefined) { setClauses.push(`views = $${idx++}`); values.push(updates.views); }
  if (values.length === 0) return getPostById(id);
  values.push(id);
  await query(`UPDATE posts SET ${setClauses.join(", ")} WHERE id = $${idx}`, values);
  return getPostById(id);
}

export async function deletePost(id: string) {
  const post = await getPostById(id);
  await query("DELETE FROM posts WHERE id = $1", [id]);
  if (post) {
    await query("UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = $1", [post.authorId]);
    cache.del(`user:${post.authorId}`);
  }
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
export async function getCommentsByPost(postId: string) {
  const rows = await query(
    `SELECT c.*, u.name as author_name, u.username as author_username, u.profile_image as author_image
     FROM comments c JOIN users u ON u.id = c.author_id WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows.map(mapComment).filter(Boolean);
}

export async function createComment(data: any) {
  const id = randomUUID();
  await query(
    `INSERT INTO comments (id,post_id,author_id,author_name,author_username,author_image,content,likes,parent_id,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'[]',$8,NOW(),NOW())`,
    [id, data.postId, data.authorId, data.authorName, data.authorUsername,
     data.authorImage || "", data.content, data.parentId || null]
  );
  const r = await queryOne("SELECT c.*, u.name as author_name, u.username as author_username, u.profile_image as author_image FROM comments c JOIN users u ON u.id = c.author_id WHERE c.id = $1", [id]);
  return mapComment(r);
}

export async function updateComment(id: string, updates: any) {
  if (updates.likes !== undefined) await query("UPDATE comments SET likes = $1, updated_at = NOW() WHERE id = $2", [JSON.stringify(updates.likes), id]);
  const r = await queryOne("SELECT c.*, u.name as author_name, u.username as author_username, u.profile_image as author_image FROM comments c JOIN users u ON u.id = c.author_id WHERE c.id = $1", [id]);
  return mapComment(r);
}

export async function deleteComment(id: string) {
  await query("DELETE FROM comments WHERE id = $1", [id]);
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────
export async function getNotifications(userId: string, offset = 0, limit = 30) {
  const rows = await query(
    "SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [userId, limit, offset]
  );
  return rows.map(mapNotification).filter(Boolean);
}

export async function getUnreadNotifCount(userId: string) {
  const r = await queryOne("SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read = false", [userId]);
  return parseInt(r?.count || "0", 10);
}

export async function createNotification(data: any) {
  const id = randomUUID();
  await query(
    `INSERT INTO notifications (id,recipient_id,sender_id,sender_name,sender_image,type,post_id,comment_id,message,read,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,NOW(),NOW())`,
    [id, data.recipientId, data.senderId, data.senderName, data.senderImage || "",
     data.type, data.postId || null, data.commentId || null, data.message || ""]
  );
}

export async function markNotificationsRead(userId: string) {
  await query("UPDATE notifications SET read = true WHERE recipient_id = $1", [userId]);
}

// ── CONVERSATIONS / MESSAGES ──────────────────────────────────────────────────
export async function getConversationsByUser(userId: string) {
  const rows = await query(
    "SELECT * FROM conversations WHERE participants @> $1 ORDER BY last_message_time DESC LIMIT 50",
    [JSON.stringify([userId])]
  );
  return rows.map(mapConversation).filter(Boolean);
}

export async function getConversationById(id: string) {
  return mapConversation(await queryOne("SELECT * FROM conversations WHERE id = $1", [id]));
}

export async function getConversationBetween(userId1: string, userId2: string) {
  const r = await queryOne(
    "SELECT * FROM conversations WHERE participants @> $1 AND participants @> $2 AND jsonb_array_length(participants) = 2",
    [JSON.stringify([userId1]), JSON.stringify([userId2])]
  );
  return mapConversation(r);
}

export async function createConversation(participants: string[]) {
  const id = randomUUID();
  await query(
    "INSERT INTO conversations (id,participants,last_message,unread_count,typing_users,created_at,updated_at) VALUES ($1,$2,'','{}'::jsonb,'{}'::jsonb,NOW(),NOW())",
    [id, JSON.stringify(participants)]
  );
  return getConversationById(id);
}

export async function updateConversation(id: string, updates: any) {
  const setClauses = ["updated_at = NOW()"];
  const values: any[] = [];
  let idx = 1;
  if (updates.lastMessage !== undefined) { setClauses.push(`last_message = $${idx++}`); values.push(updates.lastMessage); }
  if (updates.lastMessageTime !== undefined) { setClauses.push(`last_message_time = $${idx++}`); values.push(updates.lastMessageTime); }
  if (updates.unreadCount !== undefined) { setClauses.push(`unread_count = $${idx++}`); values.push(JSON.stringify(updates.unreadCount)); }
  if (updates.typingUsers !== undefined) { setClauses.push(`typing_users = $${idx++}`); values.push(JSON.stringify(updates.typingUsers)); }
  if (values.length === 0) return;
  values.push(id);
  await query(`UPDATE conversations SET ${setClauses.join(", ")} WHERE id = $${idx}`, values);
}

export async function getMessagesByConversation(conversationId: string, limit = 50, offset = 0) {
  const rows = await query(
    "SELECT * FROM messages WHERE conversation_id = $1 AND is_deleted = false ORDER BY created_at ASC LIMIT $2 OFFSET $3",
    [conversationId, limit, offset]
  );
  return rows.map(mapMessage).filter(Boolean);
}

export async function getUnreadMessageCount(userId: string) {
  const r = await queryOne(
    "SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND read = false AND is_deleted = false",
    [userId]
  );
  return parseInt(r?.count || "0", 10);
}

export async function createMessage(data: any) {
  const id = randomUUID();
  const ts = now();
  await query(
    `INSERT INTO messages (id,conversation_id,sender_id,sender_name,sender_image,receiver_id,content,media_url,media_type,reply_to_id,reply_to_content,reply_to_sender,reactions,read,edited,is_deleted,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'{}',false,false,false,$13,$13)`,
    [id, data.conversationId, data.senderId, data.senderName, data.senderImage || "",
     data.receiverId, data.content || "", data.mediaUrl || "", data.mediaType || "",
     data.replyToId || null, data.replyToContent || "", data.replyToSender || "", ts]
  );
  await updateConversation(data.conversationId, {
    lastMessage: data.content || (data.mediaUrl ? "Media" : ""),
    lastMessageTime: ts,
  });
  return mapMessage(await queryOne("SELECT * FROM messages WHERE id = $1", [id]));
}

export async function markMessagesRead(conversationId: string, receiverId: string) {
  await query("UPDATE messages SET read = true WHERE conversation_id = $1 AND receiver_id = $2 AND read = false", [conversationId, receiverId]);
}

export async function updateMessage(id: string, updates: any) {
  const setClauses = ["updated_at = NOW()"];
  const values: any[] = [];
  let idx = 1;
  if (updates.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(updates.content); }
  if (updates.edited !== undefined) { setClauses.push(`edited = $${idx++}`); values.push(updates.edited); }
  if (updates.isDeleted !== undefined) { setClauses.push(`is_deleted = $${idx++}`); values.push(updates.isDeleted); }
  if (updates.reactions !== undefined) { setClauses.push(`reactions = $${idx++}`); values.push(JSON.stringify(updates.reactions)); }
  if (values.length === 0) return mapMessage(await queryOne("SELECT * FROM messages WHERE id = $1", [id]));
  values.push(id);
  await query(`UPDATE messages SET ${setClauses.join(", ")} WHERE id = $${idx}`, values);
  return mapMessage(await queryOne("SELECT * FROM messages WHERE id = $1", [id]));
}

export async function reactToMessage(messageId: string, userId: string, emoji: string) {
  const msg = await mapMessage(await queryOne("SELECT * FROM messages WHERE id = $1", [messageId]));
  if (!msg) return null;
  const reactions: any = msg.reactions || {};
  if (!reactions[emoji]) reactions[emoji] = [];
  const i = reactions[emoji].indexOf(userId);
  if (i >= 0) reactions[emoji].splice(i, 1); else reactions[emoji].push(userId);
  if (!reactions[emoji].length) delete reactions[emoji];
  return updateMessage(messageId, { reactions });
}

// ── CLANS ─────────────────────────────────────────────────────────────────────
export async function getClans() {
  return (await query("SELECT * FROM clans ORDER BY created_at DESC", [])).map(mapClan).filter(Boolean);
}

export async function getClanById(id: string) {
  return mapClan(await queryOne("SELECT * FROM clans WHERE id = $1", [id]));
}

export async function getClanBySlug(slug: string) {
  return mapClan(await queryOne("SELECT * FROM clans WHERE slug = $1", [slug]));
}

export async function createClan(data: any) {
  const id = randomUUID();
  await query(
    "INSERT INTO clans (id,name,slug,logo,description,owner_id,owner_name,members,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())",
    [id, data.name, data.slug, data.logo || "", data.description || "", data.ownerId, data.ownerName, JSON.stringify([data.ownerId])]
  );
  return getClanById(id);
}

export async function updateClan(id: string, updates: any) {
  const setClauses = ["updated_at = NOW()"];
  const values: any[] = [];
  let idx = 1;
  if (updates.members !== undefined) { setClauses.push(`members = $${idx++}`); values.push(JSON.stringify(updates.members)); }
  if (updates.logo !== undefined) { setClauses.push(`logo = $${idx++}`); values.push(updates.logo); }
  if (updates.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(updates.description); }
  if (values.length === 0) return getClanById(id);
  values.push(id);
  await query(`UPDATE clans SET ${setClauses.join(", ")} WHERE id = $${idx}`, values);
  return getClanById(id);
}

export async function deleteClan(id: string) { await query("DELETE FROM clans WHERE id = $1", [id]); }

export async function getWorldChatMessages(clanId: string, since?: string) {
  if (since) {
    const rows = await query(
      "SELECT * FROM world_chat_messages WHERE clan_id = $1 AND created_at > $2 ORDER BY created_at ASC LIMIT 100",
      [clanId, since]
    );
    return rows.map(mapWorldChat).filter(Boolean);
  }
  const rows = await query(
    "SELECT * FROM world_chat_messages WHERE clan_id = $1 ORDER BY created_at ASC LIMIT 100",
    [clanId]
  );
  return rows.map(mapWorldChat).filter(Boolean);
}

export async function createWorldChatMessage(data: any) {
  const id = randomUUID();
  await query(
    "INSERT INTO world_chat_messages (id,clan_id,sender_id,sender_name,sender_username,sender_image,content,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())",
    [id, data.clanId, data.senderId, data.senderName, data.senderUsername, data.senderImage || "", data.content]
  );
  return mapWorldChat(await queryOne("SELECT * FROM world_chat_messages WHERE id = $1", [id]));
}

// ── STORE ─────────────────────────────────────────────────────────────────────
export async function getStoreItems() {
  return await query("SELECT * FROM store_items ORDER BY is_free DESC, price ASC", []);
}

export async function getUserStoreItems(userId: string) {
  return await query("SELECT * FROM user_store_items WHERE user_id = $1", [userId]);
}

export async function grantStoreItem(userId: string, itemId: string) {
  await query(
    "INSERT INTO user_store_items (id,user_id,item_id,equipped,created_at) VALUES ($1,$2,$3,false,NOW()) ON CONFLICT (user_id,item_id) DO NOTHING",
    [randomUUID(), userId, itemId]
  );
}

export async function equipStoreItem(userId: string, itemId: string, equipped: boolean) {
  await query("UPDATE user_store_items SET equipped = $1 WHERE user_id = $2 AND item_id = $3", [equipped, userId, itemId]);
}

// ── UPLOAD CHUNKS ─────────────────────────────────────────────────────────────
export async function saveChunk(data: any) {
  await query(
    `INSERT INTO upload_chunks (id,upload_id,chunk_index,total_chunks,filename,mime_type,subfolder,data,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (upload_id,chunk_index) DO UPDATE SET data = EXCLUDED.data`,
    [randomUUID(), data.uploadId, data.chunkIndex, data.totalChunks, data.filename, data.mimeType, data.subfolder || "", data.buffer, data.userId]
  );
}

export async function getChunks(uploadId: string) {
  return await query("SELECT * FROM upload_chunks WHERE upload_id = $1 ORDER BY chunk_index ASC", [uploadId]);
}

export async function countChunks(uploadId: string) {
  const r = await queryOne("SELECT COUNT(*) as count FROM upload_chunks WHERE upload_id = $1", [uploadId]);
  return parseInt(r?.count || "0", 10);
}

export async function deleteChunks(uploadId: string) {
  await query("DELETE FROM upload_chunks WHERE upload_id = $1", [uploadId]);
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export async function savePayment(data: any) {
  await query(
    `INSERT INTO payments (id,user_id,plan_id,reference,amount,status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (reference) DO NOTHING`,
    [randomUUID(), data.userId, data.planId, data.reference, data.amount, data.status || "success"]
  );
}

// ── CALLS ─────────────────────────────────────────────────────────────────────
export async function saveCallSignal(data: any) {
  try {
    await query(
      `INSERT INTO call_signals (id,session_id,from_user_id,to_user_id,type,payload,created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT DO NOTHING`,
      [randomUUID(), data.sessionId, data.fromUserId, data.toUserId, data.type, JSON.stringify(data.payload || {})]
    );
  } catch {}
}

export async function getCallSignals(userId: string, sessionId: string) {
  try {
    const rows = await query(
      "SELECT * FROM call_signals WHERE to_user_id = $1 AND session_id = $2 ORDER BY created_at ASC",
      [userId, sessionId]
    );
    return rows;
  } catch { return []; }
}

export async function getIncomingCall(userId: string) {
  try {
    const since = new Date(Date.now() - 30000).toISOString();
    const r = await queryOne(
      `SELECT cs.*, u.name as caller_name, u.profile_image as caller_image
       FROM call_signals cs JOIN users u ON u.id = cs.from_user_id
       WHERE cs.to_user_id = $1 AND cs.type = 'offer' AND cs.created_at > $2 ORDER BY cs.created_at DESC LIMIT 1`,
      [userId, since]
    );
    if (!r) return null;
    return { sessionId: r.session_id, callerId: r.from_user_id, callerName: r.caller_name, callerImage: r.caller_image || "", callType: (r.payload?.callType) || "voice" };
  } catch { return null; }
}

// ── STORIES ───────────────────────────────────────────────────────────────────
export async function getStories() {
  const rows = await query("SELECT * FROM stories WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 100", []);
  return rows.map(r => r ? { _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name, authorUsername: r.author_username, authorImage: r.author_image || "", content: r.content || "", image: r.image || "", expiresAt: r.expires_at, createdAt: r.created_at } : null).filter(Boolean);
}

export async function createStory(data: any) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await query(
    "INSERT INTO stories (id,author_id,author_name,author_username,author_image,content,image,expires_at,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())",
    [id, data.authorId, data.authorName, data.authorUsername, data.authorImage || "", data.content || "", data.image || "", expiresAt]
  );
  return await queryOne("SELECT * FROM stories WHERE id = $1", [id]);
}
