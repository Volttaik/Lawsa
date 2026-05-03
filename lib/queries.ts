import { turso, ensureSchema } from './db';
import { randomUUID } from 'crypto';

const J = (v: any) => typeof v === 'string' ? v : JSON.stringify(v ?? null)
const P = (v: any, def: any = null) => {
  if (v === null || v === undefined) return def
  if (typeof v === 'string') { try { return JSON.parse(v) } catch { return def } }
  return v
}
const B = (v: any) => v === 1 || v === true || v === '1'
const now = () => new Date().toISOString()

async function q(sql: string, args: any[] = []) {
  await ensureSchema()
  const db = turso()
  const result = await db.execute({ sql, args })
  return result.rows
}

async function run(sql: string, args: any[] = []) {
  await ensureSchema()
  const db = turso()
  await db.execute({ sql, args })
}

// ── MAPPERS ──────────────────────────────────────────────────────────────────
export function mapUser(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, name: r.name, username: r.username,
    email: r.email, password: r.password,
    profileImage: r.profile_image || '', bannerImage: r.banner_image || '',
    bio: r.bio || '', phone: r.phone || '', dateOfBirth: r.date_of_birth || '',
    headline: r.headline || '', website: r.website || '', location: r.location || '',
    skills: P(r.skills, []), followers: P(r.followers, []),
    following: P(r.following, []), connections: P(r.connections, []),
    pendingConnections: P(r.pending_connections, []),
    bookmarks: P(r.bookmarks, []), experience: P(r.experience, []),
    education: P(r.education, []),
    clanId: r.clan_id || '', clanName: r.clan_name || '', clanLogo: r.clan_logo || '',
    isVerified: B(r.is_verified), isBoosted: B(r.is_boosted), premiumTheme: B(r.premium_theme),
    lastOnline: r.last_online, createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapPost(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name,
    authorUsername: r.author_username, authorImage: r.author_image || '',
    content: r.content || '', images: P(r.images, []), videos: P(r.videos, []),
    likes: P(r.likes, []), bookmarks: P(r.bookmarks, []),
    reactions: P(r.reactions, {}), shares: P(r.shares, []),
    reshares: r.reshares || 0, category: r.category || 'general',
    repostedFrom: P(r.reposted_from, null), poll: P(r.poll, null),
    views: r.views || 0, comments: [],
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapComment(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, postId: r.post_id, authorId: r.author_id,
    authorName: r.author_name, authorUsername: r.author_username,
    authorImage: r.author_image || '', content: r.content,
    likes: P(r.likes, []), parentId: r.parent_id || null,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapNotification(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, recipientId: r.recipient_id, senderId: r.sender_id,
    senderName: r.sender_name, senderImage: r.sender_image || '',
    type: r.type, postId: r.post_id, commentId: r.comment_id,
    message: r.message || '', read: B(r.read),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapMessage(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, conversationId: r.conversation_id,
    senderId: r.sender_id, senderName: r.sender_name, senderImage: r.sender_image || '',
    receiverId: r.receiver_id, content: r.content || '',
    mediaUrl: r.media_url || '', mediaType: r.media_type || '',
    read: B(r.read), edited: B(r.edited), isDeleted: B(r.is_deleted),
    replyToId: r.reply_to_id || null, replyToContent: r.reply_to_content || '',
    replyToSender: r.reply_to_sender || '', reactions: P(r.reactions, {}),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapConversation(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, participants: P(r.participants, []),
    lastMessage: r.last_message || '', lastMessageTime: r.last_message_time,
    unreadCount: P(r.unread_count, {}), typingUsers: P(r.typing_users, {}),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapStory(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name,
    authorUsername: r.author_username, authorImage: r.author_image || '',
    content: r.content || '', image: r.image || '',
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapClan(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, name: r.name, slug: r.slug, logo: r.logo || '',
    description: r.description || '', ownerId: r.owner_id, ownerName: r.owner_name,
    members: P(r.members, []), createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapWorldChat(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, clanId: r.clan_id, senderId: r.sender_id,
    senderName: r.sender_name, senderUsername: r.sender_username,
    senderImage: r.sender_image || '', content: r.content, createdAt: r.created_at,
  }
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export async function getUserById(id: string) {
  const rows = await q('SELECT * FROM users WHERE id = ?', [id])
  return mapUser(rows[0])
}

export async function getUserByEmail(email: string) {
  const rows = await q('SELECT * FROM users WHERE email = ?', [email.toLowerCase()])
  return mapUser(rows[0])
}

export async function getUserByEmailOrUsername(val: string) {
  const v = val.toLowerCase()
  const rows = await q('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1', [v, v])
  return mapUser(rows[0])
}

export async function createUser(data: any) {
  const id = randomUUID()
  await run(
    `INSERT INTO users (id,name,username,email,password,profile_image,phone,date_of_birth,
      skills,followers,following,connections,pending_connections,bookmarks,experience,education)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, data.name, data.username.toLowerCase().trim(), data.email.toLowerCase().trim(),
     data.password, data.profileImage || '', data.phone || '', data.dateOfBirth || '',
     '[]','[]','[]','[]','[]','[]','[]','[]']
  )
  return getUserById(id)
}

export async function updateUser(id: string, updates: any) {
  const fields: string[] = []
  const vals: any[] = []
  const map: Record<string, string> = {
    name:'name', bio:'bio', headline:'headline', website:'website', location:'location',
    profileImage:'profile_image', bannerImage:'banner_image',
    clanId:'clan_id', clanName:'clan_name', clanLogo:'clan_logo',
    lastOnline:'last_online', phone:'phone',
    isVerified:'is_verified', isBoosted:'is_boosted', premiumTheme:'premium_theme',
  }
  for (const [k, col] of Object.entries(map)) {
    if (updates[k] !== undefined) {
      fields.push(`${col} = ?`)
      vals.push(typeof updates[k] === 'boolean' ? (updates[k] ? 1 : 0) : updates[k])
    }
  }
  const jsonMap: Record<string, string> = {
    skills:'skills', followers:'followers', following:'following',
    connections:'connections', pendingConnections:'pending_connections',
    bookmarks:'bookmarks', experience:'experience', education:'education',
  }
  for (const [k, col] of Object.entries(jsonMap)) {
    if (updates[k] !== undefined) { fields.push(`${col} = ?`); vals.push(J(updates[k])) }
  }
  if (!fields.length) return getUserById(id)
  fields.push('updated_at = ?'); vals.push(now())
  vals.push(id)
  await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals)
  return getUserById(id)
}

export async function updateUserLastOnline(id: string) {
  await run('UPDATE users SET last_online = ? WHERE id = ?', [now(), id])
}

export async function findUsers(search: string, page: number, limit: number, excludeId: string) {
  const skip = (page - 1) * limit
  if (search) {
    const like = `%${search}%`
    const rows = await q(
      'SELECT * FROM users WHERE id != ? AND (name LIKE ? OR username LIKE ?) LIMIT ? OFFSET ?',
      [excludeId, like, like, limit, skip]
    )
    return rows.map(mapUser)
  }
  const rows = await q('SELECT * FROM users WHERE id != ? LIMIT ? OFFSET ?', [excludeId, limit, skip])
  return rows.map(mapUser)
}

export async function getUserRecommendations(userId: string, following: string[], limit = 5) {
  const exclude = [userId, ...following]
  const placeholders = exclude.map(() => '?').join(',')
  const rows = await q(
    `SELECT * FROM users WHERE id NOT IN (${placeholders}) ORDER BY created_at DESC LIMIT ?`,
    [...exclude, limit + 5]
  )
  return rows.map(mapUser)
}

export async function toggleFollow(currentId: string, targetId: string) {
  const [current, target] = await Promise.all([getUserById(currentId), getUserById(targetId)])
  if (!current || !target) return null
  const isFollowing = (current.following || []).includes(targetId)
  const newCF = isFollowing ? current.following.filter((id: string) => id !== targetId) : [...current.following, targetId]
  const newTF = isFollowing ? target.followers.filter((id: string) => id !== currentId) : [...target.followers, currentId]
  await Promise.all([
    run('UPDATE users SET following = ?, updated_at = ? WHERE id = ?', [J(newCF), now(), currentId]),
    run('UPDATE users SET followers = ?, updated_at = ? WHERE id = ?', [J(newTF), now(), targetId]),
  ])
  return { following: !isFollowing }
}

// ── POSTS ─────────────────────────────────────────────────────────────────────
export async function getPostById(id: string) {
  const rows = await q('SELECT * FROM posts WHERE id = ?', [id])
  if (!rows[0]) return null
  const post = mapPost(rows[0])
  if (!post) return null
  post.comments = (await getCommentsByPostId(id, null)).filter(c => c !== null) as any
  return post
}

export async function getPosts(filter: any = {}, skip = 0, limit = 10) {
  let sql = 'SELECT * FROM posts'
  const args: any[] = []
  const conds: string[] = []
  if (filter.category && filter.category !== 'all') { conds.push('category = ?'); args.push(filter.category) }
  if (filter.authorId) { conds.push('author_id = ?'); args.push(filter.authorId) }
  if (conds.length) sql += ` WHERE ${conds.join(' AND ')}`
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  args.push(limit, skip)
  const rows = await q(sql, args)
  const posts = rows.map(mapPost)
  await Promise.all(posts.map(async (p: any) => { p.comments = await getCommentsByPostId(p._id, null) }))
  return posts
}

export async function countPosts(filter: any = {}) {
  let sql = 'SELECT COUNT(*) as cnt FROM posts'
  const args: any[] = []
  if (filter.category && filter.category !== 'all') { sql += ' WHERE category = ?'; args.push(filter.category) }
  const rows = await q(sql, args)
  return Number((rows[0] as any)?.cnt || 0)
}

export async function createPost(data: any) {
  const id = randomUUID()
  await run(
    `INSERT INTO posts (id,author_id,author_name,author_username,author_image,content,
     images,videos,likes,bookmarks,reactions,shares,reshares,category,reposted_from,poll)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, data.authorId, data.authorName, data.authorUsername, data.authorImage || '',
     data.content || '', J(data.images || []), J(data.videos || []),
     '[]','[]','{}','[]', 0, data.category || 'general',
     data.repostedFrom ? J(data.repostedFrom) : null,
     data.poll ? J(data.poll) : null]
  )
  return getPostById(id)
}

export async function deletePost(id: string) {
  await run('DELETE FROM comments WHERE post_id = ?', [id])
  await run('DELETE FROM posts WHERE id = ?', [id])
}

export async function toggleLike(postId: string, userId: string) {
  const rows = await q('SELECT likes FROM posts WHERE id = ?', [postId])
  const likes: string[] = P((rows[0] as any)?.likes, [])
  const liked = likes.includes(userId)
  const newLikes = liked ? likes.filter(id => id !== userId) : [...likes, userId]
  await run('UPDATE posts SET likes = ?, updated_at = ? WHERE id = ?', [J(newLikes), now(), postId])
  return { liked: !liked, likesCount: newLikes.length }
}

export async function getPostLikes(postId: string) {
  const rows = await q('SELECT likes FROM posts WHERE id = ?', [postId])
  return P((rows[0] as any)?.likes, [])
}

export async function toggleBookmark(postId: string, userId: string) {
  const [postRows, userRows] = await Promise.all([
    q('SELECT bookmarks FROM posts WHERE id = ?', [postId]),
    q('SELECT bookmarks FROM users WHERE id = ?', [userId]),
  ])
  const postBm: string[] = P((postRows[0] as any)?.bookmarks, [])
  const userBm: string[] = P((userRows[0] as any)?.bookmarks, [])
  const bookmarked = userBm.includes(postId)
  const newPostBm = bookmarked ? postBm.filter(id => id !== userId) : [...postBm, userId]
  const newUserBm = bookmarked ? userBm.filter(id => id !== postId) : [...userBm, postId]
  await Promise.all([
    run('UPDATE posts SET bookmarks = ? WHERE id = ?', [J(newPostBm), postId]),
    run('UPDATE users SET bookmarks = ? WHERE id = ?', [J(newUserBm), userId]),
  ])
  return { bookmarked: !bookmarked }
}

export async function addReaction(postId: string, userId: string, emoji: string) {
  const rows = await q('SELECT reactions FROM posts WHERE id = ?', [postId])
  const reactions: any = P((rows[0] as any)?.reactions, {})
  if (!reactions[emoji]) reactions[emoji] = []
  const idx = reactions[emoji].indexOf(userId)
  if (idx >= 0) reactions[emoji].splice(idx, 1)
  else reactions[emoji].push(userId)
  if (!reactions[emoji].length) delete reactions[emoji]
  await run('UPDATE posts SET reactions = ? WHERE id = ?', [J(reactions), postId])
  return reactions
}

export async function repostPost(original: any, me: any) {
  const existing = await getExistingRepost(me._id, original._id)
  if (existing) {
    await deletePost(existing._id)
    const newReshares = Math.max(0, (original.reshares || 1) - 1)
    await run('UPDATE posts SET reshares = ? WHERE id = ?', [newReshares, original._id])
    return { reposted: false, reshares: newReshares }
  }
  await createPost({
    authorId: me._id, authorName: me.name, authorUsername: me.username,
    authorImage: me.profileImage || '', content: '', category: original.category || 'general',
    repostedFrom: { _id: original._id, authorName: original.authorName, authorUsername: original.authorUsername, authorImage: original.authorImage || '', content: original.content, images: original.images || [] },
  })
  const newReshares = (original.reshares || 0) + 1
  await run('UPDATE posts SET reshares = ? WHERE id = ?', [newReshares, original._id])
  return { reposted: true, reshares: newReshares }
}

export async function getExistingRepost(authorId: string, originalId: string) {
  const rows = await q(
    "SELECT * FROM posts WHERE author_id = ? AND json_extract(reposted_from, '$._id') = ? LIMIT 1",
    [authorId, originalId]
  )
  return mapPost(rows[0])
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
export async function getCommentsByPostId(postId: string, parentId?: string | null) {
  if (parentId === null || parentId === undefined) {
    const rows = await q('SELECT * FROM comments WHERE post_id = ? AND parent_id IS NULL ORDER BY created_at DESC', [postId])
    return rows.map(mapComment)
  }
  const rows = await q('SELECT * FROM comments WHERE post_id = ? AND parent_id = ? ORDER BY created_at DESC', [postId, parentId])
  return rows.map(mapComment)
}

export async function createComment(data: any) {
  const id = randomUUID()
  await run(
    'INSERT INTO comments (id,post_id,author_id,author_name,author_username,author_image,content,likes,parent_id) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, data.postId, data.authorId, data.authorName, data.authorUsername, data.authorImage || '', data.content, '[]', data.parentId || null]
  )
  const rows = await q('SELECT * FROM comments WHERE id = ?', [id])
  return mapComment(rows[0])
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export async function getNotifications(recipientId: string, limit = 50) {
  const rows = await q('SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT ?', [recipientId, limit])
  return rows.map(mapNotification)
}

export async function createNotification(data: any) {
  const id = randomUUID()
  await run(
    'INSERT INTO notifications (id,recipient_id,sender_id,sender_name,sender_image,type,post_id,comment_id,message,read) VALUES (?,?,?,?,?,?,?,?,?,0)',
    [id, data.recipientId, data.senderId, data.senderName, data.senderImage || '', data.type, data.postId || null, data.commentId || null, data.message || '']
  )
}

export async function markNotificationsRead(recipientId: string) {
  await run('UPDATE notifications SET read = 1 WHERE recipient_id = ?', [recipientId])
}

export async function countUnreadNotifications(recipientId: string) {
  const rows = await q('SELECT COUNT(*) as cnt FROM notifications WHERE recipient_id = ? AND read = 0', [recipientId])
  return Number((rows[0] as any)?.cnt || 0)
}

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
export async function getConversationsByUser(userId: string) {
  const rows = await q(
    "SELECT * FROM conversations WHERE participants LIKE ? ORDER BY last_message_time DESC",
    [`%${userId}%`]
  )
  return rows.map(mapConversation).filter((c: any) => (c.participants || []).includes(userId))
}

export async function getConversationById(id: string) {
  const rows = await q('SELECT * FROM conversations WHERE id = ?', [id])
  return mapConversation(rows[0])
}

export async function findConversationByParticipants(participants: string[]) {
  const sorted = [...participants].sort()
  const rows = await q(
    "SELECT * FROM conversations WHERE participants LIKE ? AND participants LIKE ?",
    [`%${sorted[0]}%`, `%${sorted[1]}%`]
  )
  const found = rows.map(mapConversation).find((c: any) => {
    const p = c.participants || []
    return p.length === sorted.length && sorted.every((s: string) => p.includes(s))
  })
  return found || null
}

export async function createConversation(participants: string[]) {
  const id = randomUUID()
  const sorted = [...participants].sort()
  await run(
    'INSERT INTO conversations (id,participants,last_message,last_message_time,unread_count,typing_users) VALUES (?,?,?,?,?,?)',
    [id, J(sorted), '', now(), '{}', '{}']
  )
  const rows = await q('SELECT * FROM conversations WHERE id = ?', [id])
  return mapConversation(rows[0])
}

export async function updateConversation(id: string, data: any) {
  const fields: string[] = []
  const vals: any[] = []
  if (data.lastMessage !== undefined) { fields.push('last_message = ?'); vals.push(data.lastMessage) }
  if (data.lastMessageTime !== undefined) { fields.push('last_message_time = ?'); vals.push(typeof data.lastMessageTime === 'object' ? data.lastMessageTime.toISOString() : data.lastMessageTime) }
  if (data.typingUsers !== undefined) { fields.push('typing_users = ?'); vals.push(J(data.typingUsers)) }
  if (!fields.length) return
  fields.push('updated_at = ?'); vals.push(now()); vals.push(id)
  await run(`UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`, vals)
}

export async function getMessages(conversationId: string) {
  const rows = await q('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [conversationId])
  return rows.map(mapMessage)
}

export async function createMessage(data: any) {
  const id = randomUUID()
  await run(
    `INSERT INTO messages (id,conversation_id,sender_id,sender_name,sender_image,receiver_id,
     content,media_url,media_type,reply_to_id,reply_to_content,reply_to_sender,reactions,read,edited,is_deleted)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0)`,
    [id, data.conversationId, data.senderId, data.senderName, data.senderImage || '',
     data.receiverId, data.content || '', data.mediaUrl || '', data.mediaType || '',
     data.replyToId || null, data.replyToContent || '', data.replyToSender || '', '{}']
  )
  const rows = await q('SELECT * FROM messages WHERE id = ?', [id])
  return mapMessage(rows[0])
}

export async function markMessagesRead(conversationId: string, receiverId: string) {
  await run('UPDATE messages SET read = 1 WHERE conversation_id = ? AND receiver_id = ? AND read = 0', [conversationId, receiverId])
}

export async function getMessageById(id: string) {
  const rows = await q('SELECT * FROM messages WHERE id = ?', [id])
  return mapMessage(rows[0])
}

export async function updateMessage(id: string, updates: any) {
  const fields: string[] = []
  const vals: any[] = []
  if (updates.content !== undefined) { fields.push('content = ?'); vals.push(updates.content) }
  if (updates.edited !== undefined) { fields.push('edited = ?'); vals.push(updates.edited ? 1 : 0) }
  if (updates.isDeleted !== undefined) { fields.push('is_deleted = ?'); vals.push(updates.isDeleted ? 1 : 0) }
  if (updates.mediaUrl !== undefined) { fields.push('media_url = ?'); vals.push(updates.mediaUrl) }
  if (updates.mediaType !== undefined) { fields.push('media_type = ?'); vals.push(updates.mediaType) }
  if (updates.reactions !== undefined) { fields.push('reactions = ?'); vals.push(J(updates.reactions)) }
  if (!fields.length) return getMessageById(id)
  fields.push('updated_at = ?'); vals.push(now()); vals.push(id)
  await run(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`, vals)
  return getMessageById(id)
}

export async function reactToMessage(messageId: string, userId: string, emoji: string) {
  const msg = await getMessageById(messageId)
  if (!msg) return null
  const reactions: any = msg.reactions || {}
  if (!reactions[emoji]) reactions[emoji] = []
  const idx = reactions[emoji].indexOf(userId)
  if (idx >= 0) reactions[emoji].splice(idx, 1)
  else reactions[emoji].push(userId)
  if (!reactions[emoji].length) delete reactions[emoji]
  return updateMessage(messageId, { reactions })
}

export async function updateTypingUsers(conversationId: string, userId: string) {
  const conv = await getConversationById(conversationId)
  if (!conv) return
  const typingUsers: any = conv.typingUsers || {}
  typingUsers[userId] = new Date(Date.now() + 3500).toISOString()
  await updateConversation(conversationId, { typingUsers })
}

// ── STORIES ───────────────────────────────────────────────────────────────────
export async function getStories() {
  const rows = await q('SELECT * FROM stories ORDER BY created_at DESC LIMIT 100', [])
  return rows.map(mapStory)
}

export async function getStoriesByUser(userId: string) {
  const rows = await q('SELECT * FROM stories WHERE author_id = ? ORDER BY created_at DESC', [userId])
  return rows.map(mapStory)
}

export async function createStory(data: any) {
  const id = randomUUID()
  await run(
    'INSERT INTO stories (id,author_id,author_name,author_username,author_image,content,image) VALUES (?,?,?,?,?,?,?)',
    [id, data.authorId, data.authorName, data.authorUsername, data.authorImage || '', data.content || '', data.image || '']
  )
  const rows = await q('SELECT * FROM stories WHERE id = ?', [id])
  return mapStory(rows[0])
}

// ── CLANS ─────────────────────────────────────────────────────────────────────
export async function getClans() {
  const rows = await q('SELECT * FROM clans ORDER BY created_at DESC', [])
  return rows.map(mapClan)
}

export async function getClanById(id: string) {
  const rows = await q('SELECT * FROM clans WHERE id = ?', [id])
  return mapClan(rows[0])
}

export async function getClanBySlug(slug: string) {
  const rows = await q('SELECT * FROM clans WHERE slug = ?', [slug])
  return mapClan(rows[0])
}

export async function createClan(data: any) {
  const id = randomUUID()
  const members = J([data.ownerId])
  await run(
    'INSERT INTO clans (id,name,slug,logo,description,owner_id,owner_name,members) VALUES (?,?,?,?,?,?,?,?)',
    [id, data.name, data.slug, data.logo || '', data.description || '', data.ownerId, data.ownerName, members]
  )
  const rows = await q('SELECT * FROM clans WHERE id = ?', [id])
  return mapClan(rows[0])
}

export async function updateClan(id: string, updates: any) {
  const fields: string[] = []
  const vals: any[] = []
  if (updates.members !== undefined) { fields.push('members = ?'); vals.push(J(updates.members)) }
  if (updates.logo !== undefined) { fields.push('logo = ?'); vals.push(updates.logo) }
  if (updates.description !== undefined) { fields.push('description = ?'); vals.push(updates.description) }
  if (!fields.length) return getClanById(id)
  fields.push('updated_at = ?'); vals.push(now()); vals.push(id)
  await run(`UPDATE clans SET ${fields.join(', ')} WHERE id = ?`, vals)
  return getClanById(id)
}

export async function deleteClan(id: string) {
  await run('DELETE FROM clans WHERE id = ?', [id])
}

export async function getWorldChatMessages(clanId: string, since?: string) {
  if (since) {
    const rows = await q('SELECT * FROM world_chat_messages WHERE clan_id = ? AND created_at > ? ORDER BY created_at ASC LIMIT 100', [clanId, since])
    return rows.map(mapWorldChat)
  }
  const rows = await q('SELECT * FROM world_chat_messages WHERE clan_id = ? ORDER BY created_at ASC LIMIT 100', [clanId])
  return rows.map(mapWorldChat)
}

export async function createWorldChatMessage(data: any) {
  const id = randomUUID()
  await run(
    'INSERT INTO world_chat_messages (id,clan_id,sender_id,sender_name,sender_username,sender_image,content) VALUES (?,?,?,?,?,?,?)',
    [id, data.clanId, data.senderId, data.senderName, data.senderUsername, data.senderImage || '', data.content]
  )
  const rows = await q('SELECT * FROM world_chat_messages WHERE id = ?', [id])
  return mapWorldChat(rows[0])
}

// ── UPLOAD CHUNKS ─────────────────────────────────────────────────────────────
export async function saveChunk(data: any) {
  const id = randomUUID()
  await run(
    `INSERT INTO upload_chunks (id,upload_id,chunk_index,total_chunks,filename,mime_type,subfolder,data,user_id)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(upload_id,chunk_index) DO UPDATE SET data = excluded.data`,
    [id, data.uploadId, data.chunkIndex, data.totalChunks, data.filename, data.mimeType, data.subfolder || '', data.buffer, data.userId]
  )
}

export async function getChunks(uploadId: string) {
  return q('SELECT * FROM upload_chunks WHERE upload_id = ? ORDER BY chunk_index', [uploadId])
}

export async function countChunks(uploadId: string) {
  const rows = await q('SELECT COUNT(*) as cnt FROM upload_chunks WHERE upload_id = ?', [uploadId])
  return Number((rows[0] as any)?.cnt || 0)
}

export async function deleteChunks(uploadId: string) {
  await run('DELETE FROM upload_chunks WHERE upload_id = ?', [uploadId])
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export async function savePayment(data: any) {
  const id = randomUUID()
  await run(
    'INSERT OR IGNORE INTO payments (id,user_id,plan_id,reference,amount,status) VALUES (?,?,?,?,?,?)',
    [id, data.userId, data.planId, data.reference, data.amount, data.status || 'success']
  )
}
