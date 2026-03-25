import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/avi", "video/mov"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, "application/pdf", "application/octet-stream"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export async function saveFile(file: File, subfolder: string = ""): Promise<string> {
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size is ${isVideo ? "100MB" : "10MB"}.`);
    }

    const targetDir = subfolder ? path.join(UPLOAD_DIR, subfolder) : UPLOAD_DIR;
    await mkdir(targetDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(targetDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return subfolder ? `/uploads/${subfolder}/${filename}` : `/uploads/${filename}`;
}

export async function saveBase64Image(base64: string, subfolder: string = ""): Promise<string> {
    return saveBase64Media(base64, subfolder);
}

export async function saveBase64Media(base64: string, subfolder: string = ""): Promise<string> {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 data");

    const mimeType = matches[1];
    const data = matches[2];

    const targetDir = subfolder ? path.join(UPLOAD_DIR, subfolder) : UPLOAD_DIR;
    await mkdir(targetDir, { recursive: true });

    let ext = "bin";
    if (mimeType.startsWith("image/")) {
        ext = mimeType.split("/")[1] || "jpg";
        if (ext === "jpeg") ext = "jpg";
    } else if (mimeType.startsWith("video/")) {
        ext = mimeType.split("/")[1] || "mp4";
        if (ext === "quicktime") ext = "mov";
    } else if (mimeType.startsWith("audio/")) {
        ext = mimeType.split("/")[1] || "webm";
        if (ext === "mpeg") ext = "mp3";
    } else if (mimeType === "application/pdf") {
        ext = "pdf";
    }

    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(targetDir, filename);

    const buffer = Buffer.from(data, "base64");
    await writeFile(filepath, buffer);

    return subfolder ? `/uploads/${subfolder}/${filename}` : `/uploads/${filename}`;
}
