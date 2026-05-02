import { supabase, pg, ensureSchema } from './db'

// ── MAPPERS ────────────────────────────────────────────────────────────────────
export function mapUser(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, name: r.name, username: r.username, email: r.email,
    password: r.password, profileImage: r.profile_image || '', bannerImage: r.banner_image || '',
    bio: r.bio || '', phone: r.phone || '', dateOfBirth: r.date_of_birth || '',
    headline: r.headline || '', website: r.website || '', location: r.location || '',
    skills: r.skills || [], followers: r.followers || [], following: r.following || [],
    connections: r.connections || [], pendingConnections: r.pending_connections || [],
    lastOnline: r.last_online, clanId: r.clan_id || '', clanName: r.clan_name || '',
    clanLogo: r.clan_logo || '', bookmarks: r.bookmarks || [],
    experience: r.experience || [], education: r.education || [],
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export function mapPost(r: any) {
  if (!r) return null
  return {
    _id: r.id, id: r.id, authorId: r.author_id, authorName: r.author_name,
    authorUsername: r.author_username, authorImage: r.author_image || '',
    content: r.content || '', images: r.images || [], videos: r.videos || [],
    likes: r.likes || [], bookmarks: r.bookmarks || [], reactions: r.reactions || {},
    shares: r.shares || [], reshares: r.reshares || 0, category: r.category || 'general',
    repostedFrom: r.reposted_from || null, poll: r.poll || null,
    comments: r.comments || [], createdAt: r.created_at, updatedAt: r.updated_at,
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
    type: r.type, postId: r.post_id, commentId: r.comment_id,
    message: r.message || '', read: r.read || false,
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
    read: r.read || false, edited: r.edited || false, isDeleted: r.is_deleted || false,
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

// ── HELPERS ────────────────────────────────────────────────────────────────────
async function init() { await ensureSchema() }

async function sbQuery<T>(table: string, builder: (q: any) => any): Promise<T[]> {
  const sb = supabase()!
  const { data, error } = await builder(sb.from(table))
  if (error) throw error
  return data || []
}

async function pgQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  const { rows } = await pg().query(sql, params)
  return rows
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export async function getUserById(id: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('users').select('*').eq('id', id).single()
    return mapUser(data)
  }
  const rows = await pgQuery('SELECT * FROM users WHERE id = $1', [id])
  return mapUser(rows[0])
}

export async function getUserByEmail(email: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('users').select('*').eq('email', email.toLowerCase()).single()
    return mapUser(data)
  }
  const rows = await pgQuery('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
  return mapUser(rows[0])
}

export async function getUserByEmailOrUsername(val: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('users').select('*')
      .or(`email.eq.${val.toLowerCase()},username.eq.${val.toLowerCase()}`).single()
    return mapUser(data)
  }
  const rows = await pgQuery(
    'SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1',
    [val.toLowerCase()]
  )
  return mapUser(rows[0])
}

export async function createUser(data: any) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data: row, error } = await sb.from('users').insert({
      name: data.name, username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(), password: data.password,
      profile_image: data.profileImage || '', bio: '', phone: data.phone || '',
      date_of_birth: data.dateOfBirth || '', skills: [], followers: [], following: [],
      bookmarks: [],
    }).select().single()
    if (error) throw error
    return mapUser(row)
  }
  const rows = await pgQuery(
    `INSERT INTO users (name, username, email, password, profile_image, phone, date_of_birth)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.name, data.username.toLowerCase().trim(), data.email.toLowerCase().trim(),
     data.password, data.profileImage || '', data.phone || '', data.dateOfBirth || '']
  )
  return mapUser(rows[0])
}

export async function updateUser(id: string, updates: any) {
  await init()
  const sb = supabase()
  const dbUpdates: any = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio
  if (updates.headline !== undefined) dbUpdates.headline = updates.headline
  if (updates.website !== undefined) dbUpdates.website = updates.website
  if (updates.location !== undefined) dbUpdates.location = updates.location
  if (updates.skills !== undefined) dbUpdates.skills = updates.skills
  if (updates.profileImage !== undefined) dbUpdates.profile_image = updates.profileImage
  if (updates.bannerImage !== undefined) dbUpdates.banner_image = updates.bannerImage
  if (updates.clanId !== undefined) dbUpdates.clan_id = updates.clanId
  if (updates.clanName !== undefined) dbUpdates.clan_name = updates.clanName
  if (updates.clanLogo !== undefined) dbUpdates.clan_logo = updates.clanLogo
  if (updates.lastOnline !== undefined) dbUpdates.last_online = updates.lastOnline
  if (updates.experience !== undefined) dbUpdates.experience = updates.experience
  if (updates.education !== undefined) dbUpdates.education = updates.education
  dbUpdates.updated_at = new Date()

  if (sb) {
    const { data } = await sb.from('users').update(dbUpdates).eq('id', id).select().single()
    return mapUser(data)
  }
  const keys = Object.keys(dbUpdates)
  const vals = Object.values(dbUpdates)
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const rows = await pgQuery(`UPDATE users SET ${sets} WHERE id = $1 RETURNING *`, [id, ...vals])
  return mapUser(rows[0])
}

export async function updateUserLastOnline(id: string) {
  const sb = supabase()
  if (sb) { await sb.from('users').update({ last_online: new Date() }).eq('id', id); return }
  await pg().query('UPDATE users SET last_online = NOW() WHERE id = $1', [id])
}

export async function findUsers(search: string, page: number, limit: number, excludeId: string) {
  await init()
  const sb = supabase()
  const skip = (page - 1) * limit
  if (sb) {
    let q = sb.from('users').select('*').neq('id', excludeId).range(skip, skip + limit - 1)
    if (search) q = q.or(`name.ilike.%${search}%,username.ilike.%${search}%`)
    const { data } = await q
    return (data || []).map(mapUser)
  }
  if (search) {
    const rows = await pgQuery(
      `SELECT * FROM users WHERE id != $1 AND (name ILIKE $2 OR username ILIKE $2)
       LIMIT $3 OFFSET $4`,
      [excludeId, `%${search}%`, limit, skip]
    )
    return rows.map(mapUser)
  }
  const rows = await pgQuery(
    'SELECT * FROM users WHERE id != $1 LIMIT $2 OFFSET $3',
    [excludeId, limit, skip]
  )
  return rows.map(mapUser)
}

export async function getUserRecommendations(userId: string, following: string[], limit = 5) {
  await init()
  const sb = supabase()
  const exclude = [userId, ...following]
  if (sb) {
    const { data } = await sb.from('users').select('*')
      .not('id', 'in', `(${exclude.map(e => `'${e}'`).join(',')})`)
      .limit(limit + 5)
    return (data || []).map(mapUser)
  }
  const placeholders = exclude.map((_, i) => `$${i + 2}`).join(',')
  const rows = await pgQuery(
    `SELECT * FROM users WHERE id NOT IN (${placeholders}) LIMIT $1`,
    [limit + 5, ...exclude]
  )
  return rows.map(mapUser)
}

export async function toggleFollow(currentId: string, targetId: string) {
  await init()
  const [current, target] = await Promise.all([getUserById(currentId), getUserById(targetId)])
  if (!current || !target) return null
  const isFollowing = (current.following || []).includes(targetId)
  let newCurrentFollowing: string[], newTargetFollowers: string[]
  if (isFollowing) {
    newCurrentFollowing = current.following.filter((id: string) => id !== targetId)
    newTargetFollowers = target.followers.filter((id: string) => id !== currentId)
  } else {
    newCurrentFollowing = [...current.following, targetId]
    newTargetFollowers = [...target.followers, currentId]
  }
  const sb = supabase()
  if (sb) {
    await Promise.all([
      sb.from('users').update({ following: newCurrentFollowing }).eq('id', currentId),
      sb.from('users').update({ followers: newTargetFollowers }).eq('id', targetId),
    ])
  } else {
    await Promise.all([
      pg().query('UPDATE users SET following = $1 WHERE id = $2', [newCurrentFollowing, currentId]),
      pg().query('UPDATE users SET followers = $1 WHERE id = $2', [newTargetFollowers, targetId]),
    ])
  }
  return { following: !isFollowing }
}

// ── POSTS ─────────────────────────────────────────────────────────────────────
export async function getPostById(id: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('posts').select('*').eq('id', id).single()
    if (!data) return null
    const post = mapPost(data)
    const comments = await getCommentsByPostId(id)
    post.comments = comments
    return post
  }
  const rows = await pgQuery('SELECT * FROM posts WHERE id = $1', [id])
  if (!rows[0]) return null
  const post = mapPost(rows[0])
  const comments = await getCommentsByPostId(id)
  post.comments = comments
  return post
}

export async function getPosts(filter: any = {}, skip = 0, limit = 10) {
  await init()
  const sb = supabase()
  if (sb) {
    let q = sb.from('posts').select('*').order('created_at', { ascending: false })
      .range(skip, skip + limit - 1)
    if (filter.category && filter.category !== 'all') q = q.eq('category', filter.category)
    if (filter.authorId) q = q.eq('author_id', filter.authorId)
    const { data } = await q
    const posts = (data || []).map(mapPost)
    await Promise.all(posts.map(async (p: any) => {
      p.comments = await getCommentsByPostId(p._id)
    }))
    return posts
  }
  let sql = 'SELECT * FROM posts'
  const params: any[] = []
  const conds: string[] = []
  if (filter.category && filter.category !== 'all') {
    conds.push(`category = $${params.length + 1}`)
    params.push(filter.category)
  }
  if (filter.authorId) {
    conds.push(`author_id = $${params.length + 1}`)
    params.push(filter.authorId)
  }
  if (conds.length) sql += ` WHERE ${conds.join(' AND ')}`
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  params.push(limit, skip)
  const rows = await pgQuery(sql, params)
  const posts = rows.map(mapPost)
  await Promise.all(posts.map(async (p: any) => { p.comments = await getCommentsByPostId(p._id) }))
  return posts
}

export async function countPosts(filter: any = {}) {
  await init()
  const sb = supabase()
  if (sb) {
    let q = sb.from('posts').select('*', { count: 'exact', head: true })
    if (filter.category && filter.category !== 'all') q = q.eq('category', filter.category)
    const { count } = await q
    return count || 0
  }
  let sql = 'SELECT COUNT(*) FROM posts'
  const params: any[] = []
  if (filter.category && filter.category !== 'all') {
    sql += ' WHERE category = $1'
    params.push(filter.category)
  }
  const rows = await pgQuery<any>(sql, params)
  return parseInt(rows[0]?.count || '0')
}

export async function createPost(data: any) {
  await init()
  const sb = supabase()
  const row = {
    author_id: data.authorId, author_name: data.authorName,
    author_username: data.authorUsername, author_image: data.authorImage || '',
    content: data.content || '', images: data.images || [], videos: data.videos || [],
    likes: [], bookmarks: [], reactions: {}, shares: [], reshares: 0,
    category: data.category || 'general',
    reposted_from: data.repostedFrom || null, poll: data.poll || null,
  }
  if (sb) {
    const { data: created, error } = await sb.from('posts').insert(row).select().single()
    if (error) throw error
    return mapPost(created)
  }
  const rows = await pgQuery(
    `INSERT INTO posts (author_id,author_name,author_username,author_image,content,
     images,videos,likes,bookmarks,reactions,shares,reshares,category,reposted_from,poll)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [row.author_id,row.author_name,row.author_username,row.author_image,row.content,
     row.images,row.videos,row.likes,row.bookmarks,JSON.stringify(row.reactions),
     row.shares,row.reshares,row.category,
     row.reposted_from ? JSON.stringify(row.reposted_from) : null,
     row.poll ? JSON.stringify(row.poll) : null]
  )
  return mapPost(rows[0])
}

