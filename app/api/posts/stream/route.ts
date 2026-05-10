import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPosts, getUserById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) return new Response("Not authenticated", { status: 401 });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };

      // Send snapshot immediately — user sees posts right away
      const [snapshot, me] = await Promise.all([
        getPosts({}, 0, 15),
        getUserById(authUser.userId),
      ]);
      send({ type: "snapshot", posts: snapshot, me });

      // Poll every 15s only to detect brand-new posts (badge notification)
      // We dropped countPosts — it was an extra DB hit and the client never used it
      const timer = setInterval(async () => {
        if (closed) { clearInterval(timer); return; }
        const [posts, refreshedMe] = await Promise.all([
          getPosts({}, 0, 15),
          getUserById(authUser.userId),
        ]);
        send({ type: "update", posts, me: refreshedMe });
      }, 15000);

      const keepAlive = setInterval(() => {
        if (!closed) { try { controller.enqueue(encoder.encode(`: keep-alive\n\n`)); } catch {} }
      }, 20000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(timer);
        clearInterval(keepAlive);
        try { controller.close(); } catch {}
      });
    },
    cancel() { closed = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
