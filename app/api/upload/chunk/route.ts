import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const formData = await request.formData();
        const chunk = formData.get("chunk") as File;
        const uploadId = formData.get("uploadId") as string;
        const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
        const totalChunks = parseInt(formData.get("totalChunks") as string, 10);
        const filename = formData.get("filename") as string;
        const mimeType = formData.get("mimeType") as string;
        const subfolder = (formData.get("subfolder") as string) || "";

        if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        const db = mongoose.connection.db!;
        const chunksCollection = db.collection("upload_chunks");

        const bytes = await chunk.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await chunksCollection.replaceOne(
            { uploadId, chunkIndex },
            {
                uploadId,
                chunkIndex,
                totalChunks,
                filename,
                mimeType,
                subfolder,
                data: buffer,
                userId: authUser.userId,
                createdAt: new Date(),
            },
            { upsert: true }
        );

        const receivedCount = await chunksCollection.countDocuments({ uploadId });

        return NextResponse.json({
            ok: true,
            chunkIndex,
            receivedCount,
            totalChunks,
            complete: receivedCount >= totalChunks,
        });
    } catch (error: any) {
        console.error("Chunk upload error:", error);
        return NextResponse.json({ error: error.message || "Chunk upload failed" }, { status: 500 });
    }
}