export async function deletePost(id: string) {
  await init()
  const sb = supabase()
  if (sb) {
    await sb.from('comments').delete().eq('post_id', id)
    await sb.from('posts').delete().eq('id', id)
    return
  }
  await pg().query('DELETE FROM comments WHERE post_id = $1', [id])
  await pg().query('DELETE FROM posts WHERE id = $1', [id])
}

export async function toggleLike(postId: string, userId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('posts').select('likes').eq('id', postId).single()
    const likes: string[] = data?.likes || []
    const liked = likes.includes(userId)
    const newLikes = liked ? likes.filter(id => id !== userId) : [...likes, userId]
    await sb.from('posts').update({ likes: newLikes }).eq('id', postId)
    return { liked: !liked, likesCount: newLikes.length }
  }
  const rows = await pgQuery<any>('SELECT likes FROM posts WHERE id = $1', [postId])
  const likes: string[] = rows[0]?.likes || []
  const liked = likes.includes(userId)
  if (liked) {
    await pg().query("UPDATE posts SET likes = array_remove(likes, $1) WHERE id = $2", [userId, postId])
  } else {
    await pg().query("UPDATE posts SET likes = array_append(likes, $1) WHERE id = $2", [userId, postId])
  }
  return { liked: !liked, likesCount: liked ? likes.length - 1 : likes.length + 1 }
}

