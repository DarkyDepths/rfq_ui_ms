"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardCheck,
  Layers3,
  Radar,
  Sparkles,
} from "lucide-react";

import { ArtifactCard } from "@/components/artifacts/ArtifactCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { UploadZone } from "@/components/common/UploadZone";
import { IntelligencePanel } from "@/components/intelligence/IntelligencePanel";
import { RFQStageTimeline } from "@/components/rfq/RFQStageTimeline";
import { RFQStatusChip } from "@/components/rfq/RFQStatusChip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requestArtifactReprocess } from "@/connectors/intelligence/artifacts";
import { getPermissions } from "@/config/role-permissions";
import { useRole } from "@/context/role-context";
import { useRfqDetail } from "@/hooks/use-rfq-detail";
import type { ArtifactKind } from "@/models/intelligence/artifacts";

type DetailTab = "operational" | "intelligence" | "artifacts";

const tabConfig: Array<{
  value: DetailTab;
  label: string;
  icon: typeof Radar;
}> = [
  { value: "operational", label: "Operational", icon: ClipboardCheck },
  { value: "intelligence", label: "Intelligence", icon: Sparkles },
  { value: "artifacts", label: "Artifacts", icon: Layers3 },
];

export function RFQDetailScreen({ rfqId }: { rfqId: string }) {
  const { role } = useRole();
  const permissions = getPermissions(role);
  const {
    artifacts,
    artifactsLoading,
    briefing,
    phase,
    rfq,
    shellLoading,
    snapshot,
    workbookProfile,
    workbookReview,
  } = useRfqDetail(rfqId);
  const [activeTab, setActiveTab] = useState<DetailTab>("operational");
  const [reprocessMessage, setReprocessMessage] = useState("");

  const handleReprocess = async (kind: ArtifactKind) => {
    if (!permissions.canReprocessArtifacts) return;
    const response = await requestArtifactReprocess(rfqId, kind);
    setReprocessMessage(response.message);
  };

  if (shellLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-[200px]" lines={6} />
        <div className="grid gap-5 xl:grid-cols-3">
          <SkeletonCard className="h-[280px]" lines={6} />
          <SkeletonCard className="h-[280px]" lines={6} />
          <SkeletonCard className="h-[280px]" lines={6} />
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <EmptyState
        description="The requested RFQ was not found."
        title="RFQ not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Compact Detail Header ─── */}
      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="section-kicker">{rfq.id}</div>
            <h1 className="mt-3 text-display text-2xl font-semibold text-foreground lg:text-3xl">
              {rfq.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {rfq.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RFQStatusChip status={rfq.status} />
            <Badge variant="steel">{rfq.workflowName}</Badge>
            <Badge
              variant={
                rfq.intelligenceState === "complete"
                  ? "emerald"
                  : rfq.intelligenceState === "failed"
                    ? "rose"
                    : rfq.intelligenceState === "partial"
                      ? "gold"
                      : "pending"
              }
            >
              Intel: {rfq.intelligenceState}
            </Badge>
          </div>
        </div>

        {/* Quick Facts Strip */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client</div>
            <div className="mt-1 font-medium text-foreground">{rfq.client}</div>
          </div>
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Owner</div>
            <div className="mt-1 font-medium text-foreground">{rfq.owner}</div>
          </div>
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Due Date</div>
            <div className="mt-1 font-mono font-medium text-foreground">{rfq.dueLabel}</div>
          </div>
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Est. Submission</div>
            <div className="mt-1 font-mono font-medium text-foreground">{rfq.estimatedSubmissionLabel}</div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 dark:bg-white/[0.02]">
          <div className="mb-2 flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span>{rfq.stageLabel}</span>
            <span className="font-mono">{rfq.stageProgress}%</span>
          </div>
          <RFQStageTimeline stages={rfq.stageHistory} />
        </div>
      </section>

      {/* ─── Tab Navigation ─── */}
      <div className="flex gap-1.5 rounded-xl border border-border bg-muted/40 p-1 dark:bg-white/[0.02]">
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {isActive ? (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-card shadow-sm dark:bg-white/[0.06]"
                  layoutId="detail-tab-pill"
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                />
              ) : null}
              <div className="relative flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Operational Tab */}
          {activeTab === "operational" ? (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                {/* Operational Posture */}
                <div className="surface-panel p-5">
                  <div className="section-kicker">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Operational Posture
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="stat-cell">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Procurement Lead
                      </div>
                      <div className="mt-1 font-medium text-foreground">
                        {rfq.procurementLead}
                      </div>
                    </div>
                    <div className="stat-cell">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Next Action
                      </div>
                      <div className="mt-1 font-medium text-foreground">
                        {rfq.nextAction}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage Notes */}
                <div className="surface-panel p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Stage Notes
                  </h3>
                  <div className="mt-3 space-y-2">
                    {rfq.stageNotes.map((note) => (
                      <div key={note.id} className="stat-cell">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {note.author}
                          </span>
                          <Badge
                            variant={
                              note.tone === "success"
                                ? "emerald"
                                : note.tone === "warning"
                                  ? "gold"
                                  : "steel"
                            }
                          >
                            {note.createdLabel}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Files */}
                <div className="surface-panel p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Recent Files
                  </h3>
                  <div className="mt-3 space-y-2">
                    {rfq.recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="stat-cell flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {file.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.type} · {file.uploadedLabel}
                          </div>
                        </div>
                        <Badge
                          variant={
                            file.status === "processed"
                              ? "emerald"
                              : file.status === "rejected"
                                ? "rose"
                                : "steel"
                          }
                        >
                          {file.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Upload Zones */}
                {rfq.uploads.map((upload) => (
                  <UploadZone
                    key={upload.kind}
                    description={upload.description}
                    fileName={upload.fileName}
                    initialStatus={upload.status}
                    title={upload.title}
                    uploadedLabel={upload.uploadedLabel}
                  />
                ))}

                {/* Subtasks */}
                <div className="surface-panel p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Subtasks
                  </h3>
                  <div className="mt-3 space-y-2">
                    {rfq.subtasks.map((task) => (
                      <div key={task.id} className="stat-cell">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {task.label}
                          </span>
                          <Badge
                            variant={
                              task.state === "done"
                                ? "emerald"
                                : task.state === "in_progress"
                                  ? "steel"
                                  : "pending"
                            }
                          >
                            {task.state.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {task.owner} · due {task.dueLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role controls */}
                <div className="surface-panel p-5">
                  <Badge variant={role === "manager" ? "steel" : "gold"}>
                    {role === "manager" ? "Manager Controls" : "Worker Focus"}
                  </Badge>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {role === "manager"
                      ? "Managers can approve lifecycle transitions, refresh artifacts, and coordinate stage notes through the manager microservice."
                      : "Workers see operational next actions and upload targets. Control-plane actions remain manager-owned."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Intelligence Tab — PREMIUM CENTERPIECE */}
          {activeTab === "intelligence" ? (
            <div className="space-y-6">
              <IntelligencePanel
                briefing={briefing}
                phase={phase}
                snapshot={snapshot}
                workbookProfile={workbookProfile}
                workbookReview={workbookReview}
              />

              {/* Briefing Recommendation + Workbook Posture */}
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="surface-panel p-6">
                  <div className="section-kicker">
                    <Sparkles className="h-3.5 w-3.5" />
                    Briefing Recommendation
                  </div>
                  <div className="mt-4 text-base font-semibold text-foreground">
                    {briefing?.recommendation ??
                      "Recommendation forming as intelligence matures."}
                  </div>
                  <div className="mt-4 space-y-2">
                    {(briefing?.openQuestions ?? snapshot?.blockers ?? []).map(
                      (item) => (
                        <div key={item} className="stat-cell text-sm text-muted-foreground">
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="surface-panel p-6">
                  <div className="section-kicker">Workbook Posture</div>
                  <div className="mt-4 text-base font-semibold text-foreground">
                    {workbookReview
                      ? `${workbookReview.readiness}% review readiness`
                      : "Workbook review loading"}
                  </div>
                  <div className="mt-4 space-y-2">
                    {(workbookReview?.flags ?? []).length > 0 ? (
                      workbookReview?.flags.map((flag) => (
                        <div
                          key={`${flag.label}-${flag.detail}`}
                          className="stat-cell"
                        >
                          <div className="text-sm font-medium text-foreground">
                            {flag.label}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {flag.detail}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        No workbook review blockers are currently open.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Artifacts Tab */}
          {activeTab === "artifacts" ? (
            <div className="space-y-5">
              {reprocessMessage ? (
                <div className="rounded-xl border border-primary/20 bg-primary/8 p-4 text-sm text-primary">
                  {reprocessMessage}
                </div>
              ) : null}

              {artifactsLoading ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  <SkeletonCard className="h-[240px]" lines={5} />
                  <SkeletonCard className="h-[240px]" lines={5} />
                  <SkeletonCard className="h-[240px]" lines={5} />
                  <SkeletonCard className="h-[240px]" lines={5} />
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-2">
                  {artifacts.map((artifact) => (
                    <ArtifactCard
                      key={artifact.id}
                      allowReprocess={permissions.canReprocessArtifacts}
                      artifact={artifact}
                      onReprocess={handleReprocess}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
