import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { emailOrUsername, password } = await request.json();

        if (!emailOrUsername || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername.toLowerCase() }
            ]
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = await signToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
        });

        const response = NextResponse.json({
            message: "Login successful",
            user: {
                id: user._id.toString(),
                name: user.name,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });

        response.cookies.set("lawsa-token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
