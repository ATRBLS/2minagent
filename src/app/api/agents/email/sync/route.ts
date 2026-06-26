import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncEmailsForUser } from "@/lib/agents/email/sync";

export async function POST(request: Request) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const isInternalCall = request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

  if (!isInternalCall) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await syncEmailsForUser(userId);
  return NextResponse.json({ ok: true, ...result });
}