export async function getPostLikes(postId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('posts').select('likes').eq('id', postId).single()
    return data?.likes || []
  }
  const rows = await pgQuery<any>('SELECT likes FROM posts WHERE id = $1', [postId])
  return rows[0]?.likes || []
}

export async function toggleBookmark(postId: string, userId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const [{ data: post }, { data: user }] = await Promise.all([
      sb.from('posts').select('bookmarks').eq('id', postId).single(),
      sb.from('users').select('bookmarks').eq('id', userId).single(),
    ])
    const postBookmarks: string[] = post?.bookmarks || []
    const userBookmarks: string[] = user?.bookmarks || []
    const bookmarked = userBookmarks.includes(postId)
    const newPostBm = bookmarked ? postBookmarks.filter(id => id !== userId) : [...postBookmarks, userId]
    const newUserBm = bookmarked ? userBookmarks.filter(id => id !== postId) : [...userBookmarks, postId]
    await Promise.all([
      sb.from('posts').update({ bookmarks: newPostBm }).eq('id', postId),
      sb.from('users').update({ bookmarks: newUserBm }).eq('id', userId),
    ])
    return { bookmarked: !bookmarked }
  }
  const [postRows, userRows] = await Promise.all([
    pgQuery<any>('SELECT bookmarks FROM posts WHERE id = $1', [postId]),
    pgQuery<any>('SELECT bookmarks FROM users WHERE id = $1', [userId]),
  ])
  const userBm: string[] = userRows[0]?.bookmarks || []
  const bookmarked = userBm.includes(postId)
  if (bookmarked) {
    await Promise.all([
      pg().query("UPDATE posts SET bookmarks = array_remove(bookmarks, $1) WHERE id = $2", [userId, postId]),
      pg().query("UPDATE users SET bookmarks = array_remove(bookmarks, $1) WHERE id = $2", [postId, userId]),
    ])
  } else {
    await Promise.all([
      pg().query("UPDATE posts SET bookmarks = array_append(bookmarks, $1) WHERE id = $2", [userId, postId]),
      pg().query("UPDATE users SET bookmarks = array_append(bookmarks, $1) WHERE id = $2", [postId, userId]),
    ])
  }
  return { bookmarked: !bookmarked }
}

