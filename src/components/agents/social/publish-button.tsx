"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PublishButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/agents/social/posts/${postId}/publish`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-black disabled:opacity-50"
    >
      {loading ? "..." : "Publier"}
    </button>
  );
}
