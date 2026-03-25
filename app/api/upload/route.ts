import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const subfolder = formData.get("subfolder") as string || "";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const url = await saveFile(file, subfolder);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
