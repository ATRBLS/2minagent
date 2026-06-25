import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishLinkedinPost } from "@/lib/agents/social/linkedin";
import { publishInstagramPost } from "@/lib/agents/social/instagram";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: post } = await supabase
    .from("social_posts")
    .select("*, connected_accounts(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    if (post.platform === "linkedin") {
      const account = post.connected_accounts;
      await publishLinkedinPost(account.access_token, `urn:li:person:${account.account_email}`, post.content);
    } else {
      // Instagram requires an image; left as a manual step for v1 if none attached.
      await publishInstagramPost(
        post.connected_accounts.account_email,
        post.connected_accounts.access_token,
        "",
        post.content
      );
    }

    await supabase
      .from("social_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await supabase.from("social_posts").update({ status: "failed" }).eq("id", id);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
