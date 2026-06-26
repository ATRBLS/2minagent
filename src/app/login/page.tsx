"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError("Email ou mot de passe incorrect.");
        return;
      }
      router.push("/home");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push("/home");
        router.refresh();
      } else {
        setConfirmSent(true);
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">2minAgent</h1>

        {confirmSent ? (
          <div className="rounded-xl bg-neutral-900 p-4 text-sm">
            ✉️ Compte créé. Confirme ton email (<strong>{email}</strong>) puis
            reviens te connecter.
          </div>
        ) : (
          <>
            <p className="mb-8 text-neutral-400">
              {mode === "signin" ? "Connecte-toi à ton compte." : "Crée ton compte en quelques secondes."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm outline-none ring-1 ring-neutral-800 focus:ring-green-500"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm outline-none ring-1 ring-neutral-800 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte"}
              </button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </form>

            {mode === "signin" && (
              <Link href="/forgot-password" className="mt-3 block text-center text-sm text-neutral-500">
                Mot de passe oublié ?
              </Link>
            )}

            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="mt-4 w-full text-center text-sm text-neutral-500"
            >
              {mode === "signin" ? "Pas encore de compte ? Inscris-toi" : "Déjà un compte ? Connecte-toi"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
