import { NextResponse, type NextRequest } from "next/server";
import { getGoogleOAuthClient } from "@/lib/agents/email/gmail";
import { createClient } from "@/lib/supabase/server";
import { canInstallAnotherAgent } from "@/lib/agents/plan-gate";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!code) return NextResponse.redirect(`${appUrl}/agents/email/install?error=missing_code`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);
  if (!(await canInstallAnotherAgent(user.id))) {
    return NextResponse.redirect(`${appUrl}/upgrade?reason=plan_limit`);
  }

  const oauthClient = getGoogleOAuthClient();
  const { tokens } = await oauthClient.getToken(code);
  oauthClient.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauthClient });
  const { data: profile } = await oauth2.userinfo.get();

  await supabase.from("connected_accounts").upsert(
    {
      user_id: user.id,
      provider: "gmail",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      account_email: profile.email,
    },
    { onConflict: "user_id,provider" }
  );

  const { data: agent } = await supabase.from("agents").select("id").eq("slug", "email-agent").single();
  if (agent) {
    await supabase
      .from("user_agents")
      .upsert({ user_id: user.id, agent_id: agent.id, is_active: true }, { onConflict: "user_id,agent_id" });
  }

  // kick off first sync in the background
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
