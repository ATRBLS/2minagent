import { createAdminClient } from "@/lib/supabase/server";
import { fetchRecentGmailMessages } from "@/lib/agents/email/gmail";
import { fetchRecentOutlookMessages } from "@/lib/agents/email/outlook";
import { classifyEmail } from "@/lib/agents/email/classify";
import { notifyUser } from "@/lib/push/send";

export async function syncEmailsForUser(userId: string) {
  const supabase = createAdminClient();

  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .in("provider", ["gmail", "outlook"]);

  const { data: agent } = await supabase.from("agents").select("id").eq("slug", "email-agent").single();

  let newActionRequired = 0;
  let newDeadlines = 0;

  for (const account of accounts ?? []) {
    const messages =
      account.provider === "gmail"
        ? await fetchRecentGmailMessages(account.access_token)
        : await fetchRecentOutlookMessages(account.access_token);

    for (const msg of messages) {
      const { data: existing } = await supabase
        .from("emails")
        .select("id")
        .eq("account_id", account.id)
        .eq("message_id", msg.messageId)
        .maybeSingle();

      if (existing) continue;

      const classification = await classifyEmail(msg);

      await supabase.from("emails").insert({
        user_id: userId,
        account_id: account.id,
        message_id: msg.messageId,
        sender_name: msg.senderName,
        sender_email: msg.senderEmail,
        subject: msg.subject,
        received_at: new Date(msg.receivedAt || Date.now()).toISOString(),
        category: classification.category,
        ai_summary: classification.ai_summary,
        action_needed: classification.action_needed,
        deadline_date: classification.deadline_date,
      });

      if (classification.category === "action_required") {
        newActionRequired++;
        await notifyUser(userId, agent?.id ?? null, {
          type: "action_required",
          title: `🔴 ${msg.senderName}`,
          body: classification.ai_summary.slice(0, 80),
          url: "/home",
        });
      }

      if (classification.category === "deadline") {
        newDeadlines++;
        await notifyUser(userId, agent?.id ?? null, {
          type: "deadline_detected",
          title: `🟡 ${msg.senderName}`,
          body: classification.ai_summary.slice(0, 80),
          url: "/home",
        });
      }
    }
  }

  return { newActionRequired, newDeadlines };
}
