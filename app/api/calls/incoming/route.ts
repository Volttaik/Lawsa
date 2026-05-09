import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns any pending call-invite directed at the current user in the last 30 seconds.
// Used by the layout to show the incoming call banner.
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ call: null });

    const since = new Date(Date.now() - 30_000).toISOString();
    const pool = getPool();

    const { rows } = await pool.query(
      `SELECT * FROM call_signals WHERE to_user_id = $1 AND type = 'call-invite' AND created_at > $2 ORDER BY created_at DESC LIMIT 1`,
      [authUser.userId, since]
    );

    if (!rows.length) return NextResponse.json({ call: null });

    const invite = rows[0];

    const { rows: hangups } = await pool.query(
      `SELECT id FROM call_signals WHERE session_id = $1 AND type IN ('hangup','decline') LIMIT 1`,
      [invite.session_id]
    );

    if (hangups.length > 0) return NextResponse.json({ call: null });

    return NextResponse.json({
      call: {
        sessionId: invite.session_id,
        callerId: invite.from_user_id,
        callerName: invite.payload?.callerName || "Someone",
        callerImage: invite.payload?.callerImage || "",
        callType: invite.payload?.callType || "video",
      },
    });
  } catch {
    return NextResponse.json({ call: null });
  }
}
