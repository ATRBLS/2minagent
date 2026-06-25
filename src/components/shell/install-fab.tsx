import Link from "next/link";
import { Plus } from "lucide-react";

export function InstallFab() {
  return (
    <Link
      href="/agents"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-green-500/30"
      aria-label="Installer un agent"
    >
      <Plus size={26} />
    </Link>
  );
}
