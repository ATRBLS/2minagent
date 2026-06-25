import { google } from "googleapis";

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/email/oauth/google/callback`
  );
}

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export async function fetchRecentGmailMessages(accessToken: string, maxResults = 20) {
  const auth = getGoogleOAuthClient();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "newer_than:2d",
  });

  const messages = await Promise.all(
    (list.data.messages ?? []).map(async (m) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      const headers = full.data.payload?.headers ?? [];
      const get = (name: string) => headers.find((h) => h.name === name)?.value ?? "";

      const fromHeader = get("From");
      const senderMatch = fromHeader.match(/^(.*?)\s*<(.+)>$/);

      return {
        messageId: m.id!,
        senderName: senderMatch ? senderMatch[1].replace(/"/g, "").trim() : fromHeader,
        senderEmail: senderMatch ? senderMatch[2] : fromHeader,
        subject: get("Subject"),
        receivedAt: get("Date"),
        bodySnippet: full.data.snippet ?? "",
      };
    })
  );

  return messages;
}
