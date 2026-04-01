import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 grid-underlay opacity-40" />
        <div className="pointer-events-none absolute inset-0 noise-underlay opacity-90" />
        <TopBar />
        <main className="relative flex-1 px-4 pb-10 pt-4 lg:px-8 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
