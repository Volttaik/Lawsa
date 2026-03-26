import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { uploadBuffer } from "@/lib/gridfs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { uploadId, filename, mimeType, subfolder } = await request.json();

        if (!uploadId || !filename || !mimeType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        const db = mongoose.connection.db!;
        const chunksCollection = db.collection("upload_chunks");

        const chunks = await chunksCollection
            .find({ uploadId })
            .sort({ chunkIndex: 1 })
            .toArray();

        if (chunks.length === 0) {
            return NextResponse.json({ error: "No chunks found for this upload" }, { status: 404 });
        }

        const totalChunks = chunks[0].totalChunks;
        if (chunks.length < totalChunks) {
            return NextResponse.json({
                error: `Incomplete upload: received ${chunks.length} of ${totalChunks} chunks`,
            }, { status: 400 });
        }

        const buffers = chunks.map((c) => {
            const d = c.data;
            if (Buffer.isBuffer(d)) return d;
            if (d?.buffer) return Buffer.from(d.buffer);
            return Buffer.from(d);
        });
        const assembled = Buffer.concat(buffers);

        const ext = filename.split(".").pop() || "bin";
        const { v4: uuidv4 } = await import("uuid");
        const gridfsFilename = subfolder
            ? `${subfolder}/${uuidv4()}.${ext}`
            : `${uuidv4()}.${ext}`;

        const fileId = await uploadBuffer(assembled, gridfsFilename, mimeType);

        await chunksCollection.deleteMany({ uploadId });

        return NextResponse.json({ url: `/api/files/${fileId}` });
    } catch (error: any) {
        console.error("Assemble error:", error);
        return NextResponse.json({ error: error.message || "Assembly failed" }, { status: 500 });
    }
}
