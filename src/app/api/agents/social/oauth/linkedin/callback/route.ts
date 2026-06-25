import { NextResponse, type NextRequest } from "next/server";
import { exchangeLinkedinCode } from "@/lib/agents/social/linkedin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!code) return NextResponse.redirect(`${appUrl}/agents/social/install?error=missing_code`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const tokens = await exchangeLinkedinCode(code);

  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();

  await supabase.from("connected_accounts").upsert(
    {
      user_id: user.id,
      provider: "linkedin",
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      account_email: profile.email ?? profile.sub,
    },
    { onConflict: "user_id,provider" }
  );

  return NextResponse.redirect(`${appUrl}/agents/social/install?step=questions`);
}
