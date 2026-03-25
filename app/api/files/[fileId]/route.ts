import { NextRequest, NextResponse } from "next/server";
import { downloadBuffer } from "@/lib/gridfs";

export const dynamic = "force-dynamic";

export async function GET(
    _request: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        const { fileId } = params;
        if (!fileId || !/^[a-f\d]{24}$/i.test(fileId)) {
            return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
        }

        const { buffer, contentType, filename } = await downloadBuffer(fileId);

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Content-Length", buffer.length.toString());
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set(
            "Content-Disposition",
            `inline; filename="${encodeURIComponent(filename.split("/").pop() || filename)}"`
        );

        return new NextResponse(buffer, { status: 200, headers });
    } catch (error: any) {
        if (error.message === "File not found") {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        console.error("File serve error:", error);
        return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 });
    }
}
