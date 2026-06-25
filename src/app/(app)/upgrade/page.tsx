"use client";

import { useState } from "react";

const PLANS = [
  { key: "pro_monthly", name: "Pro", price: "12$/mois", features: ["Agents illimités", "Push temps réel", "Sans watermark"] },
  { key: "pro_yearly", name: "Pro annuel", price: "99$/an", features: ["Tout Pro", "2 mois offerts"] },
  { key: "builder_monthly", name: "Builder", price: "49$/mois", features: ["Tout Pro", "API marketplace", "70% des revenus"] },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(null);
  }

  return (
    <div className="px-4 pt-8">
      <h1 className="mb-6 text-xl font-bold">Passer Pro</h1>
      <div className="space-y-3">
        {PLANS.map((p) => (
          <div key={p.key} className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span className="text-sm">{p.price}</span>
            </div>
            <ul className="mb-3 space-y-1 text-xs text-neutral-400">
              {p.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(p.key)}
              disabled={loading === p.key}
              className="w-full rounded-full bg-green-500 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {loading === p.key ? "Redirection..." : "Choisir"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
