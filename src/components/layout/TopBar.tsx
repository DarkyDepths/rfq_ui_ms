"use client";

import Link from "next/link";
import { PanelLeft, Radar, ShieldCheck } from "lucide-react";

import { BreadcrumbTrail } from "@/components/navigation/BreadcrumbTrail";
import { RoleSwitcher } from "@/components/navigation/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { useAppShell } from "@/context/app-shell-context";
import { useRole } from "@/context/role-context";

export function TopBar() {
  const { toggleSidebar } = useAppShell();
  const { role } = useRole();

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-background/70 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              className="hidden lg:inline-flex"
              onClick={toggleSidebar}
              size="icon"
              variant="secondary"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="demo-banner">
                <ShieldCheck className="h-3.5 w-3.5" />
                {appConfig.demoBanner}
              </div>
              <p className="mt-2 text-sm text-muted">{appConfig.platformLine}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RoleSwitcher />
            <Button asChild size="sm" variant={role === "manager" ? "outline" : "secondary"}>
              <Link href="/rfqs/RFQ-2026-0142">
                <Radar className="h-4 w-4" />
                Open Featured RFQ
              </Link>
            </Button>
          </div>
        </div>

        <BreadcrumbTrail />
      </div>
    </header>
  );
}
