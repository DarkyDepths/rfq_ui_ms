"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PlusSquare, Radar } from "lucide-react";

import { KPICard } from "@/components/common/KPICard";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { RFQCard } from "@/components/rfq/RFQCard";
import { RFQTable } from "@/components/rfq/RFQTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPermissions } from "@/config/role-permissions";
import { useRole } from "@/context/role-context";
import { useOverviewData } from "@/hooks/use-overview-data";

export function RFQOverviewScreen() {
  const { role } = useRole();
  const { loading, metrics, portfolio, rfqs } = useOverviewData();
  const permissions = getPermissions(role);

  const displayRfqs = permissions.canViewAllRfqs ? rfqs : rfqs.slice(0, 3);
  const featuredCards = displayRfqs.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* ─── Page Header ─── */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl font-semibold text-foreground lg:text-4xl">
            {permissions.overviewTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {permissions.overviewSubtitle}
          </p>
        </div>
        <div className="flex gap-2">
          {permissions.primaryCta ? (
            <Button asChild size="lg" variant="default">
              <Link href={permissions.primaryCta.href}>
                <PlusSquare className="h-4 w-4" />
                {permissions.primaryCta.label}
              </Link>
            </Button>
          ) : null}
          <Button asChild size="lg" variant="secondary">
            <Link href="/rfqs/RFQ-2026-0142">
              <Radar className="h-4 w-4" />
              Featured RFQ
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── KPI Strip ─── */}
      <section>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`kpi-sk-${i}`} className="h-[160px]" lines={4} />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => (
              <KPICard key={metric.id} index={index} metric={metric} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Two-Column: RFQ Cards + Intelligence Posture ─── */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Active RFQs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {permissions.canViewAllRfqs ? "Active RFQs" : "Assigned RFQs"}
            </h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/rfqs">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard className="h-[220px]" lines={5} />
              <SkeletonCard className="h-[220px]" lines={5} />
            </div>
          ) : (
            <div className="space-y-4">
              {featuredCards.map((rfq, index) => (
                <RFQCard key={rfq.id} index={index} rfq={rfq} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Intelligence Posture */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            {permissions.canViewPortfolio ? (
              <div className="surface-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="section-kicker">
                      <Radar className="h-3.5 w-3.5" />
                      Intelligence Posture
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-foreground">
                      Portfolio Readiness
                    </h2>
                  </div>
                  {portfolio ? (
                    <Badge variant="steel">{portfolio.readinessAverage}% avg</Badge>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {portfolio?.narrative ??
                    "Intelligence portfolio summary loading..."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                      Complete
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
                      {portfolio?.completeCount ?? "—"}
                    </div>
                  </div>
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-gold-300">
                      Partial
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
                      {portfolio?.partialCount ?? "—"}
                    </div>
                  </div>
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
                      Failed
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
                      {portfolio?.failedCount ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Button asChild variant="secondary">
                    <Link href="/rfqs/RFQ-2026-0142">
                      Open featured intelligence demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Worker view: action-focused card */
              <div className="surface-panel p-6">
                <div className="section-kicker">Next Actions</div>
                <h2 className="mt-3 text-lg font-semibold text-foreground">
                  Pending work items
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Focus on uploads and workbook follow-up for your assigned RFQs.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="stat-cell">
                    <div className="text-sm font-medium text-foreground">
                      Upload missing workbook for RFQ-2026-0138
                    </div>
                  </div>
                  <div className="stat-cell">
                    <div className="text-sm font-medium text-foreground">
                      Review parsed package for RFQ-2026-0142
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Role info card */}
            <div className="surface-panel p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Badge variant={role === "manager" ? "steel" : "gold"}>
                  {role === "manager" ? "Manager View" : "Worker View"}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {role === "manager"
                  ? "You see the full portfolio, intelligence posture, and can create or advance RFQs."
                  : "You see assigned RFQs with pending actions. Portfolio controls are manager-owned."}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ─── Full-Width Table ─── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {permissions.canViewAllRfqs ? "All RFQs" : "Assigned Queue"}
          </h2>
        </div>
        {loading ? (
          <SkeletonCard className="h-[300px]" lines={7} />
        ) : (
          <RFQTable items={displayRfqs} />
        )}
      </section>
    </div>
  );
}
