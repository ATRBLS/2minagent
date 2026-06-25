import { NextResponse } from "next/server";
import { LINKEDIN_AUTH_URL, LINKEDIN_SCOPES, getLinkedinRedirectUri } from "@/lib/agents/social/linkedin";

export async function GET() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: getLinkedinRedirectUri(),
    scope: LINKEDIN_SCOPES,
  });

  return NextResponse.redirect(`${LINKEDIN_AUTH_URL}?${params.toString()}`);
}
