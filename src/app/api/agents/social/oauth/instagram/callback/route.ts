import { NextResponse, type NextRequest } from "next/server";
import { exchangeInstagramCode } from "@/lib/agents/social/instagram";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!code) return NextResponse.redirect(`${appUrl}/agents/social/install?error=missing_code`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const tokens = await exchangeInstagramCode(code);

  await supabase.from("connected_accounts").upsert(
    {
      user_id: user.id,
      provider: "instagram",
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    },
    { onConflict: "user_id,provider" }
  );

  return NextResponse.redirect(`${appUrl}/agents/social/install?step=questions`);
}
