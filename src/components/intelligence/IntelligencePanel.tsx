"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, ClipboardCheck, FileText, Flag } from "lucide-react";

import { CircularGauge } from "@/components/common/CircularGauge";
import { PartialIntelligenceState } from "@/components/intelligence/PartialIntelligenceState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import type { BriefingArtifactModel } from "@/models/intelligence/briefing";
import type {
  IntelligenceSnapshotModel,
  ProcessingState,
} from "@/models/intelligence/snapshot";
import type {
  WorkbookProfileModel,
  WorkbookReviewModel,
} from "@/models/intelligence/workbook";

function PanelCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 dark:bg-white/[0.03]">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function IntelligencePanel({
  snapshot,
  briefing,
  workbookProfile,
  workbookReview,
  phase,
}: {
  snapshot: IntelligenceSnapshotModel | null;
  briefing: BriefingArtifactModel | null;
  workbookProfile: WorkbookProfileModel | null;
  workbookReview: WorkbookReviewModel | null;
  phase: "loading" | ProcessingState;
}) {
  if (phase === "loading" || !snapshot) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const stateActions =
    snapshot.state === "failed"
      ? snapshot.reviewFlags.map((f) => `${f.label}: ${f.detail}`)
      : snapshot.blockers.length > 0
        ? snapshot.blockers
        : snapshot.gaps;

  return (
    <div className="space-y-6">
      {/* ─── Intelligence State Hero ─── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center gap-6 p-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Gauges */}
          <div className="flex shrink-0 gap-6">
            <CircularGauge
              label="Readiness"
              size={110}
              value={snapshot.readinessScore}
            />
            <CircularGauge
              color="hsl(213, 60%, 52%)"
              label="Confidence"
              size={110}
              value={snapshot.confidenceScore}
            />
          </div>

          {/* State summary */}
          <div className="min-w-0 flex-1">
            <PartialIntelligenceState
              actions={
                stateActions.length > 0
                  ? stateActions
                  : ["No blockers are currently open."]
              }
              state={snapshot.state}
              summary={snapshot.intakeSummary}
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Intelligence Panel Grid ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 xl:grid-cols-2"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.25 }}
        >
          {/* Package Understanding */}
          <PanelCard icon={ClipboardCheck} title="Package Understanding">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="steel">{snapshot.intakeStatusLabel}</Badge>
              {snapshot.intakeStats.map((stat) => (
                <Badge key={stat} variant="default">
                  {stat}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {snapshot.intakeSummary}
            </p>
          </PanelCard>

          {/* Briefing */}
          <PanelCard icon={FileText} title="Briefing">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={phase === "complete" ? "emerald" : "gold"}>
                {snapshot.briefingStatusLabel}
              </Badge>
              {briefing ? (
                <Badge variant="default">{briefing.version}</Badge>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {briefing?.summary ?? snapshot.briefingSummary}
            </p>
            <div className="mt-3 space-y-1.5">
              {(briefing?.keySignals ?? snapshot.briefingStrengths)
                .slice(0, 3)
                .map((signal) => (
                  <div
                    key={signal}
                    className="stat-cell text-sm text-muted-foreground"
                  >
                    {signal}
                  </div>
                ))}
            </div>
          </PanelCard>

          {/* Workbook Follow-up */}
          <PanelCard icon={CheckCheck} title="Workbook Follow-up">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  workbookProfile?.status === "complete"
                    ? "emerald"
                    : workbookProfile?.status === "failed"
                      ? "rose"
                      : workbookProfile?.status === "not_uploaded"
                        ? "pending"
                        : "gold"
                }
              >
                {snapshot.workbookStatusLabel}
              </Badge>
              {workbookProfile ? (
                <Badge variant="default">{workbookProfile.version}</Badge>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {snapshot.workbookSummary}
            </p>
            <div className="mt-3 space-y-1.5">
              {(workbookProfile?.missingSections ?? snapshot.gaps)
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item}
                    className="stat-cell text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
            </div>
          </PanelCard>

          {/* Quality and Review Flags */}
          <PanelCard icon={Flag} title="Quality & Review Flags">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={snapshot.state === "failed" ? "rose" : "gold"}>
                {snapshot.reviewFlags.length} flags
              </Badge>
              {workbookReview ? (
                <Badge variant="default">
                  {workbookReview.readiness}% review
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 space-y-1.5">
              {snapshot.reviewFlags.length > 0 ? (
                snapshot.reviewFlags.map((flag) => (
                  <div
                    key={`${flag.label}-${flag.detail}`}
                    className="stat-cell"
                  >
                    <div className="text-sm font-medium text-foreground">
                      {flag.label}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {flag.detail}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  No blocking review flags. Intelligence package ready for
                  progression.
                </div>
              )}
            </div>
          </PanelCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
