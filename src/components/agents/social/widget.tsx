import { createClient } from "@/lib/supabase/server";
import { PublishButton } from "@/components/agents/social/publish-button";

export async function SocialWidget({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("social_posts")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["draft", "scheduled"])
    .order("scheduled_at", { ascending: true })
    .limit(5);

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">📱</span>
        <h2 className="font-semibold">Agent Social Media</h2>
        <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> actif
        </span>
      </div>

      <p className="mb-2 text-xs font-medium uppercase text-neutral-500">À valider</p>
      {!pending?.length ? (
        <p className="text-xs text-neutral-600">Aucun post en attente.</p>
      ) : (
        <ul className="space-y-2">
          {pending.map((post) => (
            <li key={post.id} className="rounded-xl bg-neutral-950 p-3 ring-1 ring-neutral-800">
              <p className="mb-1 text-xs uppercase text-neutral-500">{post.platform}</p>
              <p className="text-sm">{post.content?.slice(0, 100)}...</p>
              <div className="mt-2 flex gap-2">
                <PublishButton postId={post.id} />
                <button className="rounded-full bg-neutral-800 px-3 py-1 text-xs">
                  Modifier
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
