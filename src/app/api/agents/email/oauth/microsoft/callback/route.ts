import { NextResponse, type NextRequest } from "next/server";
import { exchangeMicrosoftCode } from "@/lib/agents/email/outlook";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!code) return NextResponse.redirect(`${appUrl}/agents/email/install?error=missing_code`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const tokens = await exchangeMicrosoftCode(code);

  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();

  await supabase.from("connected_accounts").upsert(
    {
      user_id: user.id,
      provider: "outlook",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      account_email: profile.mail ?? profile.userPrincipalName,
    },
    { onConflict: "user_id,provider" }
  );

  const { data: agent } = await supabase.from("agents").select("id").eq("slug", "email-agent").single();
  if (agent) {
    await supabase
      .from("user_agents")
      .upsert({ user_id: user.id, agent_id: agent.id, is_active: true }, { onConflict: "user_id,agent_id" });
  }

  fetch(`${appUrl}/api/agents/email/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
    body: JSON.stringify({ userId: user.id }),
  }).catch(() => {});

  return NextResponse.redirect(`${appUrl}/home`);
}
