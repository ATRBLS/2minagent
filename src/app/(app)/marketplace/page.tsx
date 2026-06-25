import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: agents } = await supabase.from("agents").select("*").order("created_at");

  const categories = [...new Set((agents ?? []).map((a) => a.category))];

  return (
    <div className="px-4 pt-8">
      <h1 className="mb-1 text-xl font-bold">Marketplace</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Agents 1ʳᵉ partie et bientôt des agents tiers, construits par des builders.
      </p>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase text-neutral-500">{category}</h2>
          <div className="space-y-2">
            {agents!
              .filter((a) => a.category === category)
              .map((agent) => (
                <Link
                  key={agent.id}
                  href={`/marketplace/${agent.slug}`}
                  className="flex items-center gap-3 rounded-xl bg-neutral-900 p-3 ring-1 ring-neutral-800"
                >
                  <span className="text-2xl">{agent.icon ? "" : "🤖"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-neutral-500">{agent.description}</p>
                  </div>
                  {agent.status === "coming_soon" && (
                    <span className="rounded-full bg-neutral-800 px-2 py-1 text-[10px] text-neutral-500">
                      Bientôt
                    </span>
                  )}
                </Link>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-8 rounded-2xl bg-neutral-900 p-4 text-center ring-1 ring-neutral-800">
        <p className="mb-1 text-sm font-medium">Tu construis des agents IA ?</p>
        <p className="mb-3 text-xs text-neutral-500">
          Rejoins le programme Builder — 70% de revenus, API dédiée.
        </p>
        <Link href="/upgrade" className="inline-block rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-black">
          Devenir Builder
        </Link>
      </div>
    </div>
  );
}
