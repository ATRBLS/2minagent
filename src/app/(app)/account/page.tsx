import { createClient } from "@/lib/supabase/server";
import { PushOptIn } from "@/components/shell/push-opt-in";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("*").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="px-4 pt-8">
      <h1 className="mb-6 text-xl font-bold">Mon compte</h1>

      <div className="mb-4 rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
        <p className="text-sm text-neutral-400">Connecté en tant que</p>
        <p className="font-medium">{user?.email}</p>
        <p className="mt-2 inline-block rounded-full bg-neutral-800 px-3 py-1 text-xs capitalize">
          Plan {profile?.plan ?? "free"}
        </p>
      </div>

      <PushOptIn enabled={!!profile?.push_subscription} />

      <form action="/api/auth/signout" method="post" className="mt-6">
        <button className="w-full rounded-xl bg-neutral-900 py-3 text-sm text-red-400 ring-1 ring-neutral-800">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
