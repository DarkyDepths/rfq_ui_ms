"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart2, PieChart, Radar, Settings2 } from "lucide-react";

import { KPICard } from "@/components/common/KPICard";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPermissions } from "@/config/role-permissions";
import { useRole } from "@/context/role-context";
import { useOverviewData } from "@/hooks/use-overview-data";

/** Mock data for the BI charts */
const pipelineData = [
  { stage: "Intake & Parse", value: 100, amount: "SAR 142M", color: "bg-steel-500/20", fill: "bg-steel-500" },
  { stage: "Technical Auth.", value: 72, amount: "SAR 102M", color: "bg-sky-500/20", fill: "bg-sky-500" },
  { stage: "Commercial Rev.", value: 45, amount: "SAR 64M", color: "bg-indigo-500/20", fill: "bg-indigo-500" },
  { stage: "Final Board", value: 30, amount: "SAR 42M", color: "bg-violet-500/20", fill: "bg-violet-500" },
  { stage: "Award Expected", value: 14, amount: "SAR 19M", color: "bg-emerald-500/20", fill: "bg-emerald-500" },
];

const throughputData = [
  { month: "Jan", processed: 45, average: 50 },
  { month: "Feb", processed: 52, average: 55 },
  { month: "Mar", processed: 65, average: 40 },
  { month: "Apr", processed: 88, average: 30 },
  { month: "May", processed: 112, average: 25 },
  { month: "Jun", processed: 140, average: 20 },
];

export function DashboardScreen() {
  const { role } = useRole();
  const { loading, metrics, portfolio } = useOverviewData();
  const permissions = getPermissions(role);

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Page Header ─── */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl font-semibold text-foreground lg:text-4xl">
            {permissions.overviewTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {permissions.overviewSubtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg">
            <Settings2 className="h-4 w-4 mr-2" />
            Customize View
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* ─── Pipeline Velocity Chart (BI Element) ─── */}
          <div className="surface-panel p-6 h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="section-kicker">
                  <BarChart2 className="h-3.5 w-3.5" />
                  Financial Impact
                </div>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  Estimated Value Pipeline
                </h2>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end gap-3">
              {pipelineData.map((tier, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground">{tier.stage}</span>
                    <span className="text-muted-foreground">{tier.amount}</span>
                  </div>
                  <div className="h-4 w-full rounded-sm bg-muted/30 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tier.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className={`absolute inset-y-0 left-0 rounded-sm ${tier.fill}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Throughput Trend (BI Element) ─── */}
          <div className="surface-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="section-kicker">
                  <PieChart className="h-3.5 w-3.5" />
                  Velocity Curve
                </div>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  Volume vs Processing Time
                </h2>
              </div>
            </div>
            <div className="relative h-48 flex items-end justify-between gap-2 border-b border-border pb-2">
              {throughputData.map((point, i) => (
                <div key={i} className="relative flex flex-col items-center flex-1 gap-2 group">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-popover text-popover-foreground text-[0.65rem] px-2 py-1 rounded shadow border border-border z-10">
                    {point.processed} items @ {point.average} hrs
                  </div>
                  <div className="w-full relative flex justify-center items-end h-32">
                    {/* Volume Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${point.processed * 0.7}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="w-1/2 bg-steel-500/20 rounded-t-sm"
                    />
                    {/* Time Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${point.average}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                      className="w-1/2 bg-amber-500/80 rounded-t-sm"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{point.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-steel-500/40" /> Processed Volume
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500/80" /> Avg Turnover (Hrs)
              </div>
            </div>
          </div>
        </div>

        {/* ─── Intelligence Posture ─── */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="surface-panel p-6 h-full flex flex-col">
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

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {portfolio?.narrative ??
                    "System aggregates incoming data into a readiness index based on complete parsing layers."}
                </p>

                <div className="mt-6 flex pl-2 gap-4 flex-col">
                   <div className="relative">
                     <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                       <span>Clean Execution</span>
                       <span className="font-mono text-sm">{portfolio?.completeCount ?? 0} Pursuits</span>
                     </div>
                     <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[65%]" />
                     </div>
                   </div>

                   <div className="relative mt-2">
                     <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-1">
                       <span>Partial Signal</span>
                       <span className="font-mono text-sm">{portfolio?.partialCount ?? 0} Pursuits</span>
                     </div>
                     <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-gold-500 w-[24%]" />
                     </div>
                   </div>

                   <div className="relative mt-2">
                     <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                       <span>Failed Validation</span>
                       <span className="font-mono text-sm">{portfolio?.failedCount ?? 0} Pursuits</span>
                     </div>
                     <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-rose-500 w-[11%]" />
                     </div>
                   </div>
                </div>

                <div className="mt-auto pt-8 flex flex-col gap-3">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/rfqs/RFQ-2026-0142">
                      Inspect Strategic Model Drop
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  {role === "manager" && (
                     <Button asChild variant="secondary" className="w-full">
                       <Link href="/overview">Go to Operational Manager Queue</Link>
                     </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
