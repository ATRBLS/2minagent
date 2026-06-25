import { NextResponse } from "next/server";
import { getGoogleOAuthClient, GOOGLE_SCOPES } from "@/lib/agents/email/gmail";

export async function GET() {
  const client = getGoogleOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
  });
  return NextResponse.redirect(url);
}
