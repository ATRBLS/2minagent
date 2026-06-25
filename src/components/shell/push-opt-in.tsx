"use client";

import { useState } from "react";
import { subscribeToPush } from "@/lib/push/client";

export function PushOptIn({ enabled }: { enabled: boolean }) {
  const [active, setActive] = useState(enabled);
  const [loading, setLoading] = useState(false);

  async function handleEnable() {
    setLoading(true);
    const ok = await subscribeToPush();
    setLoading(false);
    setActive(ok);
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <p className="mb-1 text-sm font-medium">Notifications push</p>
      <p className="mb-3 text-xs text-neutral-500">
        Reçois une alerte dès qu'une action est requise.
      </p>
      {active ? (
        <span className="inline-flex items-center gap-1 text-xs text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-400" /> Activées
        </span>
      ) : (
        <button
          onClick={handleEnable}
          disabled={loading}
          className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Activation..." : "Activer les notifications"}
        </button>
      )}
    </div>
  );
}
