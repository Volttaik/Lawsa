import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lawsa-socials-secret-key-2024-very-secure"
);

export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lawsa-token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    const p = payload as any;

    return {
      userId: p.userId,
      email: p.email,
      username: p.username,
      name: p.name,
      profileImage: p.profileImage || "",
    };
  } catch {
    return null;
  }
}
