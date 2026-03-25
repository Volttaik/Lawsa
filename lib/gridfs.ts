import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import connectDB from "./db";

let bucket: GridFSBucket | null = null;

async function getBucket(): Promise<GridFSBucket> {
    await connectDB();
    if (!bucket || mongoose.connection.readyState !== 1) {
        const db = mongoose.connection.db;
        if (!db) throw new Error("MongoDB not connected");
        bucket = new GridFSBucket(db, { bucketName: "uploads" });
    }
    return bucket;
}

export async function uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string
): Promise<string> {
    const b = await getBucket();
    return new Promise((resolve, reject) => {
        const uploadStream = b.openUploadStream(filename, {
            contentType,
            metadata: { uploadedAt: new Date() },
        });
        uploadStream.on("error", reject);
        uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
        uploadStream.end(buffer);
    });
}

export async function downloadBuffer(fileId: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const b = await getBucket();
    const id = new ObjectId(fileId);
    const files = await b.find({ _id: id }).toArray();
    if (!files.length) throw new Error("File not found");
    const file = files[0];

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = b.openDownloadStream(id);
        downloadStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        downloadStream.on("error", reject);
        downloadStream.on("end", () =>
            resolve({
                buffer: Buffer.concat(chunks),
                contentType: file.contentType || "application/octet-stream",
                filename: file.filename,
            })
        );
    });
}

export async function deleteFile(fileId: string): Promise<void> {
    try {
        const b = await getBucket();
        await b.delete(new ObjectId(fileId));
    } catch {
    }
}

export async function uploadBase64ToGridFS(base64: string, subfolder: string = ""): Promise<string> {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 data");

    const mimeType = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

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

    const { v4: uuidv4 } = await import("uuid");
    const filename = subfolder ? `${subfolder}/${uuidv4()}.${ext}` : `${uuidv4()}.${ext}`;
    const fileId = await uploadBuffer(buffer, filename, mimeType);
    return `/api/files/${fileId}`;
}

export async function uploadFileToGridFS(file: File, subfolder: string = ""): Promise<string> {
    const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/avi", "video/mov"];
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size is ${isVideo ? "100MB" : "10MB"}.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "bin";
    const { v4: uuidv4 } = await import("uuid");
    const filename = subfolder ? `${subfolder}/${uuidv4()}.${ext}` : `${uuidv4()}.${ext}`;
    const fileId = await uploadBuffer(buffer, filename, file.type || "application/octet-stream");
    return `/api/files/${fileId}`;
}
