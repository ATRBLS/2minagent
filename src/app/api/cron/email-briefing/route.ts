import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/push/send";

// Triggered by Vercel Cron every hour; sends the briefing only to users
// whose local time is currently 8am.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: users } = await supabase.from("users").select("id, timezone, plan");

  const { data: emailAgent } = await supabase.from("agents").select("id").eq("slug", "email-agent").single();

  let sent = 0;

  for (const user of users ?? []) {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: user.timezone }).format(new Date())
    );
    if (hour !== 8) continue;

    const [{ count: actionCount }, { count: deadlineCount }] = await Promise.all([
      supabase
        .from("emails")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("category", "action_required")
        .eq("is_done", false),
      supabase
        .from("emails")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("category", "deadline")
        .eq("is_done", false),
    ]);

    if (!actionCount && !deadlineCount) continue;

    await notifyUser(user.id, emailAgent?.id ?? null, {
      type: "daily_briefing",
      title: "☀️ Briefing du matin",
      body: `${actionCount ?? 0} actions, ${deadlineCount ?? 0} échéances aujourd'hui`,
      url: "/home",
    });
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
