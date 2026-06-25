import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/push/send";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: emailAgent } = await supabase.from("agents").select("id").eq("slug", "email-agent").single();

  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: staleEmails } = await supabase
    .from("emails")
    .select("*, reminders(id)")
    .eq("category", "action_required")
    .eq("is_done", false)
    .is("replied_at", null)
    .lte("received_at", cutoff48h);

  let remindersSent = 0;

  for (const email of staleEmails ?? []) {
    if (email.reminders?.length) continue; // already reminded once

    await notifyUser(email.user_id, emailAgent?.id ?? null, {
      type: "reminder_48h",
      title: "⏰ Toujours sans réponse",
      body: `${email.sender_name}: ${email.ai_summary?.slice(0, 60) ?? ""}`,
      url: "/home",
    });

    await supabase.from("reminders").insert({
      user_id: email.user_id,
      email_id: email.id,
      remind_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
    });

    remindersSent++;
  }

  const cutoff24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const { data: upcomingDeadlines } = await supabase
    .from("emails")
    .select("*")
    .eq("category", "deadline")
    .eq("is_done", false)
    .eq("deadline_date", cutoff24h)
    .neq("deadline_date", today);

  for (const email of upcomingDeadlines ?? []) {
    await notifyUser(email.user_id, emailAgent?.id ?? null, {
      type: "deadline_24h",
      title: "🟡 Échéance demain",
      body: `${email.sender_name}: ${email.ai_summary?.slice(0, 60) ?? ""}`,
      url: "/home",
    });
  }

  return NextResponse.json({ ok: true, remindersSent, deadlineAlertsSent: upcomingDeadlines?.length ?? 0 });
}
