import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateWeeklyPosts, nextOptimalSlot, POSTING_SLOTS } from "@/lib/agents/social/generate";
import { notifyUser } from "@/lib/push/send";

// Runs every Monday — generates the week's content plan for every active user.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: agent } = await supabase.from("agents").select("id").eq("slug", "social-media-agent").single();

  const { data: userAgents } = await supabase
    .from("user_agents")
    .select("user_id, user_voice_profile:user_voice_profile(*)")
    .eq("agent_id", agent?.id)
    .eq("is_active", true);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  let plansGenerated = 0;

  for (const ua of userAgents ?? []) {
    const { data: profile } = await supabase
      .from("user_voice_profile")
      .select("*")
      .eq("user_id", ua.user_id)
      .single();
    if (!profile) continue;

    const { data: account } = await supabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", ua.user_id)
      .in("provider", ["linkedin", "instagram"])
      .limit(1)
      .maybeSingle();

    const posts = await generateWeeklyPosts({
      industry: profile.industry,
      topics: profile.topics ?? [],
      goal: profile.goal,
      toneDescriptors: profile.tone_descriptors ?? [],
    });

    await Promise.all(
      posts.map((post, i) =>
        supabase.from("social_posts").insert({
          user_id: ua.user_id,
          account_id: account?.id,
          platform: post.platform,
          content: post.content,
          hashtags: post.hashtags,
          scheduled_at: nextOptimalSlot(weekStart, POSTING_SLOTS[i] ?? i + 1),
          status: "draft",
        })
      )
    );

    await supabase.from("content_plans").insert({
      user_id: ua.user_id,
      week_start: weekStart.toISOString().slice(0, 10),
      posts_count: posts.length,
    });

    await notifyUser(ua.user_id, agent?.id ?? null, {
      type: "weekly_plan_ready",
      title: "📱 Ton plan de la semaine est prêt",
      body: "Valide tes posts en 1 tap",
      url: "/home",
    });

    plansGenerated++;
  }

  return NextResponse.json({ ok: true, plansGenerated });
}
