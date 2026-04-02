"use client";

import { motion } from "framer-motion";
import {
  CheckCheck,
  ClipboardCheck,
  FileText,
  Flag,
  Sparkles,
} from "lucide-react";

import { PartialIntelligenceState } from "@/components/intelligence/PartialIntelligenceState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import type {
  IntelligenceResourceState,
  IntelligenceStaleNotice,
} from "@/hooks/use-rfq-intelligence";
import type { BriefingArtifactModel } from "@/models/intelligence/briefing";
import type { IntelligenceSnapshotModel } from "@/models/intelligence/snapshot";
import type {
  WorkbookProfileModel,
  WorkbookReviewModel,
} from "@/models/intelligence/workbook";
import { intelligenceAvailabilityMeta } from "@/utils/status";

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

function ListSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div>
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      {items.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {items.map((item) => (
            <div key={item} className="stat-cell text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}

function ResourceShell<T>({
  emptyTitle,
  emptyDescription,
  render,
  resource,
}: {
  emptyTitle: string;
  emptyDescription: string;
  render: (data: T) => React.ReactNode;
  resource: IntelligenceResourceState<T | null>;
}) {
  if (resource.loading) {
    return <SkeletonCard lines={5} />;
  }

  if (resource.error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-700 dark:text-rose-300">
        {resource.error}
      </div>
    );
  }

  if (!resource.data) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 dark:bg-white/[0.02]">
        <div className="text-sm font-medium text-foreground">{emptyTitle}</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return <>{render(resource.data)}</>;
}

function MetaRow({
  availability,
  updatedLabel,
  version,
}: {
  availability: keyof typeof intelligenceAvailabilityMeta;
  updatedLabel: string;
  version?: string;
}) {
  const meta = intelligenceAvailabilityMeta[availability];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={meta.tone}>{meta.label}</Badge>
      {version ? <Badge variant="default">{version}</Badge> : null}
      <span className="text-xs text-muted-foreground">Updated {updatedLabel}</span>
    </div>
  );
}

export function IntelligencePanel({
  briefing,
  snapshot,
  staleIntel,
  workbookProfile,
  workbookReview,
}: {
  briefing: IntelligenceResourceState<BriefingArtifactModel | null>;
  snapshot: IntelligenceResourceState<IntelligenceSnapshotModel | null>;
  staleIntel: IntelligenceStaleNotice | null;
  workbookProfile: IntelligenceResourceState<WorkbookProfileModel | null>;
  workbookReview: IntelligenceResourceState<WorkbookReviewModel | null>;
}) {
  const heroState =
    snapshot.data?.availability ??
    briefing.data?.availability ??
    workbookProfile.data?.availability ??
    workbookReview.data?.availability ??
    (snapshot.loading ||
    briefing.loading ||
    workbookProfile.loading ||
    workbookReview.loading
      ? "pending"
      : "not_available_yet");

  const heroSummary =
    snapshot.data?.summary ??
    briefing.data?.summary ??
    workbookProfile.data?.summary ??
    workbookReview.data?.summary ??
    "No intelligence artifacts are available yet for this RFQ.";

  const heroActions =
    snapshot.data?.reviewFlags.map((flag) => `${flag.label}: ${flag.detail}`) ??
    briefing.data?.openQuestions ??
    workbookReview.data?.findings.map((finding) => `${finding.title}: ${finding.detail}`) ??
    [];

  return (
    <div className="space-y-6">
      {staleIntel ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-700 dark:text-amber-300">
          <div className="font-medium text-foreground">Intelligence may be stale</div>
          <p className="mt-1.5 leading-relaxed">
            {staleIntel.message} Manager updated {staleIntel.managerUpdatedLabel}; latest intelligence update {staleIntel.intelligenceUpdatedLabel}.
          </p>
        </div>
      ) : null}

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel overflow-hidden p-6"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35 }}
      >
        <div className="section-kicker">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligence Status
        </div>
        <div className="mt-4">
          <PartialIntelligenceState
            actions={heroActions.slice(0, 4)}
            state={heroState}
            summary={heroSummary}
          />
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-2">
        <PanelCard icon={ClipboardCheck} title="Snapshot">
          <ResourceShell
            emptyDescription="The snapshot artifact is not available yet for this RFQ."
            emptyTitle="Snapshot unavailable"
            render={(data) => (
              <div className="space-y-4">
                <MetaRow
                  availability={data.availability}
                  updatedLabel={data.updatedLabel}
                  version={data.version}
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.summary}
                </p>
                <ListSection
                  emptyLabel="No snapshot review flags are currently recorded."
                  items={data.reviewFlags.map((flag) => `${flag.label}: ${flag.detail}`)}
                  title="Snapshot Flags"
                />
                <ListSection
                  emptyLabel="No recommended tabs are currently suggested."
                  items={data.recommendedTabs}
                  title="Recommended Tabs"
                />
                {data.availabilityMatrix.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Availability Matrix
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {data.availabilityMatrix.map((entry) => (
                        <div key={`${entry.label}-${entry.value}`} className="stat-cell">
                          <div className="text-sm font-medium text-foreground">
                            {entry.label}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {entry.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            resource={snapshot}
          />
        </PanelCard>

        <PanelCard icon={FileText} title="Briefing">
          <ResourceShell
            emptyDescription="The briefing artifact is not available yet for this RFQ."
            emptyTitle="Briefing unavailable"
            render={(data) => (
              <div className="space-y-4">
                <MetaRow
                  availability={data.availability}
                  updatedLabel={data.updatedLabel}
                  version={data.version}
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.summary}
                </p>
                <ListSection
                  emptyLabel="No known points have been extracted yet."
                  items={data.keySignals}
                  title="Known Points"
                />
                <ListSection
                  emptyLabel="No open questions are currently listed."
                  items={data.openQuestions}
                  title="Missing Info"
                />
                <ListSection
                  emptyLabel="No next actions were returned."
                  items={data.recommendedActions}
                  title="Next Actions"
                />
                {data.preliminary ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-sm text-amber-700 dark:text-amber-300">
                    This briefing is preliminary and should be treated as supportive guidance, not final intelligence.
                  </div>
                ) : null}
              </div>
            )}
            resource={briefing}
          />
        </PanelCard>

        <PanelCard icon={CheckCheck} title="Workbook Profile">
          <ResourceShell
            emptyDescription="The workbook profile is not available yet for this RFQ."
            emptyTitle="Workbook profile unavailable"
            render={(data) => (
              <div className="space-y-4">
                <MetaRow
                  availability={data.availability}
                  updatedLabel={data.updatedLabel}
                  version={data.version}
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.summary}
                </p>
                {data.sheetStats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.sheetStats.map((stat) => (
                      <Badge key={stat} variant="default">
                        {stat}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <ListSection
                  emptyLabel="No tracked sheets are listed."
                  items={data.trackedSheets}
                  title="Tracked Sheets"
                />
                <ListSection
                  emptyLabel="No missing sections are listed."
                  items={data.missingSections}
                  title="Missing Sections"
                />
                <ListSection
                  emptyLabel="No workbook notes are currently available."
                  items={data.notes}
                  title="Notes"
                />
              </div>
            )}
            resource={workbookProfile}
          />
        </PanelCard>

        <PanelCard icon={Flag} title="Workbook Review">
          <ResourceShell
            emptyDescription="The workbook review report is not available yet for this RFQ."
            emptyTitle="Workbook review unavailable"
            render={(data) => (
              <div className="space-y-4">
                <MetaRow
                  availability={data.availability}
                  updatedLabel={data.updatedLabel}
                  version={data.version}
                />
                <div className="flex flex-wrap gap-2">
                  {typeof data.activeFindingsCount === "number" ? (
                    <Badge variant="gold">{data.activeFindingsCount} active finding(s)</Badge>
                  ) : null}
                  {data.unavailableFamilies.map((family) => (
                    <Badge key={family} variant="pending">
                      {family.replaceAll("_", " ")}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.summary}
                </p>
                {data.findings.length > 0 ? (
                  <div className="space-y-2">
                    {data.findings.map((finding) => (
                      <div key={finding.id} className="stat-cell">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-foreground">
                            {finding.title}
                          </div>
                          <Badge
                            variant={
                              finding.severity === "high"
                                ? "rose"
                                : finding.severity === "medium"
                                  ? "gold"
                                  : "steel"
                            }
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                        <div className="mt-1.5 text-sm text-muted-foreground">
                          {finding.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                    No active workbook review findings are currently listed.
                  </div>
                )}
              </div>
            )}
            resource={workbookReview}
          />
        </PanelCard>
      </div>
    </div>
  );
}
