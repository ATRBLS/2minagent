import Link from "next/link";
import type { AgentMeta } from "@/lib/agents/registry";

export function AgentCard({ agent, installed }: { agent: AgentMeta; installed?: boolean }) {
  const comingSoon = agent.status === "coming_soon";

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl">{agent.emoji}</span>
        <div>
          <h3 className="font-semibold">{agent.name}</h3>
          <p className="text-xs text-neutral-500">{agent.category}</p>
        </div>
        {installed && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            actif
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-neutral-400">{agent.description}</p>
      {comingSoon ? (
        <span className="inline-block rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-neutral-500">
          Bientôt disponible
        </span>
      ) : installed ? (
        <Link
          href={`/agents/${agent.slug.replace("-agent", "")}`}
          className="inline-block rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-medium"
        >
          Ouvrir
        </Link>
      ) : (
        <Link
          href={agent.installHref!}
          className="inline-block rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-black"
        >
          Installer en 2 min
        </Link>
      )}
    </div>
  );
}
