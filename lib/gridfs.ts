// GridFS has been replaced with local filesystem storage via lib/upload.ts
// This file is kept for backwards compatibility
export { saveBase64Media as uploadBase64ToGridFS, saveFile as uploadFileToGridFS, uploadBufferToStorage as uploadBuffer } from './upload'

export async function downloadBuffer(_fileId: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  throw new Error('GridFS is no longer supported. Files are stored locally.')
}

export async function deleteFile(_fileId: string): Promise<void> {
  // no-op
}
