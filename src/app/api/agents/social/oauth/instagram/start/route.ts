import { NextResponse } from "next/server";
import { INSTAGRAM_AUTH_URL, INSTAGRAM_SCOPES, getInstagramRedirectUri } from "@/lib/agents/social/instagram";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    redirect_uri: getInstagramRedirectUri(),
    scope: INSTAGRAM_SCOPES,
    response_type: "code",
  });

  return NextResponse.redirect(`${INSTAGRAM_AUTH_URL}?${params.toString()}`);
}
