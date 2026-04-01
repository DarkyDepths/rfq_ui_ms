import type {
  IntelligencePortfolioResponse,
  IntelligenceSnapshotModel,
  SnapshotResponse,
} from "@/models/intelligence/snapshot";
import type {
  IntelligencePortfolioModel,
  KPIMetricModel,
} from "@/models/ui/dashboard";
import { intelligenceStatusMeta } from "@/utils/status";

export function translatePortfolioSummary(
  summary: IntelligencePortfolioResponse,
): IntelligencePortfolioModel {
  return {
    completeCount: summary.completeCount,
    partialCount: summary.partialCount,
    failedCount: summary.failedCount,
    readinessAverage: summary.readinessAverage,
    narrative: summary.narrative,
    featuredRfqId: summary.featuredRfqId,
  };
}

export function translatePortfolioKpis(
  summary: IntelligencePortfolioResponse,
): KPIMetricModel[] {
  return [
    {
      id: "intel-complete",
      label: "Complete Intelligence",
      value: `${summary.completeCount}`,
      helper: "RFQs with package and workbook artifacts aligned.",
      trendLabel: `${summary.partialCount} partial`,
      trendDirection: "steady",
      tone: "emerald",
    },
    {
      id: "intel-readiness",
      label: "Portfolio Readiness",
      value: `${summary.readinessAverage}%`,
      helper: "Average readiness across the monitored queue.",
      trendLabel: `${summary.failedCount} failed`,
      trendDirection: "steady",
      tone: "steel",
    },
  ];
}

export function translateSnapshot(
  snapshot: SnapshotResponse,
): IntelligenceSnapshotModel {
  const workbookLabel =
    snapshot.workbook.status === "not_uploaded"
      ? intelligenceStatusMeta.not_uploaded.label
      : intelligenceStatusMeta[snapshot.workbook.status].label;

  const workbookSummary =
    snapshot.workbook.status === "not_uploaded"
      ? "Workbook has not been uploaded yet."
      : snapshot.workbook.pendingQuestions.length > 0
        ? snapshot.workbook.pendingQuestions.join(" ")
        : "Workbook profile and review are aligned.";

  return {
    rfqId: snapshot.rfqId,
    state: snapshot.state,
    intakeStatusLabel: intelligenceStatusMeta[snapshot.intake.status].label,
    intakeSummary: snapshot.intake.summary,
    intakeStats: [
      `${snapshot.intake.sectionsDetected} sections mapped`,
      `${snapshot.intake.lineItems} line items parsed`,
    ],
    briefingStatusLabel: intelligenceStatusMeta[snapshot.briefing.status].label,
    briefingSummary: snapshot.briefing.summary,
    briefingStrengths: snapshot.briefing.strengths,
    briefingRisks: snapshot.briefing.risks,
    workbookStatusLabel: workbookLabel,
    workbookSummary,
    readinessScore: snapshot.readiness.score,
    confidenceScore: snapshot.readiness.confidence,
    blockers: snapshot.readiness.blockers,
    gaps: snapshot.quality.gaps,
    reviewFlags: snapshot.reviewFlags,
  };
}
