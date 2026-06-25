import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { publishLinkedinPost } from "@/lib/agents/social/linkedin";
import { publishInstagramPost } from "@/lib/agents/social/instagram";
import { notifyUser } from "@/lib/push/send";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: agent } = await supabase.from("agents").select("id").eq("slug", "social-media-agent").single();

  const { data: pendingPosts } = await supabase
    .from("social_posts")
    .select("*, connected_accounts(*), user_agents:user_agents(config)")
    .eq("status", "draft")
    .not("scheduled_at", "is", null);

  let remindersSent = 0;
  let autoPublished = 0;

  for (const post of pendingPosts ?? []) {
    const ageMs = Date.now() - new Date(post.scheduled_at).getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    const hours48 = 48 * 60 * 60 * 1000;

    const { data: userAgent } = await supabase
      .from("user_agents")
      .select("config")
      .eq("user_id", post.user_id)
      .eq("agent_id", agent?.id)
      .single();
    const autoPublishEnabled = userAgent?.config?.auto_publish_after_48h === true;

    if (ageMs >= hours24 && ageMs < hours48 && !post.reminded_at) {
      await notifyUser(post.user_id, agent?.id ?? null, {
        type: "post_pending_reminder",
        title: "📱 Post en attente de validation",
        body: "Valide ou modifie avant publication",
        url: "/home",
      });
      await supabase.from("social_posts").update({ reminded_at: new Date().toISOString() }).eq("id", post.id);
      remindersSent++;
      continue;
    }

    if (ageMs >= hours48 && autoPublishEnabled) {
      try {
        if (post.platform === "linkedin") {
          await publishLinkedinPost(
            post.connected_accounts.access_token,
            `urn:li:person:${post.connected_accounts.account_email}`,
            post.content
          );
        } else {
          await publishInstagramPost(
            post.connected_accounts.account_email,
            post.connected_accounts.access_token,
            "",
            post.content
          );
        }
        await supabase
          .from("social_posts")
          .update({ status: "published", published_at: new Date().toISOString() })
          .eq("id", post.id);
        autoPublished++;
      } catch {
        await supabase.from("social_posts").update({ status: "failed" }).eq("id", post.id);
      }
    }
  }

  return NextResponse.json({ ok: true, remindersSent, autoPublished });
}
