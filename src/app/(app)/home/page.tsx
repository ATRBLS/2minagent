import { createClient } from "@/lib/supabase/server";
import { AGENTS } from "@/lib/agents/registry";
import { AgentCard } from "@/components/shell/agent-card";
import { EmailWidget } from "@/components/agents/email/widget";
import { SocialWidget } from "@/components/agents/social/widget";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: installed } = user
    ? await supabase
        .from("user_agents")
        .select("agent_id, agents(slug)")
        .eq("user_id", user.id)
        .eq("is_active", true)
    : { data: [] };

  const installedSlugs = new Set(
    (installed ?? []).map((row: any) => row.agents?.slug)
  );

  if (installedSlugs.size === 0) {
    return (
      <div className="px-4 pt-8">
        <h1 className="mb-1 text-xl font-bold">Bienvenue sur 2minAgent</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Installe ton premier agent et laisse-le travailler pour toi.
        </p>
        <div className="space-y-3">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-6">
      <h1 className="text-xl font-bold">Tes agents</h1>
      {installedSlugs.has("email-agent") && <EmailWidget userId={user!.id} />}
      {installedSlugs.has("social-media-agent") && <SocialWidget userId={user!.id} />}
    </div>
  );
}
