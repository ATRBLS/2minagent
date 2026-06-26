import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { syncEmailsForUser } from "@/lib/agents/email/sync";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("user_id")
    .in("provider", ["gmail", "outlook"]);

  const userIds = [
    ...new Set(((accounts ?? []) as { user_id: string }[]).map((a) => a.user_id)),
  ];

  let newActionRequired = 0;
  let newDeadlines = 0;

  for (const userId of userIds) {
    const result = await syncEmailsForUser(userId);
    newActionRequired += result.newActionRequired;
    newDeadlines += result.newDeadlines;
  }

  return NextResponse.json({ ok: true, usersSynced: userIds.length, newActionRequired, newDeadlines });
}
