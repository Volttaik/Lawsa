import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const query = search
            ? { $or: [{ name: { $regex: search, $options: "i" } }, { username: { $regex: search, $options: "i" } }], _id: { $ne: authUser.userId } }
            : { _id: { $ne: authUser.userId } };

        const users = await User.find(query)
            .select("-password")
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({ users: JSON.parse(JSON.stringify(users)) });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
