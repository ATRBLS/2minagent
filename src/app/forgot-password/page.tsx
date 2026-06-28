"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Mot de passe oublié</h1>

        {sent ? (
          <div className="rounded-xl bg-surface p-4 text-sm">
            ✉️ Si un compte existe pour <strong>{email}</strong>, un lien de
            réinitialisation vient d'être envoyé. Vérifie ta boîte mail.
          </div>
        ) : (
          <>
            <p className="mb-8 text-muted-foreground">
              Entre ton email, on t'envoie un lien pour choisir un nouveau mot
              de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </form>
          </>
        )}

        <Link href="/login" className="mt-4 block text-center text-sm text-muted-foreground">
          ← Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
