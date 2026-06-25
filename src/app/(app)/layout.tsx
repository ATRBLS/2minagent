import { BottomNav } from "@/components/shell/bottom-nav";
import { InstallFab } from "@/components/shell/install-fab";
import { ServiceWorkerRegister } from "@/components/shell/sw-register";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <ServiceWorkerRegister />
      <main className="flex-1 pb-24">{children}</main>
      <InstallFab />
      <BottomNav />
    </div>
  );
}
