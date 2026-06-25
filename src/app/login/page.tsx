"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">2minAgent</h1>
        <p className="mb-8 text-neutral-400">
          Connecte-toi avec ton email, sans mot de passe.
        </p>

        {sent ? (
          <div className="rounded-xl bg-neutral-900 p-4 text-sm">
            ✉️ Lien envoyé à <strong>{email}</strong>. Ouvre ta boîte mail pour
            te connecter.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm outline-none ring-1 ring-neutral-800 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Recevoir le lien magique"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
