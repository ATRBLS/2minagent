export const INSTAGRAM_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth";
export const INSTAGRAM_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token";
export const INSTAGRAM_SCOPES = "instagram_basic,instagram_content_publish,pages_show_list";

export function getInstagramRedirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/social/oauth/instagram/callback`;
}

export async function exchangeInstagramCode(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
    redirect_uri: getInstagramRedirectUri(),
    code,
  });

  const res = await fetch(`${INSTAGRAM_TOKEN_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Instagram token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function publishInstagramPost(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
) {
  const createRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
  });
  const { id: creationId } = await createRes.json();

  const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId, access_token: accessToken }),
  });

  if (!publishRes.ok) throw new Error(`Instagram publish failed: ${await publishRes.text()}`);
  return publishRes.json();
}
