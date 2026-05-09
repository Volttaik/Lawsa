import { Router } from "express";
import { getUserFromRequest } from "../lib/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { saveChunk, getChunks, countChunks, deleteChunks } from "../lib/queries.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const uploadDir = process.env.UPLOAD_DIR || "/tmp/lawsa-uploads";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function getPublicUrl(filepath: string): string {
  const rel = filepath.replace(uploadDir, "").replace(/\\/g, "/");
  return `/api/uploads${rel}`;
}

router.use("/uploads", (req, res, next) => {
  const rel = req.path.replace(/\.\./g, "");
  const filepath = path.join(uploadDir, rel);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.resolve(filepath));
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    if (!req.file) return res.status(400).json({ error: "No file" });
    const subfolder = (req.body.subfolder || "general").replace(/[^a-z0-9_-]/g, "");
    const dir = path.join(uploadDir, subfolder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const ext = path.extname(req.file.originalname) || ".bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, req.file.buffer);
    res.json({ url: getPublicUrl(filepath) });
  } catch (e) { console.error("[upload]", e); res.status(500).json({ error: "Upload failed" }); }
});

router.post("/upload/chunk", upload.single("chunk"), async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    if (!req.file) return res.status(400).json({ error: "No chunk" });
    const { uploadId, chunkIndex, totalChunks, filename, mimeType, subfolder } = req.body;
    await saveChunk({ uploadId, chunkIndex: parseInt(chunkIndex), totalChunks: parseInt(totalChunks), filename, mimeType, subfolder, buffer: req.file.buffer, userId: auth.userId });
    res.json({ success: true, chunkIndex });
  } catch (e) { res.status(500).json({ error: "Chunk upload failed" }); }
});

router.post("/upload/assemble", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const { uploadId, filename, mimeType, subfolder } = req.body;
    const chunks = await getChunks(uploadId);
    if (!chunks.length) return res.status(400).json({ error: "No chunks found" });
    const subfld = (subfolder || "general").replace(/[^a-z0-9_-]/g, "");
    const dir = path.join(uploadDir, subfld);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const ext = path.extname(filename) || ".bin";
    const outFilename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const outPath = path.join(dir, outFilename);
    const buffers = chunks.sort((a: any, b: any) => a.chunk_index - b.chunk_index).map((c: any) => Buffer.isBuffer(c.data) ? c.data : Buffer.from(c.data));
    fs.writeFileSync(outPath, Buffer.concat(buffers));
    await deleteChunks(uploadId);
    res.json({ url: getPublicUrl(outPath) });
  } catch (e) { console.error("[assemble]", e); res.status(500).json({ error: "Assembly failed" }); }
});

export default router;
