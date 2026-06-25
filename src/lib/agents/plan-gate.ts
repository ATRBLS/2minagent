import { createClient } from "@/lib/supabase/server";

export async function canInstallAnotherAgent(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: profile } = await supabase.from("users").select("plan").eq("id", userId).single();
  if (profile?.plan !== "free") return true;

  const { count } = await supabase
    .from("user_agents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true);

  return (count ?? 0) < 1;
}
