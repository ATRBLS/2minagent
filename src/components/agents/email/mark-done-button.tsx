"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkDoneButton({ emailId }: { emailId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/agents/email/emails/${emailId}/done`, { method: "POST" });
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading} className="mt-2 text-xs text-green-400 disabled:opacity-50">
      {loading ? "..." : "Marquer comme fait"}
    </button>
  );
}
