import { createClient } from "@/lib/supabase/server";
import { AGENTS } from "@/lib/agents/registry";
import { AgentCard } from "@/components/shell/agent-card";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: installed } = user
    ? await supabase
        .from("user_agents")
        .select("agents(slug)")
        .eq("user_id", user.id)
        .eq("is_active", true)
    : { data: [] };

  const installedSlugs = new Set((installed ?? []).map((row: any) => row.agents?.slug));

  return (
    <div className="px-4 pt-8">
      <h1 className="mb-1 text-xl font-bold">Agents disponibles</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Connecte tes outils une fois, l'agent travaille 24/7.
      </p>
      <div className="space-y-3">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} installed={installedSlugs.has(agent.slug)} />
        ))}
      </div>
    </div>
  );
}
