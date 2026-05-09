import { getPool } from './db'
import { cache } from './cache'
import { randomUUID } from 'crypto'

const now = () => new Date().toISOString()

async function query(sql: string, params: any[] = []) {
  const pool = getPool()
  const result = await pool.query(sql, params)
  return result.rows
}

async function queryOne(sql: string, params: any[] = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

// ── MAPPERS ──────────────────────────────────────────────────────────────────
export function mapUser(r: any) {
  if (!r) return null
  const followers: string[] = r.followers || []
  const following: string[] = r.following || []
  return {
    _id: r.id, id: r.id, name: r.name, username: r.username,
    email: r.email, password: r.password,
    profileImage: r.profile_image || '', bannerImage: r.banner_image || '',
    bio: r.bio || '', phone: r.phone || '', dateOfBirth: r.date_of_birth || '',
    headline: r.headline || '', website: r.website || '', location: r.location || '',
    skills: r.skills || [], followers, following,
    connections: r.connections || [],
    pendingConnections: r.pending_connections || [],
    bookmarks: r.bookmarks || [], experience: r.experience || [],
    education: r.education || [],
    followersCount: typeof r.followers_count === 'number' ? r.followers_count : followers.length,
    followingCount: typeof r.following_count === 'number' ? r.following_count : following.length,
    postsCount: typeof r.posts_count === 'number' ? r.posts_count : 0,
    clanId: r.clan_id || '', clanName: r.clan_name || '', clanLogo: r.clan_logo || '',
    isSpecial: r.email?.toLowerCase() === 'onyeaghorlouis@gmail.com',
    isVerified: r.email?.toLowerCase() === 'onyeaghorlouis@gmail.com' ? true : !!r.is_verified,
    isBoosted: !!r.is_boosted, premiumTheme: !!r.premium_theme,
    emailVerified: !!r.email_verified,
    emailVerificationToken: r.email_verification_token || '',
    passwordResetToken: r.password_reset_token || '',
    lastOnline: r.last_online, createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapPost(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name,
    authorUsername: r.author_username, authorImage: r.author_image || '',
    authorIsSpecial: r.author_email?.toLowerCase() === 'onyeaghorlouis@gmail.com',
    authorIsVerified: r.author_email?.toLowerCase() === 'onyeaghorlouis@gmail.com' ? true : !!r.author_is_verified,
    authorEmailVerified: !!r.author_email_verified,
    content: r.content || '', images: r.images || [], videos: r.videos || [],
    likes: r.likes || [], bookmarks: r.bookmarks || [],
    reactions: r.reactions || {}, shares: r.shares || [],
    reshares: r.reshares || 0, category: r.category || 'general',
    repostedFrom: r.reposted_from || null, poll: r.poll || null,
    views: r.views || 0, comments: [] as any[],
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapComment(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, postId: r.post_id, authorId: r.author_id,
    authorName: r.author_name, authorUsername: r.author_username,
    authorImage: r.author_image || '', content: r.content,
    likes: r.likes || [], parentId: r.parent_id || null,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapNotification(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, recipientId: r.recipient_id, senderId: r.sender_id,
    senderName: r.sender_name, senderImage: r.sender_image || '',
    type: r.type, postId: r.post_id || null, commentId: r.comment_id || null,
    message: r.message || '', read: !!r.read,
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
    read: !!r.read, edited: !!r.edited, isDeleted: !!r.is_deleted,
    replyToId: r.reply_to_id || null, replyToContent: r.reply_to_content || '',
    replyToSender: r.reply_to_sender || '', reactions: r.reactions || {},
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapConversation(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, participants: r.participants || [],
    lastMessage: r.last_message || '', lastMessageTime: r.last_message_time,
    unreadCount: r.unread_count || {}, typingUsers: r.typing_users || {},
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapStory(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name,
    authorUsername: r.author_username, authorImage: r.author_image || '',
    content: r.content || '', image: r.image || '',
    expiresAt: r.expires_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapClan(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, name: r.name, slug: r.slug, logo: r.logo || '',
    description: r.description || '', ownerId: r.owner_id, ownerName: r.owner_name,
    members: r.members || [], createdAt: r.created_at, updatedAt: r.updated_at,
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
  const key = `user:${id}`
  const hit = cache.get<ReturnType<typeof mapUser>>(key)
  if (hit !== null) return hit
  const r = await queryOne('SELECT * FROM users WHERE id = $1', [id])
  const result = mapUser(r)
  cache.set(key, result, 120)
  return result
}

export async function getUsersByIds(ids: string[]) {
  if (!ids.length) return []
  const unique = [...new Set(ids)]
  const cached: Record<string, any> = {}
  const missing: string[] = []
  for (const id of unique) {
    const hit = cache.get<any>(`user:${id}`)
    if (hit !== null) cached[id] = hit
    else missing.push(id)
  }
  if (missing.length) {
    const placeholders = missing.map((_, i) => `$${i + 1}`).join(',')
    const rows = await query(`SELECT * FROM users WHERE id IN (${placeholders})`, missing)
    for (const row of rows) {
      const u = mapUser(row)
      cache.set(`user:${row.id}`, u, 30)
      cached[row.id] = u
    }
  }
  return unique.map(id => cached[id] || null).filter(Boolean)
}

export async function getUserByEmail(email: string) {
  const r = await queryOne('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
  return mapUser(r)
}

export async function getUserByEmailOrUsername(val: string) {
  const v = val.toLowerCase()
  const r = await queryOne('SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1', [v])
  return mapUser(r)
}

export async function getUserByVerificationToken(token: string) {
  const r = await queryOne('SELECT * FROM users WHERE email_verification_token = $1', [token])
  return mapUser(r)
}

export async function getUserByResetToken(token: string) {
  const r = await queryOne(
    'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
    [token]
  )
  return mapUser(r)
}

export async function createUser(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO users (
      id, name, username, email, password, profile_image, phone, date_of_birth,
      skills, followers, following, connections, pending_connections, bookmarks,
      experience, education, email_verified, email_verification_token
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [
      id, data.name,
      data.username.toLowerCase().trim(),
      data.email.toLowerCase().trim(),
      data.password,
      data.profileImage || '',
      data.phone || '',
      data.dateOfBirth || '',
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      false,
      data.emailVerificationToken || '',
    ]
  )
  return getUserById(id)
}

export async function updateUser(id: string, updates: any) {
  cache.invalidate(`user:${id}`)
  const setClauses: string[] = ['updated_at = NOW()']
  const values: any[] = []
  let idx = 1

  const scalarMap: Record<string, string> = {
    name: 'name', bio: 'bio', headline: 'headline', website: 'website', location: 'location',
    profileImage: 'profile_image', bannerImage: 'banner_image',
    clanId: 'clan_id', clanName: 'clan_name', clanLogo: 'clan_logo',
    lastOnline: 'last_online', phone: 'phone',
    isVerified: 'is_verified', isBoosted: 'is_boosted', premiumTheme: 'premium_theme',
    emailVerified: 'email_verified', emailVerificationToken: 'email_verification_token',
    emailVerificationCode: 'email_verification_code', emailVerificationCodeExpires: 'email_verification_code_expires',
    passwordResetToken: 'password_reset_token', passwordResetExpires: 'password_reset_expires',
    password: 'password',
  }
  for (const [k, col] of Object.entries(scalarMap)) {
    if (updates[k] !== undefined) {
      setClauses.push(`${col} = $${idx++}`)
      values.push(updates[k])
    }
  }

  const jsonMap: Record<string, string> = {
    skills: 'skills', followers: 'followers', following: 'following',
    connections: 'connections', pendingConnections: 'pending_connections',
    bookmarks: 'bookmarks', experience: 'experience', education: 'education',
  }
  for (const [k, col] of Object.entries(jsonMap)) {
    if (updates[k] !== undefined) {
      setClauses.push(`${col} = $${idx++}`)
      values.push(JSON.stringify(updates[k]))
    }
  }

  if (values.length === 0) return getUserById(id)
  values.push(id)
  await query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}`, values)
  return getUserById(id)
}

export async function updateUserLastOnline(id: string) {
  await query('UPDATE users SET last_online = NOW() WHERE id = $1', [id])
}

export async function findUsers(search: string, page: number, limit: number, excludeId: string) {
  const skip = (page - 1) * limit
  if (search) {
    return (await query(
      `SELECT * FROM users WHERE id != $1 AND (name ILIKE $2 OR username ILIKE $2)
       LIMIT $3 OFFSET $4`,
      [excludeId, `%${search}%`, limit, skip]
    )).map(mapUser)
  }
  return (await query(
    'SELECT * FROM users WHERE id != $1 LIMIT $2 OFFSET $3',
    [excludeId, limit, skip]
  )).map(mapUser)
}

export async function getUserRecommendations(userId: string, following: string[], limit = 5) {
  const exclude = [userId, ...following]
  const placeholders = exclude.map((_, i) => `$${i + 1}`).join(',')
  const rows = await query(
    `SELECT * FROM users WHERE id NOT IN (${placeholders}) ORDER BY created_at DESC LIMIT $${exclude.length + 1}`,
    [...exclude, limit + 5]
  )
  return rows.map(mapUser)
}

export async function toggleFollow(currentId: string, targetId: string) {
  const [current, target] = await Promise.all([getUserById(currentId), getUserById(targetId)])
  if (!current || !target) return null
  const isFollowing = (current.following || []).includes(targetId)
  const newCF = isFollowing
    ? current.following.filter((id: string) => id !== targetId)
    : [...current.following, targetId]
  const newTF = isFollowing
    ? target.followers.filter((id: string) => id !== currentId)
    : [...target.followers, currentId]
  await Promise.all([
    query('UPDATE users SET following = $1, following_count = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(newCF), newCF.length, currentId]),
    query('UPDATE users SET followers = $1, followers_count = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(newTF), newTF.length, targetId]),
  ])
  cache.invalidate(`user:${currentId}`)
  cache.invalidate(`user:${targetId}`)
  if (!isFollowing) {
    createSocialEvent({
      type: 'follow', actorId: currentId, actorName: current.name,
      actorUsername: current.username, actorImage: current.profileImage || '',
      recipientId: targetId, targetId, targetType: 'user',
      metadata: { targetName: target.name, targetUsername: target.username },
    }).catch(() => {})
  } else {
    removeSocialEvent('follow', currentId, targetId).catch(() => {})
  }
  return { following: !isFollowing, followingCount: newCF.length, followersCount: newTF.length }
}

export async function countPostsByAuthor(authorId: string): Promise<number> {
  const r = await queryOne(
    'SELECT COUNT(*) as count FROM posts WHERE author_id = $1 AND reposted_from IS NULL',
    [authorId]
  )
  return parseInt(r?.count || '0', 10)
}

// ── SOCIAL EVENTS ─────────────────────────────────────────────────────────────
export function mapSocialEvent(r: any) {
  if (!r) return null
  return {
    _id: r.id as string, id: r.id as string,
    type: r.type as string, actorId: r.actor_id as string,
    actorName: r.actor_name as string, actorUsername: r.actor_username as string,
    actorImage: (r.actor_image || '') as string, recipientId: (r.recipient_id || '') as string,
    targetId: (r.target_id || '') as string, targetType: (r.target_type || '') as string,
    metadata: (r.metadata || {}) as Record<string, any>,
    status: r.status as string, createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }
}

export async function createSocialEvent(data: {
  type: string; actorId: string; actorName: string; actorUsername: string;
  actorImage?: string; recipientId?: string; targetId?: string;
  targetType?: string; metadata?: Record<string, any>;
}): Promise<string> {
  const id = randomUUID()
  await query(
    `INSERT INTO social_events (id, type, actor_id, actor_name, actor_username, actor_image,
     recipient_id, target_id, target_type, metadata, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [id, data.type, data.actorId, data.actorName, data.actorUsername,
     data.actorImage || '', data.recipientId || '', data.targetId || '',
     data.targetType || '', JSON.stringify(data.metadata || {}), 'active']
  )
  return id
}

export async function removeSocialEvent(type: string, actorId: string, targetId: string): Promise<void> {
  await query(
    `UPDATE social_events SET status = 'removed', updated_at = NOW()
     WHERE type = $1 AND actor_id = $2 AND target_id = $3 AND status = 'active'`,
    [type, actorId, targetId]
  )
}

export async function socialEventExists(type: string, actorId: string, targetId: string): Promise<boolean> {
  const r = await queryOne(
    `SELECT COUNT(*) as count FROM social_events WHERE type = $1 AND actor_id = $2 AND target_id = $3 AND status = 'active'`,
    [type, actorId, targetId]
  )
  return parseInt(r?.count || '0', 10) > 0
}

export async function countSocialEvents(
  type: string, field: 'recipient_id' | 'actor_id' | 'target_id', id: string
): Promise<number> {
  const r = await queryOne(
    `SELECT COUNT(*) as count FROM social_events WHERE type = $1 AND ${field} = $2 AND status = 'active'`,
    [type, id]
  )
  return parseInt(r?.count || '0', 10)
}

export async function getFollowerEvents(userId: string) {
  const rows = await query(
    `SELECT * FROM social_events WHERE type = 'follow' AND recipient_id = $1 AND status = 'active' ORDER BY created_at DESC`,
    [userId]
  )
  return rows.map(mapSocialEvent).filter(Boolean)
}

export async function getFollowingEvents(userId: string) {
  const rows = await query(
    `SELECT * FROM social_events WHERE type = 'follow' AND actor_id = $1 AND status = 'active' ORDER BY created_at DESC`,
    [userId]
  )
  return rows.map(mapSocialEvent).filter(Boolean)
}

export async function getPostLikeActors(postId: string): Promise<string[]> {
  const rows = await query(
    `SELECT actor_id FROM social_events WHERE type = 'like' AND target_id = $1 AND status = 'active'`,
    [postId]
  )
  return rows.map((r: any) => r.actor_id)
}

export async function getRecentActivityForUser(userId: string, limit = 20) {
  const rows = await query(
    `SELECT * FROM social_events WHERE recipient_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  )
  return rows.map(mapSocialEvent).filter(Boolean)
}

// ── POSTS ─────────────────────────────────────────────────────────────────────
export async function getPostById(id: string) {
  const r = await queryOne(
    `SELECT p.*, u.is_verified as author_is_verified, u.email_verified as author_email_verified, u.email as author_email,
     COALESCE(NULLIF(p.author_image,''), u.profile_image, '') as author_image
     FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = $1`,
    [id]
  )
  if (!r) return null
  const post = mapPost(r)
  if (!post) return null
  post.comments = (await getCommentsByPostId(id, null)).filter((c: any) => c !== null)
  return post
}

export async function getPosts(filter: any = {}, skip = 0, limit = 10) {
  let sql = `SELECT p.*, u.is_verified as author_is_verified, u.email_verified as author_email_verified, u.email as author_email,
    COALESCE(NULLIF(p.author_image,''), u.profile_image, '') as author_image
    FROM posts p LEFT JOIN users u ON p.author_id = u.id`
  const params: any[] = []
  const where: string[] = []
  if (filter.category && filter.category !== 'all') {
    where.push(`p.category = $${params.length + 1}`)
    params.push(filter.category)
  }
  if (filter.authorId) {
    where.push(`p.author_id = $${params.length + 1}`)
    params.push(filter.authorId)
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  params.push(limit, skip)
  const posts = (await query(sql, params)).map(mapPost)
  for (const p of posts as any[]) { p.commentsCount = 0; p.comments = [] }
  return posts
}

export async function countPosts(filter: any = {}) {
  let sql = 'SELECT COUNT(*) as count FROM posts'
  const params: any[] = []
  const where: string[] = []
  if (filter.category && filter.category !== 'all') {
    where.push(`category = $${params.length + 1}`)
    params.push(filter.category)
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  const r = await queryOne(sql, params)
  return parseInt(r?.count || '0', 10)
}

export async function createPost(data: any) {
  cache.invalidate('posts:')
  const id = randomUUID()
  await query(
    `INSERT INTO posts (id, author_id, author_name, author_username, author_image, content,
     images, videos, likes, bookmarks, reactions, shares, reshares, category, reposted_from, poll)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [id, data.authorId, data.authorName, data.authorUsername, data.authorImage || '',
     data.content || '', JSON.stringify(data.images || []), JSON.stringify(data.videos || []),
     JSON.stringify([]), JSON.stringify([]), JSON.stringify({}), JSON.stringify([]),
     0, data.category || 'general',
     data.repostedFrom ? JSON.stringify(data.repostedFrom) : null,
     data.poll ? JSON.stringify(data.poll) : null]
  )
  if (!data.repostedFrom) {
    countPostsByAuthor(data.authorId)
      .then(count => query('UPDATE users SET posts_count = $1 WHERE id = $2', [count, data.authorId]))
      .catch(() => {})
  }
  return getPostById(id)
}

export async function deletePost(id: string) {
  cache.invalidate('posts:')
  const r = await queryOne('SELECT author_id, reposted_from FROM posts WHERE id = $1', [id])
  const authorId = r?.author_id
  const isRepost = !!r?.reposted_from
  await Promise.all([
    query('DELETE FROM comments WHERE post_id = $1', [id]),
    query('DELETE FROM posts WHERE id = $1', [id]),
  ])
  if (authorId && !isRepost) {
    countPostsByAuthor(authorId)
      .then(count => query('UPDATE users SET posts_count = $1 WHERE id = $2', [count, authorId]))
      .catch(() => {})
  }
}

export async function toggleLike(postId: string, userId: string) {
  cache.invalidate('posts:')
  const r = await queryOne('SELECT likes, author_id, content FROM posts WHERE id = $1', [postId])
  const likes: string[] = r?.likes || []
  const liked = likes.includes(userId)
  const newLikes = liked ? likes.filter((id: string) => id !== userId) : [...likes, userId]
  await query('UPDATE posts SET likes = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(newLikes), postId])
  getUserById(userId).then(actor => {
    if (!actor) return
    if (!liked) {
      createSocialEvent({
        type: 'like', actorId: userId, actorName: actor.name,
        actorUsername: actor.username, actorImage: actor.profileImage || '',
        recipientId: r?.author_id || '', targetId: postId, targetType: 'post',
        metadata: { postContent: (r?.content || '').slice(0, 120) },
      }).catch(() => {})
    } else {
      removeSocialEvent('like', userId, postId).catch(() => {})
    }
  }).catch(() => {})
  return { liked: !liked, likesCount: newLikes.length }
}

export async function getPostLikes(postId: string) {
  const r = await queryOne('SELECT likes FROM posts WHERE id = $1', [postId])
  return r?.likes || []
}

export async function toggleBookmark(postId: string, userId: string) {
  const [postRow, userRow] = await Promise.all([
    queryOne('SELECT bookmarks FROM posts WHERE id = $1', [postId]),
    queryOne('SELECT bookmarks FROM users WHERE id = $1', [userId]),
  ])
  const postBm: string[] = postRow?.bookmarks || []
  const userBm: string[] = userRow?.bookmarks || []
  const bookmarked = userBm.includes(postId)
  const newPostBm = bookmarked ? postBm.filter((id: string) => id !== userId) : [...postBm, userId]
  const newUserBm = bookmarked ? userBm.filter((id: string) => id !== postId) : [...userBm, postId]
  await Promise.all([
    query('UPDATE posts SET bookmarks = $1 WHERE id = $2', [JSON.stringify(newPostBm), postId]),
    query('UPDATE users SET bookmarks = $1 WHERE id = $2', [JSON.stringify(newUserBm), userId]),
  ])
  cache.invalidate(`user:${userId}`)
  return { bookmarked: !bookmarked }
}

export async function addReaction(postId: string, userId: string, emoji: string) {
  const r = await queryOne('SELECT reactions FROM posts WHERE id = $1', [postId])
  const reactions: any = r?.reactions || {}
  if (!reactions[emoji]) reactions[emoji] = []
  const idx = reactions[emoji].indexOf(userId)
  if (idx >= 0) reactions[emoji].splice(idx, 1)
  else reactions[emoji].push(userId)
  if (!reactions[emoji].length) delete reactions[emoji]
  await query('UPDATE posts SET reactions = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(reactions), postId])
  return reactions
}

export async function repostPost(original: any, me: any) {
  const existing = await getExistingRepost(me._id, original._id)
  if (existing) {
    await deletePost(existing._id)
    const newReshares = Math.max(0, (original.reshares || 1) - 1)
    await query('UPDATE posts SET reshares = $1 WHERE id = $2', [newReshares, original._id])
    removeSocialEvent('repost', me._id, original._id).catch(() => {})
    return { reposted: false, reshares: newReshares }
  }
  const newReshares = (original.reshares || 0) + 1
  await query('UPDATE posts SET reshares = $1 WHERE id = $2', [newReshares, original._id])
  await createPost({
    authorId: me._id, authorName: me.name, authorUsername: me.username,
    authorImage: me.profileImage || '', content: '', category: original.category || 'general',
    repostedFrom: {
      _id: original._id, authorName: original.authorName, authorUsername: original.authorUsername,
      authorImage: original.authorImage || '', content: original.content || '',
      images: original.images || [], createdAt: original.createdAt,
      originalAuthorName: original.authorName, originalAuthorUsername: original.authorUsername,
    },
  })
  createSocialEvent({
    type: 'repost', actorId: me._id, actorName: me.name,
    actorUsername: me.username, actorImage: me.profileImage || '',
    recipientId: original.authorId, targetId: original._id, targetType: 'post',
    metadata: { originalAuthorName: original.authorName, originalAuthorUsername: original.authorUsername },
  }).catch(() => {})
  return { reposted: true, reshares: newReshares }
}

export async function getExistingRepost(authorId: string, originalId: string) {
  const rows = await query(
    'SELECT * FROM posts WHERE author_id = $1 AND reposted_from IS NOT NULL LIMIT 50',
    [authorId]
  )
  const found = rows.find((p: any) => p.reposted_from?._id === originalId)
  return mapPost(found || null)
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
export async function getCommentsByPostId(postId: string, parentId?: string | null) {
  if (parentId === null || parentId === undefined) {
    const rows = await query(
      'SELECT * FROM comments WHERE post_id = $1 AND parent_id IS NULL ORDER BY created_at DESC',
      [postId]
    )
    return rows.map(mapComment)
  }
  const rows = await query(
    'SELECT * FROM comments WHERE post_id = $1 AND parent_id = $2 ORDER BY created_at DESC',
    [postId, parentId]
  )
  return rows.map(mapComment)
}

export async function createComment(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO comments (id, post_id, author_id, author_name, author_username, author_image, content, likes, parent_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, data.postId, data.authorId, data.authorName, data.authorUsername,
     data.authorImage || '', data.content, JSON.stringify([]), data.parentId || null]
  )
  const r = await queryOne('SELECT * FROM comments WHERE id = $1', [id])
  getPostById(data.postId).then(post => {
    if (!post) return
    createSocialEvent({
      type: 'comment', actorId: data.authorId, actorName: data.authorName,
      actorUsername: data.authorUsername, actorImage: data.authorImage || '',
      recipientId: post.authorId, targetId: data.postId, targetType: 'post',
      metadata: {
        commentId: id, commentContent: data.content.slice(0, 120),
        postContent: (post.content || '').slice(0, 80), parentId: data.parentId || null,
      },
    }).catch(() => {})
  }).catch(() => {})
  return mapComment(r)
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export async function getNotifications(recipientId: string, limit = 50) {
  const rows = await query(
    'SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT $2',
    [recipientId, limit]
  )
  return rows.map(mapNotification)
}

export async function createNotification(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO notifications (id, recipient_id, sender_id, sender_name, sender_image, type, post_id, comment_id, message, read)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, data.recipientId, data.senderId, data.senderName, data.senderImage || '',
     data.type, data.postId || null, data.commentId || null, data.message || '', false]
  )
  return { id }
}

export async function markNotificationsRead(recipientId: string) {
  await query('UPDATE notifications SET read = true WHERE recipient_id = $1 AND read = false', [recipientId])
}

export async function markNotificationRead(notificationId: string) {
  await query('UPDATE notifications SET read = true WHERE id = $1', [notificationId])
}

export async function countUnreadNotifications(recipientId: string) {
  const r = await queryOne(
    `SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read = false AND type != 'message'`,
    [recipientId]
  )
  return parseInt(r?.count || '0', 10)
}

export async function countUnreadMessages(userId: string): Promise<number> {
  const rows = await query(
    "SELECT unread_count FROM conversations WHERE participants @> $1::jsonb",
    [JSON.stringify([userId])]
  )
  let count = 0
  for (const conv of rows) {
    const unread = conv.unread_count || {}
    if ((unread[userId] || 0) > 0) count++
  }
  return count
}

export async function deleteNotification(id: string) {
  await query('DELETE FROM notifications WHERE id = $1', [id])
}

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
export async function getConversationsByUser(userId: string) {
  const rows = await query(
    "SELECT id,participants,last_message,last_message_time,unread_count,typing_users,created_at,updated_at FROM conversations WHERE participants @> $1::jsonb ORDER BY last_message_time DESC",
    [JSON.stringify([userId])]
  )
  return rows.map(mapConversation).filter((c: any) => (c.participants || []).includes(userId))
}

export async function getConversationById(id: string) {
  const r = await queryOne(
    'SELECT id,participants,last_message,last_message_time,unread_count,typing_users,created_at,updated_at FROM conversations WHERE id = $1',
    [id]
  )
  return mapConversation(r)
}

export async function findConversationByParticipants(participants: string[]) {
  const sorted = [...participants].sort()
  const rows = await query(
    "SELECT * FROM conversations WHERE participants @> $1::jsonb AND participants @> $2::jsonb",
    [JSON.stringify([sorted[0]]), JSON.stringify([sorted[1]])]
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
  await query(
    `INSERT INTO conversations (id, participants, last_message, last_message_time, unread_count, typing_users)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, JSON.stringify(sorted), '', now(), JSON.stringify({}), JSON.stringify({})]
  )
  const r = await queryOne('SELECT * FROM conversations WHERE id = $1', [id])
  return mapConversation(r)
}

export async function updateConversation(id: string, data: any) {
  const setClauses: string[] = ['updated_at = NOW()']
  const values: any[] = []
  let idx = 1
  if (data.lastMessage !== undefined) { setClauses.push(`last_message = $${idx++}`); values.push(data.lastMessage) }
  if (data.lastMessageTime !== undefined) {
    const t = typeof data.lastMessageTime === 'object' ? data.lastMessageTime.toISOString() : data.lastMessageTime
    setClauses.push(`last_message_time = $${idx++}`); values.push(t)
  }
  if (data.typingUsers !== undefined) { setClauses.push(`typing_users = $${idx++}`); values.push(JSON.stringify(data.typingUsers)) }
  if (data.unreadCount !== undefined) { setClauses.push(`unread_count = $${idx++}`); values.push(JSON.stringify(data.unreadCount)) }
  if (values.length === 0) return
  values.push(id)
  await query(`UPDATE conversations SET ${setClauses.join(', ')} WHERE id = $${idx}`, values)
}

// ── MESSAGES ─────────────────────────────────────────────────────────────────
export async function getMessages(conversationId: string) {
  const key = `msgs:${conversationId}`
  const hit = cache.get<any[]>(key)
  if (hit !== null) return hit
  const rows = await query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  )
  const result = rows.map(mapMessage)
  cache.set(key, result, 4)
  return result
}

export function invalidateMessages(conversationId: string) {
  cache.invalidate(`msgs:${conversationId}`)
}

export async function createMessage(data: any) {
  invalidateMessages(data.conversationId)
  const id = randomUUID()
  const ts = now()
  await query(
    `INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_image, receiver_id,
     content, media_url, media_type, reply_to_id, reply_to_content, reply_to_sender, reactions,
     read, edited, is_deleted, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$17)`,
    [id, data.conversationId, data.senderId, data.senderName, data.senderImage || '',
     data.receiverId, data.content || '', data.mediaUrl || '', data.mediaType || '',
     data.replyToId || null, data.replyToContent || '', data.replyToSender || '',
     JSON.stringify({}), false, false, false, ts]
  )
  await updateConversation(data.conversationId, {
    lastMessage: data.content || (data.mediaUrl ? '📎 Media' : ''),
    lastMessageTime: ts,
  })
  const r = await queryOne('SELECT * FROM messages WHERE id = $1', [id])
  return mapMessage(r)
}

export async function markMessagesRead(conversationId: string, receiverId: string) {
  await query(
    'UPDATE messages SET read = true WHERE conversation_id = $1 AND receiver_id = $2 AND read = false',
    [conversationId, receiverId]
  )
}

export async function getMessageById(id: string) {
  const r = await queryOne('SELECT * FROM messages WHERE id = $1', [id])
  return mapMessage(r)
}

export async function updateMessage(id: string, updates: any) {
  const setClauses: string[] = ['updated_at = NOW()']
  const values: any[] = []
  let idx = 1
  if (updates.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(updates.content) }
  if (updates.edited !== undefined) { setClauses.push(`edited = $${idx++}`); values.push(updates.edited) }
  if (updates.isDeleted !== undefined) { setClauses.push(`is_deleted = $${idx++}`); values.push(updates.isDeleted) }
  if (updates.mediaUrl !== undefined) { setClauses.push(`media_url = $${idx++}`); values.push(updates.mediaUrl) }
  if (updates.mediaType !== undefined) { setClauses.push(`media_type = $${idx++}`); values.push(updates.mediaType) }
  if (updates.reactions !== undefined) { setClauses.push(`reactions = $${idx++}`); values.push(JSON.stringify(updates.reactions)) }
  if (values.length === 0) return getMessageById(id)
  values.push(id)
  await query(`UPDATE messages SET ${setClauses.join(', ')} WHERE id = $${idx}`, values)
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
  const rows = await query('SELECT * FROM stories ORDER BY created_at DESC LIMIT 100', [])
  return rows.map(mapStory)
}

export async function getStoriesByUser(userId: string) {
  const rows = await query('SELECT * FROM stories WHERE author_id = $1 ORDER BY created_at DESC', [userId])
  return rows.map(mapStory)
}

export async function createStory(data: any) {
  const id = randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await query(
    `INSERT INTO stories (id, author_id, author_name, author_username, author_image, content, image, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, data.authorId, data.authorName, data.authorUsername, data.authorImage || '',
     data.content || '', data.image || '', expiresAt]
  )
  const r = await queryOne('SELECT * FROM stories WHERE id = $1', [id])
  return mapStory(r)
}

// ── CLANS ─────────────────────────────────────────────────────────────────────
export async function getClans() {
  const rows = await query('SELECT * FROM clans ORDER BY created_at DESC', [])
  return rows.map(mapClan)
}

export async function getClanById(id: string) {
  const r = await queryOne('SELECT * FROM clans WHERE id = $1', [id])
  return mapClan(r)
}

export async function getClanBySlug(slug: string) {
  const r = await queryOne('SELECT * FROM clans WHERE slug = $1', [slug])
  return mapClan(r)
}

export async function createClan(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO clans (id, name, slug, logo, description, owner_id, owner_name, members)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, data.name, data.slug, data.logo || '', data.description || '',
     data.ownerId, data.ownerName, JSON.stringify([data.ownerId])]
  )
  const r = await queryOne('SELECT * FROM clans WHERE id = $1', [id])
  return mapClan(r)
}

export async function updateClan(id: string, updates: any) {
  const setClauses: string[] = ['updated_at = NOW()']
  const values: any[] = []
  let idx = 1
  if (updates.members !== undefined) { setClauses.push(`members = $${idx++}`); values.push(JSON.stringify(updates.members)) }
  if (updates.logo !== undefined) { setClauses.push(`logo = $${idx++}`); values.push(updates.logo) }
  if (updates.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(updates.description) }
  if (values.length === 0) return getClanById(id)
  values.push(id)
  await query(`UPDATE clans SET ${setClauses.join(', ')} WHERE id = $${idx}`, values)
  return getClanById(id)
}

export async function deleteClan(id: string) {
  await query('DELETE FROM clans WHERE id = $1', [id])
}

export async function getWorldChatMessages(clanId: string, since?: string) {
  if (since) {
    const rows = await query(
      'SELECT * FROM world_chat_messages WHERE clan_id = $1 AND created_at > $2 ORDER BY created_at ASC LIMIT 100',
      [clanId, since]
    )
    return rows.map(mapWorldChat)
  }
  const rows = await query(
    'SELECT * FROM world_chat_messages WHERE clan_id = $1 ORDER BY created_at ASC LIMIT 100',
    [clanId]
  )
  return rows.map(mapWorldChat)
}

export async function createWorldChatMessage(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO world_chat_messages (id, clan_id, sender_id, sender_name, sender_username, sender_image, content)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, data.clanId, data.senderId, data.senderName, data.senderUsername, data.senderImage || '', data.content]
  )
  const r = await queryOne('SELECT * FROM world_chat_messages WHERE id = $1', [id])
  return mapWorldChat(r)
}

// ── UPLOAD CHUNKS ─────────────────────────────────────────────────────────────
export async function saveChunk(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO upload_chunks (id, upload_id, chunk_index, total_chunks, filename, mime_type, subfolder, data, user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (upload_id, chunk_index) DO UPDATE SET data = EXCLUDED.data`,
    [id, data.uploadId, data.chunkIndex, data.totalChunks, data.filename,
     data.mimeType, data.subfolder || '', data.buffer, data.userId]
  )
}

export async function getChunks(uploadId: string) {
  return await query('SELECT * FROM upload_chunks WHERE upload_id = $1 ORDER BY chunk_index ASC', [uploadId])
}

export async function countChunks(uploadId: string) {
  const r = await queryOne('SELECT COUNT(*) as count FROM upload_chunks WHERE upload_id = $1', [uploadId])
  return parseInt(r?.count || '0', 10)
}

export async function deleteChunks(uploadId: string) {
  await query('DELETE FROM upload_chunks WHERE upload_id = $1', [uploadId])
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export async function savePayment(data: any) {
  const id = randomUUID()
  await query(
    `INSERT INTO payments (id, user_id, plan_id, reference, amount, status)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (reference) DO NOTHING`,
    [id, data.userId, data.planId, data.reference, data.amount, data.status || 'success']
  )
}
