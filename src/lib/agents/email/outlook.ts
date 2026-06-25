import { Client } from "@microsoft/microsoft-graph-client";

const TENANT = "common";
export const MS_AUTH_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`;
export const MS_TOKEN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
export const MS_SCOPES = ["openid", "email", "offline_access", "Mail.Read"].join(" ");

export function getMicrosoftRedirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/email/oauth/microsoft/callback`;
}

export async function exchangeMicrosoftCode(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    code,
    redirect_uri: getMicrosoftRedirectUri(),
    grant_type: "authorization_code",
    scope: MS_SCOPES,
  });

  const res = await fetch(MS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) throw new Error(`Microsoft token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

export async function fetchRecentOutlookMessages(accessToken: string, top = 20) {
  const client = Client.init({ authProvider: (done) => done(null, accessToken) });

  const result = await client
    .api("/me/messages")
    .top(top)
    .select("id,subject,from,receivedDateTime,bodyPreview")
    .filter(`receivedDateTime ge ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()}`)
    .get();

  return (result.value ?? []).map((m: any) => ({
    messageId: m.id,
    senderName: m.from?.emailAddress?.name ?? "",
    senderEmail: m.from?.emailAddress?.address ?? "",
    subject: m.subject ?? "",
    receivedAt: m.receivedDateTime,
    bodySnippet: m.bodyPreview ?? "",
  }));
}
