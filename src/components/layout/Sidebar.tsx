"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Files,
  FolderKanban,
  LayoutDashboard,
  PlusSquare,
  Radar,
} from "lucide-react";

import { PlatformWordmark } from "@/components/branding/PlatformWordmark";
import { GHILogo } from "@/components/branding/GHILogo";
import { Badge } from "@/components/ui/badge";
import { primaryNavigation, type NavigationIcon } from "@/config/navigation";
import { useAppShell } from "@/context/app-shell-context";
import { useRole } from "@/context/role-context";
import { cn } from "@/lib/utils";

const iconMap: Record<NavigationIcon, typeof LayoutDashboard> = {
  "layout-dashboard": LayoutDashboard,
  files: Files,
  "plus-square": PlusSquare,
  radar: Radar,
  "folder-kanban": FolderKanban,
};

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const { sidebarCollapsed } = useAppShell();

  const navItems = primaryNavigation.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  return (
    <aside
      className={cn(
        "border-b border-white/8 bg-[#0E1217]/90 backdrop-blur-xl lg:min-h-screen lg:border-b-0 lg:border-r",
        sidebarCollapsed ? "lg:w-24" : "lg:w-80",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 lg:flex-col lg:items-stretch lg:px-5 lg:pt-5">
        <GHILogo compact={sidebarCollapsed} />
        <div className="hidden lg:block">
          {!sidebarCollapsed ? <PlatformWordmark /> : null}
        </div>
      </div>

      <nav className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-5">
        {navItems.map((item) => {
          const isActive =
            item.match === "exact"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.href}
              className={cn(
                "group relative flex min-w-[220px] items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 lg:min-w-0",
                isActive
                  ? "border-steel-500/35 bg-steel-500/14 text-white shadow-steel"
                  : "border-white/6 bg-white/[0.02] text-muted hover:border-white/12 hover:bg-white/[0.04] hover:text-foreground",
              )}
              href={item.href}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border",
                  isActive
                    ? "border-steel-400/25 bg-steel-500/16 text-steel-200"
                    : "border-white/8 bg-white/[0.04]",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.title}</span>
                    {item.highlight ? <Badge variant="gold">Demo</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {!sidebarCollapsed ? (
        <div className="hidden px-5 pb-5 pt-2 lg:block">
          <div className="rounded-2xl border border-gold-500/18 bg-gold-500/8 p-4">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold-300">
              Defense-ready shell
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Operational data is modeled as manager-owned. Analytical artifacts are modeled as intelligence-owned.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
