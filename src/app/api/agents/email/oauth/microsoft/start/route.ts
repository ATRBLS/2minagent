import { NextResponse } from "next/server";
import { MS_AUTH_URL, MS_SCOPES, getMicrosoftRedirectUri } from "@/lib/agents/email/outlook";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: getMicrosoftRedirectUri(),
    response_mode: "query",
    scope: MS_SCOPES,
    prompt: "consent",
  });

  return NextResponse.redirect(`${MS_AUTH_URL}?${params.toString()}`);
}
