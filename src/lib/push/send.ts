import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
};

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("push_subscription")
    .eq("id", userId)
    .single();

  if (!user?.push_subscription) return { sent: false, reason: "no_subscription" };

  try {
    await webpush.sendNotification(
      user.push_subscription,
      JSON.stringify(payload)
    );
    return { sent: true };
  } catch (err: any) {
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      await supabase.from("users").update({ push_subscription: null }).eq("id", userId);
    }
    return { sent: false, reason: err?.message };
  }
}

export async function notifyUser(
  userId: string,
  agentId: string | null,
  payload: PushPayload & { type: string }
) {
  const supabase = createAdminClient();

  const { data: notification } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      agent_id: agentId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      action_url: payload.url,
    })
    .select()
    .single();

  const result = await sendPushToUser(userId, payload);

  if (notification && result.sent) {
    await supabase
      .from("notifications")
      .update({ push_sent: true })
      .eq("id", notification.id);
  }

  return result;
}
