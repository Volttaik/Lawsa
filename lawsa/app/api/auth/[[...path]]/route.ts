import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  getUserByEmail,
  getUserByEmailOrUsername,
  getUserByVerificationToken,
  getUserByResetToken,
  getUserById,
  createUser,
  updateUser,
  updateUserLastOnline,
} from "@/lib/queries";
import { signToken, getUserFromRequest } from "@/lib/auth";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationCodeEmail,
} from "@/lib/email";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:5000";
  return `${proto}://${host}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const action = path[0];

  if (action === "me") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const user = await getUserById(authUser.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      await updateUserLastOnline(authUser.userId);
      const { password: _pw, ...safeUser } = user;
      const res = NextResponse.json({ user: safeUser });
      res.headers.set("Cache-Control", "private, max-age=10, stale-while-revalidate=30");
      return res;
    } catch (e) {
      console.error("[/api/auth/me]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "verify") {
    try {
      const token = request.nextUrl.searchParams.get("token");
      if (!token) return NextResponse.redirect(new URL("/email-verified?status=invalid-token", request.url));
      const user = await getUserByVerificationToken(token);
      if (!user) return NextResponse.redirect(new URL("/email-verified?status=invalid-token", request.url));
      if (user.emailVerified) return NextResponse.redirect(new URL("/email-verified?status=already", request.url));
      await updateUser(user.id, { emailVerified: true, emailVerificationToken: "" });
      sendWelcomeEmail(user.email, user.name, getBaseUrl(request)).catch(() => {});
      return NextResponse.redirect(new URL("/email-verified?status=success", request.url));
    } catch (e) {
      console.error("Verify email error:", e);
      return NextResponse.redirect(new URL("/email-verified?status=error", request.url));
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const action = path[0];

  if (action === "login") {
    try {
      const { emailOrUsername, password } = await request.json();
      if (!emailOrUsername || !password)
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      const user = await getUserByEmailOrUsername(emailOrUsername);
      if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      if (!user.emailVerified) {
        const verificationToken = randomUUID();
        const baseUrl = getBaseUrl(request);
        updateUser(user.id, { emailVerificationToken: verificationToken })
          .then(() => sendVerificationEmail(user.email, user.name, verificationToken, baseUrl))
          .catch((err) => console.error("[login] Failed to resend verification email:", err.message));
        return NextResponse.json({ error: "Please verify your email before signing in. A new verification link has been sent to your inbox.", requiresVerification: true }, { status: 403 });
      }
      const jwtToken = await signToken({ userId: user.id, email: user.email, username: user.username, name: user.name, profileImage: user.profileImage || "" });
      const { password: _pw, ...safeUser } = user;
      const response = NextResponse.json({ message: "Login successful", token: jwtToken, user: safeUser });
      response.cookies.set("lawsa-token", jwtToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 60 * 60 * 24 * 30, path: "/" });
      return response;
    } catch (e) {
      console.error("Login error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "register") {
    try {
      const { name, username, email, password, phone, dateOfBirth, profileImage } = await request.json();
      if (!name || !username || !email || !password)
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      if (password.length < 6)
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      const existing = await getUserByEmail(email);
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      const existingByUsername = await getUserByEmailOrUsername(username);
      if (existingByUsername) return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await createUser({ name, username, email, password: hashedPassword, phone, dateOfBirth, profileImage, emailVerified: false });
      if (!user) return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      const jwtToken = await signToken({ userId: user.id, email: user.email, username: user.username, name: user.name, profileImage: user.profileImage || "" });
      const verificationToken = randomUUID();
      const baseUrl = getBaseUrl(request);
      updateUser(user.id, { emailVerificationToken: verificationToken })
        .then(() => sendVerificationEmail(user.email, user.name, verificationToken, baseUrl))
        .catch((err) => console.error("[register] Failed to send verification email:", err.message));
      const { password: _pw, ...safeUser } = user;
      const response = NextResponse.json({ message: "Account created successfully", token: jwtToken, user: safeUser }, { status: 201 });
      response.cookies.set("lawsa-token", jwtToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 60 * 60 * 24 * 30, path: "/" });
      return response;
    } catch (e) {
      console.error("Register error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "logout") {
    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("lawsa-token", "", { httpOnly: true, secure: true, sameSite: "none", maxAge: 0, path: "/" });
    return response;
  }

  if (action === "forgot-password") {
    try {
      const { email } = await request.json();
      if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
      const user = await getUserByEmail(email);
      if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
      const token = randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await updateUser(user.id, { passwordResetToken: token, passwordResetExpires: expires });
      sendPasswordResetEmail(user.email, user.name, token, getBaseUrl(request)).catch(() => {});
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    } catch (e) {
      console.error("Forgot password error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "reset-password") {
    try {
      const { token, password } = await request.json();
      if (!token || !password) return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
      if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      const user = await getUserByResetToken(token);
      if (!user) return NextResponse.json({ error: "Reset link is invalid or has expired" }, { status: 400 });
      const hashed = await bcrypt.hash(password, 12);
      await updateUser(user.id, { password: hashed, passwordResetToken: "", passwordResetExpires: null });
      return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
    } catch (e) {
      console.error("Reset password error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "send-code") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const user = await getUserById(authUser.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (user.emailVerified) return NextResponse.json({ message: "Already verified." });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await updateUser(user.id, { emailVerificationCode: code, emailVerificationCodeExpires: expires });
      try {
        await sendVerificationCodeEmail(user.email, user.name, code);
      } catch (emailErr: any) {
        return NextResponse.json({ error: emailErr.message || "Failed to send code. Please try again." }, { status: 500 });
      }
      return NextResponse.json({ message: "Code sent." });
    } catch (e) {
      console.error("Send code error:", e);
      return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
    }
  }

  if (action === "verify-code") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { code } = await request.json();
      if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
      const pool = getPool();
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE id = $1 AND email_verification_code = $2 AND email_verification_code_expires > NOW()`,
        [authUser.userId, String(code)]
      );
      if (!rows.length) return NextResponse.json({ error: "Invalid or expired code. Please request a new one." }, { status: 400 });
      await updateUser(authUser.userId, { emailVerified: true, emailVerificationCode: "", emailVerificationCodeExpires: null });
      return NextResponse.json({ message: "Email verified. You now have your verified badge!" });
    } catch (e) {
      console.error("Verify code error:", e);
      return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
    }
  }

  if (action === "resend-code") {
    try {
      const { emailOrUsername, password } = await request.json();
      if (!emailOrUsername || !password) return NextResponse.json({ error: "Credentials required" }, { status: 400 });
      const user = await getUserByEmailOrUsername(emailOrUsername);
      if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      if (user.emailVerified) return NextResponse.json({ message: "Already verified." });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await updateUser(user.id, { emailVerificationCode: code, emailVerificationCodeExpires: expires });
      try {
        await sendVerificationCodeEmail(user.email, user.name, code);
      } catch (emailErr: any) {
        return NextResponse.json({ error: emailErr.message || "Failed to send code. Please try again." }, { status: 500 });
      }
      return NextResponse.json({ message: "Code sent." });
    } catch (e) {
      console.error("Resend code error:", e);
      return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
    }
  }

  if (action === "send-verification") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const user = await getUserById(authUser.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (user.emailVerified) return NextResponse.json({ message: "Email is already verified." });
      const token = randomUUID();
      await updateUser(user.id, { emailVerificationToken: token });
      try {
        await sendVerificationEmail(user.email, user.name, token, getBaseUrl(request));
      } catch (emailErr: any) {
        return NextResponse.json({ error: emailErr.message || "Failed to send verification email." }, { status: 500 });
      }
      return NextResponse.json({ message: "Verification email sent. Please check your inbox." });
    } catch (e) {
      console.error("Send verification error:", e);
      return NextResponse.json({ error: "Failed to send verification email." }, { status: 500 });
    }
  }

  if (action === "login-unverified") {
    try {
      const { emailOrUsername, password, code } = await request.json();
      if (!emailOrUsername || !password || !code)
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
      const user = await getUserByEmailOrUsername(emailOrUsername);
      if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const pool = getPool();
      const { rows } = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND email_verification_code = $2 AND email_verification_code != '' AND email_verification_code_expires > NOW()`,
        [user.id, String(code).trim()]
      );
      if (!rows.length) {
        const { rows: codeRows } = await pool.query(`SELECT email_verification_code_expires FROM users WHERE id = $1`, [user.id]);
        const expiry = codeRows[0]?.email_verification_code_expires;
        if (expiry && new Date(expiry) < new Date()) {
          return NextResponse.json({ error: "Your code has expired. Click 'Resend code' to get a new one." }, { status: 400 });
        }
        return NextResponse.json({ error: "Incorrect code. Please check your email and try again." }, { status: 400 });
      }
      await updateUser(user.id, { emailVerified: true, emailVerificationCode: "", emailVerificationCodeExpires: null });
      const jwtToken = await signToken({ userId: user.id, email: user.email, username: user.username, name: user.name, profileImage: user.profileImage || "" });
      const { password: _pw, ...safeUser } = user;
      const response = NextResponse.json({ message: "Email verified and login successful", token: jwtToken, user: safeUser });
      response.cookies.set("lawsa-token", jwtToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 60 * 60 * 24 * 30, path: "/" });
      return response;
    } catch (e) {
      console.error("Login-unverified error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
