import { createClient } from "@/lib/supabase/server";
import { MarkDoneButton } from "@/components/agents/email/mark-done-button";

export async function EmailWidget({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [actionRequired, deadlines, info] = await Promise.all([
    supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .eq("category", "action_required")
      .eq("is_done", false)
      .order("received_at", { ascending: false })
      .limit(10),
    supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .eq("category", "deadline")
      .eq("is_done", false)
      .order("deadline_date", { ascending: true })
      .limit(10),
    supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .eq("category", "info")
      .order("received_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">📧</span>
        <h2 className="font-semibold">Agent Email</h2>
        <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> actif
        </span>
      </div>

      <EmailColumn title="À répondre" emails={actionRequired.data ?? []} emptyText="Rien à répondre 🎉" />
      <EmailColumn title="Échéances" emails={deadlines.data ?? []} emptyText="Aucune échéance" />
      <EmailColumn title="À lire" emails={info.data ?? []} emptyText="Rien à lire" collapsedDefault />
    </div>
  );
}

function EmailColumn({
  title,
  emails,
  emptyText,
}: {
  title: string;
  emails: any[];
  emptyText: string;
  collapsedDefault?: boolean;
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium uppercase text-neutral-500">{title}</p>
      {emails.length === 0 ? (
        <p className="text-xs text-neutral-600">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {emails.map((email) => (
            <li key={email.id} className="rounded-xl bg-neutral-950 p-3 ring-1 ring-neutral-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{email.sender_name || email.sender_email}</p>
                <CategoryBadge category={email.category} />
              </div>
              <p className="mt-1 text-xs text-neutral-400">{email.ai_summary}</p>
              <MarkDoneButton emailId={email.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { emoji: string; label: string }> = {
    action_required: { emoji: "🔴", label: "Action" },
    deadline: { emoji: "🟡", label: "Échéance" },
    info: { emoji: "🟢", label: "Info" },
    noise: { emoji: "⚫", label: "Bruit" },
  };
  const c = map[category] ?? { emoji: "", label: category };
  return <span className="text-xs">{c.emoji}</span>;
}
