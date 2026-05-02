import { supabase } from './db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const BUCKET = 'sosa-uploads'

async function ensureBucket() {
  const sb = supabase()!
  const { data: buckets } = await sb.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await sb.storage.createBucket(BUCKET, { public: true })
  }
}

export async function saveBase64Media(base64: string, subfolder = ''): Promise<string> {
  const sb = supabase()
  const match = base64.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid base64 format')
  const mimeType = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin'
  const filename = `${uuidv4()}.${ext}`
  const filePath = subfolder ? `${subfolder}/${filename}` : filename

  if (sb) {
    await ensureBucket()
    const { error } = await sb.storage.from(BUCKET).upload(filePath, buffer, { contentType: mimeType })
    if (error) throw error
    const { data } = sb.storage.from(BUCKET).getPublicUrl(filePath)
    return data.publicUrl
  }

  // Local filesystem fallback
  const dir = path.join(process.cwd(), 'public', 'uploads', subfolder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  return `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`
}

export async function saveFile(file: File, subfolder = ''): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'bin'
  const filename = `${uuidv4()}.${ext}`
  const filePath = subfolder ? `${subfolder}/${filename}` : filename
  const sb = supabase()

  if (sb) {
    await ensureBucket()
    const { error } = await sb.storage.from(BUCKET).upload(filePath, buffer, { contentType: file.type })
    if (error) throw error
    const { data } = sb.storage.from(BUCKET).getPublicUrl(filePath)
    return data.publicUrl
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', subfolder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  return `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`
}

export async function saveBase64Image(base64: string, subfolder = ''): Promise<string> {
  return saveBase64Media(base64, subfolder)
}

export async function uploadBufferToStorage(
  buffer: Buffer, filename: string, mimeType: string, subfolder = ''
): Promise<string> {
  const sb = supabase()
  const filePath = subfolder ? `${subfolder}/${filename}` : filename

  if (sb) {
    await ensureBucket()
    const { error } = await sb.storage.from(BUCKET).upload(filePath, buffer, { contentType: mimeType, upsert: true })
    if (error) throw error
    const { data } = sb.storage.from(BUCKET).getPublicUrl(filePath)
    return data.publicUrl
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', subfolder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  return `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`
}