export async function addReaction(postId: string, userId: string, emoji: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('posts').select('reactions').eq('id', postId).single()
    const reactions: any = data?.reactions || {}
    if (!reactions[emoji]) reactions[emoji] = []
    const idx = reactions[emoji].indexOf(userId)
    if (idx >= 0) reactions[emoji].splice(idx, 1)
    else reactions[emoji].push(userId)
    if (!reactions[emoji].length) delete reactions[emoji]
    await sb.from('posts').update({ reactions }).eq('id', postId)
    return reactions
  }
  const rows = await pgQuery<any>('SELECT reactions FROM posts WHERE id = $1', [postId])
  const reactions: any = rows[0]?.reactions || {}
  if (!reactions[emoji]) reactions[emoji] = []
  const idx = reactions[emoji].indexOf(userId)
  if (idx >= 0) reactions[emoji].splice(idx, 1)
  else reactions[emoji].push(userId)
  if (!reactions[emoji].length) delete reactions[emoji]
  await pg().query("UPDATE posts SET reactions = $1 WHERE id = $2", [JSON.stringify(reactions), postId])
  return reactions
}

export async function repostPost(original: any, me: any) {
  await init()
  const existing = await getExistingRepost(me._id, original._id)
  if (existing) {
    await deletePost(existing._id)
    const sb = supabase()
    if (sb) await sb.from('posts').update({ reshares: Math.max(0, (original.reshares || 1) - 1) }).eq('id', original._id)
    else await pg().query('UPDATE posts SET reshares = GREATEST(0, reshares - 1) WHERE id = $1', [original._id])
    return { reposted: false, reshares: Math.max(0, (original.reshares || 1) - 1) }
  }
  await createPost({
    authorId: me._id, authorName: me.name, authorUsername: me.username,
    authorImage: me.profileImage || '', content: '', category: original.category || 'general',
    repostedFrom: {
      _id: original._id, authorName: original.authorName, authorUsername: original.authorUsername,
      authorImage: original.authorImage || '', content: original.content, images: original.images || [],
    },
  })
  const sb = supabase()
  if (sb) await sb.from('posts').update({ reshares: (original.reshares || 0) + 1 }).eq('id', original._id)
  else await pg().query('UPDATE posts SET reshares = reshares + 1 WHERE id = $1', [original._id])
  return { reposted: true, reshares: (original.reshares || 0) + 1 }
}

