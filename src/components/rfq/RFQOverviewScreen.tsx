"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Layers3, Radar, ShieldCheck } from "lucide-react";

import { KPICard } from "@/components/common/KPICard";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { PlatformWordmark } from "@/components/branding/PlatformWordmark";
import { RFQCard } from "@/components/rfq/RFQCard";
import { RFQTable } from "@/components/rfq/RFQTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/role-context";
import { useOverviewData } from "@/hooks/use-overview-data";

export function RFQOverviewScreen() {
  const { role } = useRole();
  const { loading, metrics, portfolio, rfqs } = useOverviewData();

  const featured = rfqs[0];
  const secondary = rfqs.slice(1, 3);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel p-6 lg:p-8">
          <PlatformWordmark />
          <h1 className="mt-6 max-w-3xl text-display text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
            Operate RFQ lifecycle execution and intelligence artifacts from one industrial command surface.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Manager-owned operational state and intelligence-owned analytical artifacts stay visible together, without collapsing platform responsibility into the UI.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="default">
              <Link href={role === "manager" ? "/rfqs/new" : "/rfqs/RFQ-2026-0142"}>
                {role === "manager" ? "Create RFQ Draft" : "Open Execution RFQ"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/rfqs">
                RFQ Queue
                <Layers3 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            animate={{ opacity: 1, y: 0 }}
            className="surface-panel p-6"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.24 }}
          >
            <div className="section-kicker">
              <ShieldCheck className="h-3.5 w-3.5" />
              {role === "manager" ? "Manager View" : "Worker View"}
            </div>
            <h2 className="mt-5 text-display text-2xl font-semibold text-foreground">
              {role === "manager"
                ? "Portfolio decisions stay close to the signal."
                : "Execution actions stay close to the RFQ."}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {role === "manager"
                ? "You can stage new RFQs, review readiness, and trigger artifact refreshes from the platform shell."
                : "You can focus on uploads, workbook follow-up, and the next operational action without seeing the entire portfolio control surface."}
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">
                  Immediate focus
                </div>
                <div className="mt-2 text-lg font-semibold text-foreground">
                  {role === "manager"
                    ? "Prioritize RFQ-2026-0142 for committee review."
                    : "Upload the missing workbook for RFQ-2026-0138."}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">
                  Portfolio signal
                </div>
                <div className="mt-2 text-lg font-semibold text-foreground">
                  {portfolio
                    ? `${portfolio.completeCount} complete • ${portfolio.partialCount} partial • ${portfolio.failedCount} failed`
                    : "Signal board initializing"}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`metric-skeleton-${index}`} className="h-[176px]" lines={4} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <KPICard key={metric.id} index={index} metric={metric} />
          ))}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {loading ? (
            <>
              <SkeletonCard className="h-[320px]" lines={6} />
              <div className="grid gap-4 lg:grid-cols-2">
                <SkeletonCard className="h-[280px]" lines={5} />
                <SkeletonCard className="h-[280px]" lines={5} />
              </div>
            </>
          ) : (
            <>
              {featured ? <RFQCard rfq={featured} /> : null}
              <div className="grid gap-4 lg:grid-cols-2">
                {secondary.map((rfq, index) => (
                  <RFQCard key={rfq.id} index={index + 1} rfq={rfq} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="section-kicker">
                <Radar className="h-3.5 w-3.5" />
                Intelligence posture
              </div>
              <h2 className="mt-4 text-display text-2xl font-semibold text-foreground">
                Portfolio readiness board
              </h2>
            </div>
            {portfolio ? <Badge variant="steel">{portfolio.readinessAverage}% avg</Badge> : null}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {portfolio?.narrative ??
              "Manager and intelligence portfolio summary is loading."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                Complete
              </div>
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {portfolio?.completeCount ?? "--"}
              </div>
            </div>
            <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-gold-300">
                Partial
              </div>
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {portfolio?.partialCount ?? "--"}
              </div>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-rose-300">
                Failed
              </div>
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {portfolio?.failedCount ?? "--"}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">
              Most impressive demo path
            </div>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              RFQ-2026-0142 — complete operational and intelligence alignment
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Open the detail route to show package understanding, briefing, workbook profile, workbook review, and artifacts transitioning into the complete state.
            </p>
            <Button asChild className="mt-5" variant="outline">
              <Link href="/rfqs/RFQ-2026-0142">
                Open featured intelligence demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <SkeletonCard className="h-[320px]" lines={7} />
      ) : (
        <RFQTable items={rfqs} />
      )}
    </div>
  );
}
