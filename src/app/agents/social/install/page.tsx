"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INDUSTRIES = ["Conseil", "Tech / SaaS", "Immobilier", "Santé", "Finance", "Coaching", "Autre"];
const GOALS = [
  { value: "visibility", label: "Visibilité" },
  { value: "leads", label: "Leads" },
  { value: "personal_brand", label: "Marque personnelle" },
];

export default function SocialInstallPage() {
  const router = useRouter();
  const [step, setStep] = useState<"connect" | "questions" | "done">("connect");
  const [industry, setIndustry] = useState("");
  const [topicsInput, setTopicsInput] = useState("");
  const [goal, setGoal] = useState("visibility");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const topics = topicsInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3);
    await fetch("/api/agents/social/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry, topics, goal }),
    });
    setLoading(false);
    setStep("done");
    setTimeout(() => router.push("/home"), 1200);
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 px-6 pt-10 text-white">
      <span className="mb-4 text-3xl">📱</span>
      <h1 className="mb-2 text-xl font-bold">Installer l'Agent Social Media</h1>

      {step === "connect" && (
        <>
          <p className="mb-8 text-sm text-neutral-400">
            Connecte au moins un réseau pour démarrer.
          </p>
          <div className="space-y-3">
            <Link
              href="/api/agents/social/oauth/linkedin/start"
              className="flex items-center justify-center rounded-xl bg-[#0a66c2] py-3 text-sm font-semibold"
            >
              Connecter LinkedIn
            </Link>
            <Link
              href="/api/agents/social/oauth/instagram/start"
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 py-3 text-sm font-semibold"
            >
              Connecter Instagram
            </Link>
            <button onClick={() => setStep("questions")} className="w-full py-3 text-xs text-neutral-500">
              J'ai déjà connecté un compte →
            </button>
          </div>
        </>
      )}

      {step === "questions" && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Ton secteur ?</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm ring-1 ring-neutral-800"
            >
              <option value="">Choisir...</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Tes 3 sujets max (séparés par virgule)</label>
            <input
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="ex: leadership, productivité, IA"
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm ring-1 ring-neutral-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Ton objectif ?</label>
            <div className="flex gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs ${
                    goal === g.value ? "bg-green-500 text-black" : "bg-neutral-900 ring-1 ring-neutral-800"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !industry}
            className="w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Génération du premier post..." : "Terminer"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-xl bg-neutral-900 p-6 text-center text-sm">
          ✅ Ton premier post est prêt. Direction le dashboard...
        </div>
      )}
    </div>
  );
}