export async function getExistingRepost(authorId: string, originalId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('posts').select('*').eq('author_id', authorId)
      .contains('reposted_from', { _id: originalId }).single()
    return mapPost(data)
  }
  const rows = await pgQuery<any>(
    `SELECT * FROM posts WHERE author_id = $1 AND reposted_from->>'_id' = $2 LIMIT 1`,
    [authorId, originalId]
  )
  return mapPost(rows[0])
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
export async function getCommentsByPostId(postId: string, parentId?: string | null) {
  await init()
  const sb = supabase()
  if (sb) {
    let q = sb.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: false })
    if (parentId === null || parentId === undefined) q = q.is('parent_id', null)
    else q = q.eq('parent_id', parentId)
    const { data } = await q
    return (data || []).map(mapComment)
  }
  if (parentId === null || parentId === undefined) {
    const rows = await pgQuery<any>(
      'SELECT * FROM comments WHERE post_id = $1 AND parent_id IS NULL ORDER BY created_at DESC',
      [postId]
    )
    return rows.map(mapComment)
  }
  const rows = await pgQuery<any>(
    'SELECT * FROM comments WHERE post_id = $1 AND parent_id = $2 ORDER BY created_at DESC',
    [postId, parentId]
  )
  return rows.map(mapComment)
}

export async function createComment(data: any) {
  await init()
  const sb = supabase()
  const row = {
    post_id: data.postId, author_id: data.authorId, author_name: data.authorName,
    author_username: data.authorUsername, author_image: data.authorImage || '',
    content: data.content, likes: [], parent_id: data.parentId || null,
  }
  if (sb) {
    const { data: created, error } = await sb.from('comments').insert(row).select().single()
    if (error) throw error
    return mapComment(created)
  }
  const rows = await pgQuery(
    `INSERT INTO comments (post_id,author_id,author_name,author_username,author_image,content,parent_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [row.post_id,row.author_id,row.author_name,row.author_username,row.author_image,row.content,row.parent_id]
  )
  return mapComment(rows[0])
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export async function getNotifications(recipientId: string, limit = 50) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('notifications').select('*').eq('recipient_id', recipientId)
      .order('created_at', { ascending: false }).limit(limit)
    return (data || []).map(mapNotification)
  }
  const rows = await pgQuery<any>(
    'SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT $2',
    [recipientId, limit]
  )
  return rows.map(mapNotification)
}

export async function createNotification(data: any) {
  await init()
  const sb = supabase()
  const row = {
    recipient_id: data.recipientId, sender_id: data.senderId, sender_name: data.senderName,
    sender_image: data.senderImage || '', type: data.type,
    post_id: data.postId || null, comment_id: data.commentId || null,
    message: data.message || '', read: false,
  }
  if (sb) { await sb.from('notifications').insert(row); return }
  await pg().query(
    `INSERT INTO notifications (recipient_id,sender_id,sender_name,sender_image,type,post_id,comment_id,message)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [row.recipient_id,row.sender_id,row.sender_name,row.sender_image,row.type,row.post_id,row.comment_id,row.message]
  )
}

export async function markNotificationsRead(recipientId: string) {
  await init()
  const sb = supabase()
  if (sb) { await sb.from('notifications').update({ read: true }).eq('recipient_id', recipientId); return }
  await pg().query('UPDATE notifications SET read = true WHERE recipient_id = $1', [recipientId])
}

export async function countUnreadNotifications(recipientId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { count } = await sb.from('notifications').select('*', { count: 'exact', head: true })
      .eq('recipient_id', recipientId).eq('read', false)
    return count || 0
  }
  const rows = await pgQuery<any>(
    'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND read = false',
    [recipientId]
  )
  return parseInt(rows[0]?.count || '0')
}

// ── MESSAGES ─────────────────────────────────────────────────────────────────
export async function getConversationsByUser(userId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('conversations').select('*')
      .contains('participants', [userId]).order('last_message_time', { ascending: false })
    return (data || []).map(mapConversation)
  }
  const rows = await pgQuery<any>(
    'SELECT * FROM conversations WHERE $1 = ANY(participants) ORDER BY last_message_time DESC',
    [userId]
  )
  return rows.map(mapConversation)
}

