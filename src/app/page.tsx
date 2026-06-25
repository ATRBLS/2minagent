import Link from "next/link";

const AGENT_CARDS = [
  {
    emoji: "📧",
    name: "Agent Email",
    desc: "Lit tes emails, repère les urgences, te prévient au bon moment.",
  },
  {
    emoji: "📱",
    name: "Agent Social Media",
    desc: "Génère et planifie tes posts LinkedIn et Instagram automatiquement.",
  },
];

const SOON = [
  { emoji: "💰", name: "Finance" },
  { emoji: "🛠️", name: "DevOps" },
  { emoji: "✨", name: "Lifestyle" },
];

const PLANS = [
  { name: "Free", price: "0$", features: ["1 agent installé", "7 jours d'historique", "Briefing quotidien"] },
  { name: "Pro", price: "12$/mois", features: ["Agents illimités", "Historique complet", "Push en temps réel", "Sans watermark"], highlight: true },
  { name: "Builder", price: "49$/mois", features: ["Tout Pro inclus", "API marketplace", "70% des revenus agents"] },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-950 text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">2minAgent</span>
        <Link href="/login" className="text-sm text-neutral-400">
          Se connecter
        </Link>
      </header>

      <section className="px-6 pt-10 pb-14 text-center">
        <h1 className="mx-auto max-w-md text-3xl font-bold leading-tight">
          Tes agents travaillent. Toi tu vis.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-neutral-400">
          2minAgent connecte tes outils et fait le travail à ta place — en
          pilote automatique.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-black"
        >
          Essayer gratuitement — 2 minutes pour démarrer
        </Link>
      </section>

      <section className="space-y-3 px-6 pb-10">
        {AGENT_CARDS.map((a) => (
          <div key={a.name} className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-2xl">{a.emoji}</span>
              <h3 className="font-semibold">{a.name}</h3>
            </div>
            <p className="text-sm text-neutral-400">{a.desc}</p>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          {SOON.map((a) => (
            <div
              key={a.name}
              className="flex-1 rounded-2xl bg-neutral-900/50 p-3 text-center ring-1 ring-neutral-800"
            >
              <span className="text-xl">{a.emoji}</span>
              <p className="mt-1 text-xs text-neutral-500">{a.name}</p>
              <p className="text-[10px] text-neutral-600">Bientôt</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16">
        <h2 className="mb-4 text-center text-xl font-bold">Tarifs simples</h2>
        <div className="space-y-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-4 ring-1 ${
                p.highlight ? "bg-green-500/10 ring-green-500" : "bg-neutral-900 ring-neutral-800"
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="text-sm">{p.price}</span>
              </div>
              <ul className="space-y-1 text-xs text-neutral-400">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-neutral-600">
        © 2026 2minAgent
      </footer>
    </div>
  );
}
