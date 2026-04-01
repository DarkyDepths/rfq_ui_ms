"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  Layers3,
  ShieldAlert,
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
import { useRole } from "@/context/role-context";
import { useRfqDetail } from "@/hooks/use-rfq-detail";
import type { ArtifactKind } from "@/models/intelligence/artifacts";

type DetailTab = "operational" | "intelligence" | "artifacts";

const tabs: Array<{
  value: DetailTab;
  label: string;
}> = [
  { value: "operational", label: "Operational" },
  { value: "intelligence", label: "Intelligence" },
  { value: "artifacts", label: "Artifacts" },
];

export function RFQDetailScreen({ rfqId }: { rfqId: string }) {
  const { role } = useRole();
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
    if (role !== "manager") {
      return;
    }

    const response = await requestArtifactReprocess(rfqId, kind);
    setReprocessMessage(response.message);
  };

  if (shellLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-[260px]" lines={7} />
        <div className="grid gap-4 xl:grid-cols-3">
          <SkeletonCard className="h-[320px]" lines={7} />
          <SkeletonCard className="h-[320px]" lines={7} />
          <SkeletonCard className="h-[320px]" lines={7} />
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <EmptyState
        description="The requested RFQ was not found in the demo connector layer."
        title="RFQ detail unavailable"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <div className="section-kicker">{rfq.id}</div>
            <h1 className="mt-5 text-display text-4xl font-semibold text-foreground">
              {rfq.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
              {rfq.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RFQStatusChip status={rfq.status} />
            <Badge variant="default">{rfq.workflowName}</Badge>
            <Badge variant="steel">{rfq.intelligenceState}</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Client</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{rfq.client}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Owner</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{rfq.owner}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Due Date</div>
            <div className="mt-2 text-lg font-semibold text-foreground">{rfq.dueLabel}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">
              Estimated Submission
            </div>
            <div className="mt-2 text-lg font-semibold text-foreground">
              {rfq.estimatedSubmissionLabel}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
            <span>{rfq.stageLabel}</span>
            <span>{rfq.stageProgress}% complete</span>
          </div>
          <RFQStageTimeline stages={rfq.stageHistory} />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            variant={activeTab === tab.value ? "outline" : "secondary"}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.24 }}
        >
          {activeTab === "operational" ? (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <div className="surface-panel p-6">
                  <div className="section-kicker">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Operational posture
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted">
                        Procurement lead
                      </div>
                      <div className="mt-2 text-lg font-semibold text-foreground">
                        {rfq.procurementLead}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted">
                        Next action
                      </div>
                      <div className="mt-2 text-lg font-semibold text-foreground">
                        {rfq.nextAction}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="surface-panel p-6">
                  <div className="text-lg font-semibold text-foreground">Stage notes</div>
                  <div className="mt-4 space-y-3">
                    {rfq.stageNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium text-foreground">{note.author}</div>
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
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-panel p-6">
                  <div className="text-lg font-semibold text-foreground">Recent files</div>
                  <div className="mt-4 space-y-3">
                    {rfq.recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div>
                          <div className="font-medium text-foreground">{file.label}</div>
                          <div className="mt-1 text-sm text-muted">
                            {file.type} • {file.uploadedLabel}
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

              <div className="space-y-6">
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

                <div className="surface-panel p-6">
                  <div className="text-lg font-semibold text-foreground">Subtasks</div>
                  <div className="mt-4 space-y-3">
                    {rfq.subtasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium text-foreground">{task.label}</div>
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
                        <div className="mt-2 text-sm text-muted">
                          {task.owner} • due {task.dueLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={role}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-panel p-6"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.24 }}
                  >
                    <div className="section-kicker">
                      {role === "manager" ? (
                        <ShieldAlert className="h-3.5 w-3.5" />
                      ) : (
                        <FileClock className="h-3.5 w-3.5" />
                      )}
                      {role === "manager" ? "Manager controls" : "Worker focus"}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {role === "manager"
                        ? "Managers can later approve lifecycle changes, refresh artifacts, and coordinate stage notes without bypassing the manager microservice."
                        : "Workers see the operational next actions and upload handoff clearly, while control-plane actions remain manager-owned."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : null}

          {activeTab === "intelligence" ? (
            <div className="space-y-6">
              <IntelligencePanel
                briefing={briefing}
                phase={phase}
                snapshot={snapshot}
                workbookProfile={workbookProfile}
                workbookReview={workbookReview}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="surface-panel p-6">
                  <div className="section-kicker">
                    <Sparkles className="h-3.5 w-3.5" />
                    Briefing recommendation
                  </div>
                  <div className="mt-4 text-lg font-semibold text-foreground">
                    {briefing?.recommendation ?? "Recommendation is still forming while intelligence matures."}
                  </div>
                  <div className="mt-4 space-y-2">
                    {(briefing?.openQuestions ?? snapshot?.blockers ?? []).map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-panel p-6">
                  <div className="section-kicker">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Workbook posture
                  </div>
                  <div className="mt-4 text-lg font-semibold text-foreground">
                    {workbookReview
                      ? `${workbookReview.readiness}% review readiness`
                      : "Workbook review still loading"}
                  </div>
                  <div className="mt-4 space-y-2">
                    {(workbookReview?.flags ?? []).length > 0 ? (
                      workbookReview?.flags.map((flag) => (
                        <div
                          key={`${flag.label}-${flag.detail}`}
                          className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                        >
                          <div className="font-medium text-foreground">{flag.label}</div>
                          <div className="mt-1 text-sm text-muted">{flag.detail}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        No workbook review blockers are currently open.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "artifacts" ? (
            <div className="space-y-5">
              {reprocessMessage ? (
                <div className="rounded-2xl border border-steel-500/20 bg-steel-500/10 p-4 text-sm text-steel-100">
                  {reprocessMessage}
                </div>
              ) : null}

              {artifactsLoading ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <SkeletonCard className="h-[260px]" lines={5} />
                  <SkeletonCard className="h-[260px]" lines={5} />
                  <SkeletonCard className="h-[260px]" lines={5} />
                  <SkeletonCard className="h-[260px]" lines={5} />
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {artifacts.map((artifact) => (
                    <ArtifactCard
                      key={artifact.id}
                      allowReprocess={role === "manager"}
                      artifact={artifact}
                      onReprocess={handleReprocess}
                    />
                  ))}
                </div>
              )}

              <div className="surface-panel p-6">
                <div className="section-kicker">
                  <Layers3 className="h-3.5 w-3.5" />
                  Artifact boundary
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Artifact cards are sourced from the intelligence connector layer, not from component-level mock imports. That keeps versioning, status, and later reprocess actions swappable when live APIs come online.
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