export async function getConversationById(id: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('conversations').select('*').eq('id', id).single()
    return mapConversation(data)
  }
  const rows = await pgQuery<any>('SELECT * FROM conversations WHERE id = $1', [id])
  return mapConversation(rows[0])
}

export async function findConversationByParticipants(participants: string[]) {
  await init()
  const sorted = [...participants].sort()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('conversations').select('*')
      .contains('participants', sorted).limit(10)
    const exact = (data || []).find((c: any) =>
      c.participants.length === sorted.length &&
      sorted.every((p: string) => c.participants.includes(p))
    )
    return exact ? mapConversation(exact) : null
  }
  const rows = await pgQuery<any>(
    `SELECT * FROM conversations WHERE participants @> $1 AND participants <@ $1`,
    [sorted]
  )
  return rows[0] ? mapConversation(rows[0]) : null
}

export async function createConversation(participants: string[]) {
  await init()
  const sorted = [...participants].sort()
  const sb = supabase()
  if (sb) {
    const { data, error } = await sb.from('conversations').insert({
      participants: sorted, last_message: '', last_message_time: new Date(),
      unread_count: {}, typing_users: {},
    }).select().single()
    if (error) throw error
    return mapConversation(data)
  }
  const rows = await pgQuery(
    `INSERT INTO conversations (participants,last_message,last_message_time,unread_count,typing_users)
     VALUES ($1,$2,NOW(),$3,$4) RETURNING *`,
    [sorted, '', JSON.stringify({}), JSON.stringify({})]
  )
  return mapConversation(rows[0])
}

export async function updateConversation(id: string, data: any) {
  await init()
  const sb = supabase()
  const updates: any = {}
  if (data.lastMessage !== undefined) updates.last_message = data.lastMessage
  if (data.lastMessageTime !== undefined) updates.last_message_time = data.lastMessageTime
  if (data.unreadCount !== undefined) updates.unread_count = data.unreadCount
  if (data.typingUsers !== undefined) updates.typing_users = data.typingUsers
  updates.updated_at = new Date()
  if (sb) { await sb.from('conversations').update(updates).eq('id', id); return }
  const keys = Object.keys(updates)
  const vals = Object.values(updates)
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  await pg().query(`UPDATE conversations SET ${sets} WHERE id = $1`, [id, ...vals.map(v =>
    typeof v === 'object' ? JSON.stringify(v) : v
  )])
}

export async function getMessages(conversationId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('messages').select('*').eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    return (data || []).map(mapMessage)
  }
  const rows = await pgQuery<any>(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  )
  return rows.map(mapMessage)
}

