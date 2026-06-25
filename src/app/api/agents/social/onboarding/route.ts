import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyPosts, nextOptimalSlot, POSTING_SLOTS } from "@/lib/agents/social/generate";
import { canInstallAnotherAgent } from "@/lib/agents/plan-gate";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!(await canInstallAnotherAgent(user.id))) {
    return NextResponse.json({ error: "plan_limit_reached" }, { status: 403 });
  }

  const { industry, topics, goal } = await request.json();

  await supabase.from("user_voice_profile").upsert(
    {
      user_id: user.id,
      industry,
      topics,
      goal,
      tone_descriptors: [],
    },
    { onConflict: "user_id" }
  );

  const { data: agent } = await supabase.from("agents").select("id").eq("slug", "social-media-agent").single();
  if (agent) {
    await supabase
      .from("user_agents")
      .upsert({ user_id: user.id, agent_id: agent.id, is_active: true }, { onConflict: "user_id,agent_id" });
  }

  const posts = await generateWeeklyPosts({ industry, topics, goal, toneDescriptors: [] });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("id, provider")
    .eq("user_id", user.id)
    .in("provider", ["linkedin", "instagram"])
    .limit(1)
    .maybeSingle();

  await Promise.all(
    posts.map((post, i) =>
      supabase.from("social_posts").insert({
        user_id: user.id,
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
    user_id: user.id,
    week_start: weekStart.toISOString().slice(0, 10),
    posts_count: posts.length,
  });

  return NextResponse.json({ ok: true, postsGenerated: posts.length });
}
