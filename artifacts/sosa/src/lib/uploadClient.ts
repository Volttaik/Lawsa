const CHUNK_SIZE = 3.5 * 1024 * 1024;
export type UploadProgressCallback = (progress: number) => void;

export async function uploadFile(file: File, subfolder = "", onProgress?: UploadProgressCallback): Promise<string> {
  if (file.size <= CHUNK_SIZE) {
    const form = new FormData();
    form.append("file", file);
    form.append("subfolder", subfolder);
    onProgress?.(30);
    const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `Upload failed (${res.status})`); }
    const { url } = await res.json();
    onProgress?.(100);
    return url;
  }
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const form = new FormData();
    form.append("chunk", new File([file.slice(start, end)], file.name, { type: file.type }));
    form.append("uploadId", uploadId);
    form.append("chunkIndex", String(i));
    form.append("totalChunks", String(totalChunks));
    form.append("filename", file.name);
    form.append("mimeType", file.type);
    form.append("subfolder", subfolder);
    const res = await fetch("/api/upload/chunk", { method: "POST", body: form, credentials: "include" });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `Chunk ${i + 1} of ${totalChunks} failed`); }
    onProgress?.(Math.round(((i + 1) / totalChunks) * 80));
  }
  onProgress?.(85);
  const res = await fetch("/api/upload/assemble", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, filename: file.name, mimeType: file.type, subfolder }),
    credentials: "include",
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Assembly failed"); }
  const { url } = await res.json();
  onProgress?.(100);
  return url;
}