export async function createMessage(data: any) {
  await init()
  const sb = supabase()
  const row = {
    conversation_id: data.conversationId, sender_id: data.senderId,
    sender_name: data.senderName, sender_image: data.senderImage || '',
    receiver_id: data.receiverId, content: data.content || '',
    media_url: data.mediaUrl || '', media_type: data.mediaType || '',
    reply_to_id: data.replyToId || null, reply_to_content: data.replyToContent || '',
    reply_to_sender: data.replyToSender || '', reactions: {},
  }
  if (sb) {
    const { data: created, error } = await sb.from('messages').insert(row).select().single()
    if (error) throw error
    return mapMessage(created)
  }
  const rows = await pgQuery(
    `INSERT INTO messages (conversation_id,sender_id,sender_name,sender_image,receiver_id,
     content,media_url,media_type,reply_to_id,reply_to_content,reply_to_sender,reactions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [row.conversation_id,row.sender_id,row.sender_name,row.sender_image,row.receiver_id,
     row.content,row.media_url,row.media_type,row.reply_to_id,row.reply_to_content,
     row.reply_to_sender,JSON.stringify(row.reactions)]
  )
  return mapMessage(rows[0])
}

export async function markMessagesRead(conversationId: string, receiverId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    await sb.from('messages').update({ read: true })
      .eq('conversation_id', conversationId).eq('receiver_id', receiverId).eq('read', false)
    return
  }
  await pg().query(
    'UPDATE messages SET read = true WHERE conversation_id = $1 AND receiver_id = $2 AND read = false',
    [conversationId, receiverId]
  )
}

export async function getMessageById(id: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('messages').select('*').eq('id', id).single()
    return mapMessage(data)
  }
  const rows = await pgQuery<any>('SELECT * FROM messages WHERE id = $1', [id])
  return mapMessage(rows[0])
}

export async function updateMessage(id: string, updates: any) {
  await init()
  const sb = supabase()
  const dbUpdates: any = { updated_at: new Date() }
  if (updates.content !== undefined) dbUpdates.content = updates.content
  if (updates.edited !== undefined) dbUpdates.edited = updates.edited
  if (updates.isDeleted !== undefined) dbUpdates.is_deleted = updates.isDeleted
  if (updates.mediaUrl !== undefined) dbUpdates.media_url = updates.mediaUrl
  if (updates.mediaType !== undefined) dbUpdates.media_type = updates.mediaType
  if (updates.reactions !== undefined) dbUpdates.reactions = updates.reactions
  if (sb) {
    const { data } = await sb.from('messages').update(dbUpdates).eq('id', id).select().single()
    return mapMessage(data)
  }
  const keys = Object.keys(dbUpdates)
  const vals = Object.values(dbUpdates)
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const rows = await pgQuery(
    `UPDATE messages SET ${sets} WHERE id = $1 RETURNING *`,
    [id, ...vals.map(v => typeof v === 'object' ? JSON.stringify(v) : v)]
  )
  return mapMessage(rows[0])
}

export async function reactToMessage(messageId: string, userId: string, emoji: string) {
  await init()
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
  await init()
  const conv = await getConversationById(conversationId)
  if (!conv) return
  const typingUsers: any = conv.typingUsers || {}
  typingUsers[userId] = new Date(Date.now() + 3500).toISOString()
  await updateConversation(conversationId, { typingUsers })
}

// ── STORIES ──────────────────────────────────────────────────────────────────
export async function getStories() {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('stories').select('*').order('created_at', { ascending: false }).limit(100)
    return (data || []).map(mapStory)
  }
  const rows = await pgQuery<any>('SELECT * FROM stories ORDER BY created_at DESC LIMIT 100')
  return rows.map(mapStory)
}

export async function getStoriesByUser(userId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('stories').select('*').eq('author_id', userId).order('created_at', { ascending: false })
    return (data || []).map(mapStory)
  }
  const rows = await pgQuery<any>('SELECT * FROM stories WHERE author_id = $1 ORDER BY created_at DESC', [userId])
  return rows.map(mapStory)
}

export async function createStory(data: any) {
  await init()
  const sb = supabase()
  const row = {
    author_id: data.authorId, author_name: data.authorName,
    author_username: data.authorUsername, author_image: data.authorImage || '',
    content: data.content || '', image: data.image || '',
  }
  if (sb) {
    const { data: created } = await sb.from('stories').insert(row).select().single()
    return mapStory(created)
  }
  const rows = await pgQuery(
    'INSERT INTO stories (author_id,author_name,author_username,author_image,content,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [row.author_id,row.author_name,row.author_username,row.author_image,row.content,row.image]
  )
  return mapStory(rows[0])
}

// ── CLANS ────────────────────────────────────────────────────────────────────
export async function getClans() {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('clans').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapClan)
  }
  const rows = await pgQuery<any>('SELECT * FROM clans ORDER BY created_at DESC')
  return rows.map(mapClan)
}

export async function getClanById(id: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('clans').select('*').eq('id', id).single()
    return mapClan(data)
  }
  const rows = await pgQuery<any>('SELECT * FROM clans WHERE id = $1', [id])
  return mapClan(rows[0])
}

export async function getClanBySlug(slug: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('clans').select('*').eq('slug', slug).single()
    return mapClan(data)
  }
  const rows = await pgQuery<any>('SELECT * FROM clans WHERE slug = $1', [slug])
  return mapClan(rows[0])
}

export async function createClan(data: any) {
  await init()
  const sb = supabase()
  const row = {
    name: data.name, slug: data.slug, logo: data.logo || '',
    description: data.description || '', owner_id: data.ownerId,
    owner_name: data.ownerName, members: [data.ownerId],
  }
  if (sb) {
    const { data: created, error } = await sb.from('clans').insert(row).select().single()
    if (error) throw error
    return mapClan(created)
  }
  const rows = await pgQuery(
    'INSERT INTO clans (name,slug,logo,description,owner_id,owner_name,members) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [row.name,row.slug,row.logo,row.description,row.owner_id,row.owner_name,row.members]
  )
  return mapClan(rows[0])
}

export async function updateClan(id: string, updates: any) {
  await init()
  const sb = supabase()
  const dbUpdates: any = { updated_at: new Date() }
  if (updates.members !== undefined) dbUpdates.members = updates.members
  if (updates.logo !== undefined) dbUpdates.logo = updates.logo
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (sb) {
    const { data } = await sb.from('clans').update(dbUpdates).eq('id', id).select().single()
    return mapClan(data)
  }
  const keys = Object.keys(dbUpdates)
  const vals = Object.values(dbUpdates)
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const rows = await pgQuery(`UPDATE clans SET ${sets} WHERE id = $1 RETURNING *`, [id, ...vals])
  return mapClan(rows[0])
}

export async function deleteClan(id: string) {
  await init()
  const sb = supabase()
  if (sb) { await sb.from('clans').delete().eq('id', id); return }
  await pg().query('DELETE FROM clans WHERE id = $1', [id])
}

export async function getWorldChatMessages(clanId: string, since?: string) {
  await init()
  const sb = supabase()
  if (sb) {
    let q = sb.from('world_chat_messages').select('*').eq('clan_id', clanId).order('created_at', { ascending: true }).limit(100)
    if (since) q = q.gt('created_at', since)
    const { data } = await q
    return (data || []).map(mapWorldChat)
  }
  if (since) {
    const rows = await pgQuery<any>(
      'SELECT * FROM world_chat_messages WHERE clan_id = $1 AND created_at > $2 ORDER BY created_at ASC LIMIT 100',
      [clanId, since]
    )
    return rows.map(mapWorldChat)
  }
  const rows = await pgQuery<any>(
    'SELECT * FROM world_chat_messages WHERE clan_id = $1 ORDER BY created_at ASC LIMIT 100',
    [clanId]
  )
  return rows.map(mapWorldChat)
}

export async function createWorldChatMessage(data: any) {
  await init()
  const sb = supabase()
  const row = {
    clan_id: data.clanId, sender_id: data.senderId, sender_name: data.senderName,
    sender_username: data.senderUsername, sender_image: data.senderImage || '',
    content: data.content,
  }
  if (sb) {
    const { data: created } = await sb.from('world_chat_messages').insert(row).select().single()
    return mapWorldChat(created)
  }
  const rows = await pgQuery(
    'INSERT INTO world_chat_messages (clan_id,sender_id,sender_name,sender_username,sender_image,content) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [row.clan_id,row.sender_id,row.sender_name,row.sender_username,row.sender_image,row.content]
  )
  return mapWorldChat(rows[0])
}

// ── UPLOAD CHUNKS ────────────────────────────────────────────────────────────
export async function saveChunk(data: any) {
  await init()
  const sb = supabase()
  const row = {
    upload_id: data.uploadId, chunk_index: data.chunkIndex, total_chunks: data.totalChunks,
    filename: data.filename, mime_type: data.mimeType, subfolder: data.subfolder || '',
    data: data.buffer, user_id: data.userId,
  }
  if (sb) {
    await sb.from('upload_chunks').upsert(row, { onConflict: 'upload_id,chunk_index' })
    return
  }
  await pg().query(
    `INSERT INTO upload_chunks (upload_id,chunk_index,total_chunks,filename,mime_type,subfolder,data,user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (upload_id,chunk_index) DO UPDATE SET data = EXCLUDED.data`,
    [row.upload_id,row.chunk_index,row.total_chunks,row.filename,row.mime_type,row.subfolder,row.data,row.user_id]
  )
}

export async function getChunks(uploadId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from('upload_chunks').select('*').eq('upload_id', uploadId).order('chunk_index')
    return data || []
  }
  const rows = await pgQuery<any>('SELECT * FROM upload_chunks WHERE upload_id = $1 ORDER BY chunk_index', [uploadId])
  return rows
}

export async function countChunks(uploadId: string) {
  await init()
  const sb = supabase()
  if (sb) {
    const { count } = await sb.from('upload_chunks').select('*', { count: 'exact', head: true }).eq('upload_id', uploadId)
    return count || 0
  }
  const rows = await pgQuery<any>('SELECT COUNT(*) FROM upload_chunks WHERE upload_id = $1', [uploadId])
  return parseInt(rows[0]?.count || '0')
}

export async function deleteChunks(uploadId: string) {
  await init()
  const sb = supabase()
  if (sb) { await sb.from('upload_chunks').delete().eq('upload_id', uploadId); return }
  await pg().query('DELETE FROM upload_chunks WHERE upload_id = $1', [uploadId])
}
