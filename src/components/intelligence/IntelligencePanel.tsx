"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, ClipboardCheck, FileText, Flag } from "lucide-react";

import { PartialIntelligenceState } from "@/components/intelligence/PartialIntelligenceState";
import { IntelligenceReadinessBar } from "@/components/intelligence/IntelligenceReadinessBar";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import type { BriefingArtifactModel } from "@/models/intelligence/briefing";
import type { IntelligenceSnapshotModel, ProcessingState } from "@/models/intelligence/snapshot";
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
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Icon className="h-5 w-5 text-steel-300" />
        </div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const stateActions =
    snapshot.state === "failed"
      ? snapshot.reviewFlags.map((flag) => `${flag.label}: ${flag.detail}`)
      : snapshot.blockers.length > 0
        ? snapshot.blockers
        : snapshot.gaps;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }}
        >
          <PartialIntelligenceState
            actions={stateActions.length > 0 ? stateActions : ["No blockers are currently open."]}
            state={snapshot.state}
            summary={snapshot.intakeSummary}
          />
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <IntelligenceReadinessBar
            confidence={snapshot.confidenceScore}
            readiness={snapshot.readinessScore}
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="grid gap-4 xl:grid-cols-2"
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          transition={{ duration: 0.28 }}
        >
          <PanelCard icon={ClipboardCheck} title="Package Understanding">
            <div className="flex items-center gap-2">
              <Badge variant="steel">{snapshot.intakeStatusLabel}</Badge>
              {snapshot.intakeStats.map((stat) => (
                <Badge key={stat} variant="default">
                  {stat}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {snapshot.intakeSummary}
            </p>
          </PanelCard>

          <PanelCard icon={FileText} title="Briefing">
            <div className="flex items-center gap-2">
              <Badge variant={phase === "complete" ? "emerald" : "gold"}>
                {snapshot.briefingStatusLabel}
              </Badge>
              {briefing ? <Badge variant="default">{briefing.version}</Badge> : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {briefing?.summary ?? snapshot.briefingSummary}
            </p>
            <div className="mt-4 space-y-2">
              {(briefing?.keySignals ?? snapshot.briefingStrengths).map((signal) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-muted"
                >
                  {signal}
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard icon={CheckCheck} title="Workbook Follow-up">
            <div className="flex items-center gap-2">
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
              {workbookProfile ? <Badge variant="default">{workbookProfile.version}</Badge> : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {snapshot.workbookSummary}
            </p>
            <div className="mt-4 grid gap-2">
              {(workbookProfile?.missingSections ?? snapshot.gaps).map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard icon={Flag} title="Quality and Review Flags">
            <div className="flex items-center gap-2">
              <Badge variant={snapshot.state === "failed" ? "rose" : "gold"}>
                {snapshot.reviewFlags.length} flags
              </Badge>
              {workbookReview ? (
                <Badge variant="default">{workbookReview.readiness}% review readiness</Badge>
              ) : null}
            </div>
            <div className="mt-4 space-y-2">
              {snapshot.reviewFlags.length > 0 ? (
                snapshot.reviewFlags.map((flag) => (
                  <div
                    key={`${flag.label}-${flag.detail}`}
                    className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
                  >
                    <div className="text-sm font-medium text-foreground">{flag.label}</div>
                    <div className="mt-1 text-sm text-muted">{flag.detail}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  No blocking review flags. The intelligence package is ready for controlled progression.
                </div>
              )}
            </div>
          </PanelCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
