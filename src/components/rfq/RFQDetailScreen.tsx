"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardCheck, Layers3, Radar, Sparkles } from "lucide-react";

import { ArtifactCard } from "@/components/artifacts/ArtifactCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { IntelligenceActionsPanel } from "@/components/intelligence/IntelligenceActionsPanel";
import { IntelligencePanel } from "@/components/intelligence/IntelligencePanel";
import { RfqOperationalWorkspace } from "@/components/rfq/RfqOperationalWorkspace";
import { RFQStageTimeline } from "@/components/rfq/RFQStageTimeline";
import { RFQStatusChip } from "@/components/rfq/RFQStatusChip";
import { Badge } from "@/components/ui/badge";
import { apiConfig } from "@/config/api";
import { getPermissions } from "@/config/role-permissions";
import { useRole } from "@/context/role-context";
import { useRfqDetail } from "@/hooks/use-rfq-detail";
import { useRfqIntelligence } from "@/hooks/use-rfq-intelligence";
import { intelligenceAvailabilityMeta } from "@/utils/status";

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
  const isDemoMode = apiConfig.useMockData;
  const visibleTabValues = permissions.detailTabs as readonly DetailTab[];
  const visibleTabs = tabConfig.filter((tab) => visibleTabValues.includes(tab.value));
  const { error, loading, refresh, rfq } = useRfqDetail(rfqId);
  const intelligence = useRfqIntelligence(
    rfqId,
    permissions.canViewIntelligence || permissions.canViewArtifacts,
    rfq?.updatedAtValue,
  );
  const [activeTab, setActiveTab] = useState<DetailTab>("operational");

  useEffect(() => {
    if (!visibleTabValues.includes(activeTab)) {
      const nextTab = tabConfig.find((tab) => visibleTabValues.includes(tab.value));
      setActiveTab(nextTab?.value ?? "intelligence");
    }
  }, [activeTab, visibleTabValues]);

  if (loading) {
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
        description={error ?? "The requested RFQ was not found."}
        title="RFQ not found"
      />
    );
  }

  const liveIntelState =
    intelligence.snapshot.data?.availability ??
    intelligence.briefing.data?.availability ??
    intelligence.workbookProfile.data?.availability ??
    intelligence.workbookReview.data?.availability ??
    (intelligence.snapshot.loading ||
    intelligence.briefing.loading ||
    intelligence.workbookProfile.loading ||
    intelligence.workbookReview.loading
      ? "pending"
      : "not_available_yet");

  const liveIntelMeta = intelligenceAvailabilityMeta[liveIntelState];

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="section-kicker">{rfq.rfqCode ?? rfq.id}</div>
            <h1 className="mt-3 text-display text-2xl font-semibold text-foreground lg:text-3xl">
              {rfq.title}
            </h1>
            {rfq.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {rfq.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RFQStatusChip status={rfq.status} />
            {rfq.workflowName ? <Badge variant="steel">{rfq.workflowName}</Badge> : null}
            {isDemoMode && rfq.intelligenceState ? (
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
            ) : (
              <Badge variant={liveIntelMeta.tone}>Intel: {liveIntelMeta.label}</Badge>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Client
            </div>
            <div className="mt-1 font-medium text-foreground">{rfq.client}</div>
          </div>
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Owner
            </div>
            <div className="mt-1 font-medium text-foreground">{rfq.owner}</div>
          </div>
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Due Date
            </div>
            <div className="mt-1 font-mono font-medium text-foreground">{rfq.dueLabel}</div>
          </div>
          <div className="stat-cell">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Updated
            </div>
            <div className="mt-1 font-mono font-medium text-foreground">
              {rfq.updatedAtLabel ?? "Pending"}
            </div>
          </div>
        </div>

        {rfq.stageHistory.length > 0 ? (
          <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 dark:bg-white/[0.02]">
            <div className="mb-2 flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>{rfq.stageLabel}</span>
              <span className="font-mono">{rfq.stageProgress}%</span>
            </div>
            <RFQStageTimeline stages={rfq.stageHistory} />
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{rfq.stageLabel}</span>
              <span className="font-mono text-sm text-muted-foreground">{rfq.stageProgress}%</span>
            </div>
          </div>
        )}
      </section>

      <div className="flex gap-1.5 rounded-xl border border-border bg-muted/40 p-1 dark:bg-white/[0.02]">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "operational" ? (
            <RfqOperationalWorkspace
              onRefreshRfq={refresh}
              permissions={permissions}
              rfq={rfq}
              role={role}
            />
          ) : null}

          {activeTab === "intelligence" ? (
            <div className="space-y-5">
              <IntelligenceActionsPanel
                onRefresh={intelligence.refresh}
                onReprocess={async (kind) => intelligence.requestReprocess(kind)}
                onTriggerIntake={intelligence.triggerIntake}
                onTriggerOutcome={intelligence.triggerOutcome}
                onTriggerWorkbook={intelligence.triggerWorkbook}
                permissions={permissions}
                rfqOutcomeReason={rfq.outcomeReason}
                rfqStatus={rfq.status}
                role={role}
              />
              <IntelligencePanel
                briefing={intelligence.briefing}
                snapshot={intelligence.snapshot}
                staleIntel={intelligence.staleIntel}
                workbookProfile={intelligence.workbookProfile}
                workbookReview={intelligence.workbookReview}
              />
            </div>
          ) : null}

          {activeTab === "artifacts" ? (
            intelligence.artifacts.loading ? (
              <div className="grid gap-5 xl:grid-cols-2">
                <SkeletonCard className="h-[240px]" lines={5} />
                <SkeletonCard className="h-[240px]" lines={5} />
                <SkeletonCard className="h-[240px]" lines={5} />
                <SkeletonCard className="h-[240px]" lines={5} />
              </div>
            ) : intelligence.artifacts.error ? (
              <EmptyState
                description={intelligence.artifacts.error}
                title="Artifact catalog unavailable"
              />
            ) : intelligence.artifacts.data.length === 0 ? (
              <div className="surface-panel p-6">
                <div className="section-kicker">
                  <Layers3 className="h-3.5 w-3.5" />
                  No Artifacts Yet
                </div>
                <h2 className="mt-3 text-lg font-semibold text-foreground">
                  No intelligence artifacts have been generated for this RFQ
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Trigger intake or workbook processing from the Intelligence tab when the manager-side prerequisites are in place.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {intelligence.artifacts.data.map((artifact) => (
                  <ArtifactCard key={`${artifact.id}-${artifact.version}`} artifact={artifact} />
                ))}
              </div>
            )
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
