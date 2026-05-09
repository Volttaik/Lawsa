import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken, getUserFromRequest } from "../lib/auth.js";
import { getUserByEmailOrUsername, createUser, getUserById, updateUser, getUserByVerificationToken } from "../lib/queries.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name?.trim() || !username?.trim() || !email?.trim() || !password?.trim())
      return res.status(400).json({ error: "All fields required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const usernameClean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!usernameClean) return res.status(400).json({ error: "Invalid username" });
    const existing = await getUserByEmailOrUsername(email);
    if (existing) return res.status(400).json({ error: "Email or username already taken" });
    const existingUsername = await getUserByEmailOrUsername(usernameClean);
    if (existingUsername) return res.status(400).json({ error: "Username already taken" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name: name.trim(), username: usernameClean, email, password: hashed });
    if (!user) return res.status(500).json({ error: "Failed to create user" });
    const token = await signToken({ userId: user.id, email: user.email, username: user.username, name: user.name });
    res.cookie("lawsa-token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000, path: "/" });
    const { password: _, ...safeUser } = user as any;
    res.json({ user: safeUser, token });
  } catch (e: any) {
    console.error("[register]", e);
    if (e.code === "23505") return res.status(400).json({ error: "Email or username already taken" });
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await getUserByEmailOrUsername(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password || "");
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = await signToken({ userId: user.id, email: user.email, username: user.username, name: user.name, profileImage: user.profileImage });
    res.cookie("lawsa-token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000, path: "/" });
    const { password: _, ...safeUser } = user as any;
    res.json({ user: safeUser, token });
  } catch (e) { console.error("[login]", e); res.status(500).json({ error: "Login failed" }); }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("lawsa-token", { path: "/" });
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const user = await getUserById(auth.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    const { password: _, ...safeUser } = user as any;
    res.json({ user: safeUser });
  } catch (e) { console.error("[me]", e); res.status(500).json({ error: "Failed" }); }
});

router.post("/auth/send-verification", async (req, res) => {
  try {
    const auth = await getUserFromRequest(req);
    if (!auth) return res.status(401).json({ error: "Not authenticated" });
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await updateUser(auth.userId, { emailVerificationToken: token });
    res.json({ success: true, message: "Verification email sent (configure SMTP to enable email delivery)" });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

router.get("/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query as any;
    if (!token) return res.status(400).json({ error: "Token required" });
    const user = await getUserByVerificationToken(token);
    if (!user) return res.status(400).json({ error: "Invalid token" });
    await updateUser(user.id, { emailVerified: true, emailVerificationToken: "" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

export default router;
