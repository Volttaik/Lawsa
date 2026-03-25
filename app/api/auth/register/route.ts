import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { name, username, email, password, phone, dateOfBirth, profileImage } = await request.json();

        if (!name || !username || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
            return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            profileImage: profileImage || "",
            bannerImage: "",
            bio: "",
            phone: phone || "",
            dateOfBirth: dateOfBirth || "",
            skills: [],
            followers: [],
            following: [],
        });

        const token = await signToken({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
        });

        const response = NextResponse.json({
            message: "Account created successfully",
            user: {
                id: user._id.toString(),
                name: user.name,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        }, { status: 201 });

        response.cookies.set("lawsa-token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error: unknown) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
