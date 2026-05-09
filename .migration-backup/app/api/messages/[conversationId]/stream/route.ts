import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getConversationById, getMessages, getUserById, markMessagesRead } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const authUser = await getUserFromRequest(request);
  if (!authUser) {
    return new Response("Not authenticated", { status: 401 });
  }

  const { conversationId } = await params;
  const conv = await getConversationById(conversationId);
  if (!conv || !conv.participants.includes(authUser.userId)) {
    return new Response("Not found", { status: 404 });
  }

  const otherId = conv.participants.find((p: string) => p !== authUser.userId);

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send initial snapshot immediately and mark our incoming messages as read
      try {
        await markMessagesRead(conversationId, authUser.userId);
        const [messages, other, freshConv] = await Promise.all([
          getMessages(conversationId),
          otherId ? getUserById(otherId) : Promise.resolve(null),
          getConversationById(conversationId),
        ]);
        const otherUserOnline = !!other?.lastOnline && (Date.now() - new Date(other.lastOnline).getTime()) < 90000;
        const typingExpiry = otherId ? (freshConv?.typingUsers || {})[otherId] : null;
        const otherUserTyping = !!(typingExpiry && new Date(typingExpiry).getTime() > Date.now());
        send({ type: "snapshot", messages, otherUserOnline, otherUserTyping });
      } catch (e) {
        send({ type: "error", message: "Failed to load messages" });
      }

      // Poll for updates every 5 seconds — marks messages as read on each tick
      // Batching all 3 reads into Promise.all so they run in parallel not series
      let tickCount = 0;
      const timer = setInterval(async () => {
        if (closed) { clearInterval(timer); return; }
        tickCount++;
        try {
          // Only re-fetch the other user's profile every 5 ticks (~15s) — it rarely changes
          const shouldRefreshUser = tickCount % 5 === 0;
          const [_, messages, freshConv, other] = await Promise.all([
            markMessagesRead(conversationId, authUser.userId),
            getMessages(conversationId),
            getConversationById(conversationId),
            shouldRefreshUser && otherId ? getUserById(otherId) : Promise.resolve(null),
          ]);
          const isOnline = other
            ? !!other.lastOnline && (Date.now() - new Date(other.lastOnline).getTime()) < 90000
            : undefined;
          const typingExpiry = otherId ? (freshConv?.typingUsers || {})[otherId] : null;
          const isTyping = !!(typingExpiry && new Date(typingExpiry).getTime() > Date.now());
          const payload: any = { type: "update", messages, otherUserTyping: isTyping };
          if (isOnline !== undefined) payload.otherUserOnline = isOnline;
          send(payload);
        } catch {}
      }, 5000);

      const keepAlive = setInterval(() => {
        if (!closed) {
          try { controller.enqueue(encoder.encode(`: keep-alive\n\n`)); } catch {}
        }
      }, 20000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(timer);
        clearInterval(keepAlive);
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
