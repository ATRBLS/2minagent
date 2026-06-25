import Link from "next/link";

export default function EmailInstallPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 px-6 pt-10 text-white">
      <span className="mb-4 text-3xl">📧</span>
      <h1 className="mb-2 text-xl font-bold">Installer l'Agent Email</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Connecte ta boîte mail. L'agent commence à lire et classer tes
        emails immédiatement.
      </p>

      <div className="space-y-3">
        <Link
          href="/api/agents/email/oauth/google/start"
          className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black"
        >
          Connecter Gmail
        </Link>
        <Link
          href="/api/agents/email/oauth/microsoft/start"
          className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold ring-1 ring-neutral-800"
        >
          Connecter Outlook
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-neutral-600">
        Tes emails restent privés. L'IA les lit pour les classer, rien n'est
        partagé.
      </p>
    </div>
  );
}
