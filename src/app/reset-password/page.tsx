"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // The recovery link sets a session automatically once the client picks up
    // the code/tokens from the URL. We just wait for that session to exist.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else setInvalid(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/home"), 1200);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Nouveau mot de passe</h1>

        {invalid && (
          <div className="rounded-xl bg-surface p-4 text-sm">
            Ce lien n'est plus valide. Demande un nouveau lien depuis{" "}
            <a href="/forgot-password" className="text-primary underline">
              mot de passe oublié
            </a>
            .
          </div>
        )}

        {!ready && !invalid && <p className="text-sm text-muted-foreground">Vérification du lien...</p>}

        {ready && !done && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirme le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "..." : "Mettre à jour le mot de passe"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}

        {done && <div className="rounded-xl bg-surface p-4 text-sm">✅ Mot de passe mis à jour. Redirection...</div>}
      </div>
    </main>
  );
}
