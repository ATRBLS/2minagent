import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAgent } from "@/lib/agents/registry";

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: agent } = await supabase.from("agents").select("*").eq("slug", slug).single();
  if (!agent) notFound();

  const { data: reviews } = await supabase
    .from("agent_reviews")
    .select("*")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const meta = getAgent(slug);

  return (
    <div className="px-4 pt-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{meta?.emoji ?? "🤖"}</span>
        <div>
          <h1 className="text-xl font-bold">{agent.name}</h1>
          <p className="text-xs text-neutral-500">
            {agent.category} {avgRating && `· ⭐ ${avgRating}`}
          </p>
        </div>
      </div>

      <p className="mb-6 text-sm text-neutral-400">{agent.description}</p>

      {agent.status === "coming_soon" ? (
        <span className="inline-block rounded-full bg-neutral-800 px-4 py-2 text-xs text-neutral-500">
          Bientôt disponible
        </span>
      ) : (
        <Link
          href={meta?.installHref ?? "/agents"}
          className="inline-block rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-black"
        >
          Installer en 2 min
        </Link>
      )}

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold">Avis</h2>
        {!reviews?.length ? (
          <p className="text-xs text-neutral-600">Aucun avis pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl bg-neutral-900 p-3 ring-1 ring-neutral-800">
                <p className="text-xs text-yellow-400">{"⭐".repeat(r.rating)}</p>
                <p className="mt-1 text-sm text-neutral-300">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
