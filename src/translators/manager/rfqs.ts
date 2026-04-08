import type {
  ManagerApiRfqAnalytics,
  ManagerApiRfqDetail,
  ManagerApiRfqStats,
  ManagerApiRfqStatus,
  ManagerApiRfqSummary,
} from "@/models/manager/api-rfq";
import type {
  ManagerApiStageDetail,
  ManagerApiStageSummary,
} from "@/models/manager/api-stage";
import type {
  DashboardMetricModel,
  ManagerMetricResponse,
  ManagerRfqDetailResponse,
  ManagerRfqListItemResponse,
  ManagerRfqStatus,
  RfqCardModel,
  RfqDetailModel,
  RfqFileModel,
  RfqSubtaskModel,
  StageNoteModel,
  UploadSlotModel,
} from "@/models/manager/rfq";
import type { ManagerDashboardAnalyticsModel } from "@/models/ui/dashboard";
import { translateStageProgress } from "@/translators/manager/stages";
import {
  translateManagerStageDetailCollections,
  translateManagerStageSummary,
} from "@/translators/manager/stages";
import {
  formatCompactCurrency,
  formatDate,
  formatPercent,
} from "@/utils/format";
import { resolveEstimatedSubmissionDateValue } from "@/utils/estimated-submission";
import { rfqStatusMeta } from "@/utils/status";

function resolveMetricValue(metric: ManagerMetricResponse) {
  switch (metric.unit) {
    case "percent":
      return formatPercent(metric.value);
    case "days":
      return `${metric.value.toFixed(1)} d`;
    default:
      return `${metric.value}`;
  }
}

export function translateDashboardMetric(
  metric: ManagerMetricResponse,
): DashboardMetricModel {
  return {
    id: metric.id,
    label: metric.label,
    value: resolveMetricValue(metric),
    helper: metric.helper,
    trendLabel: metric.trendLabel,
    trendDirection: metric.trendDirection,
    tone: metric.tone,
  };
}

function getActiveStage(item: ManagerRfqListItemResponse) {
  return (
    item.stageHistory.find((stage) => stage.state === "active") ??
    item.stageHistory.find((stage) => stage.state === "blocked") ??
    [...item.stageHistory]
      .reverse()
      .find((stage) => stage.state !== "upcoming" && stage.state !== "skipped") ??
    item.stageHistory.find((stage) => stage.state === "skipped") ??
    item.stageHistory[item.stageHistory.length - 1]
  );
}

function calculateLifecycleProgress(item: ManagerRfqListItemResponse) {
  if (
    item.status === "awarded" ||
    item.status === "lost" ||
    item.status === "cancelled"
  ) {
    return 100;
  }

  const effectiveStages = item.stageHistory.filter((stage) => stage.state !== "skipped");
  if (effectiveStages.length === 0) {
    return 100;
  }

  const completedStages = effectiveStages.filter(
    (stage) => stage.state === "completed",
  );
  if (completedStages.length === effectiveStages.length) {
    return 100;
  }

  return Math.floor((completedStages.length / effectiveStages.length) * 100);
}

export function translateRfqCard(
  item: ManagerRfqListItemResponse,
): RfqCardModel {
  const activeStage = getActiveStage(item);
  const stageHistory = item.stageHistory.map(translateStageProgress);
  const blockedStage = stageHistory.find((stage) => stage.state === "blocked");

  return {
    id: item.id,
    rfqCode: item.id,
    title: item.title,
    client: item.client,
    owner: item.owner,
    workflowId: item.workflowId,
    region: item.region,
    workflowName: item.workflowName,
    valueLabel: formatCompactCurrency(item.valueSar),
    dueDateValue: item.dueDate,
    dueLabel: formatDate(item.dueDate),
    status: item.status,
    statusLabel: rfqStatusMeta[item.status].label,
    outcomeReason: item.outcomeReason,
    intelligenceState: item.intelligenceState,
    priority: item.priority,
    nextAction: item.nextAction,
    summaryLine: item.summaryLine,
    tags: item.tags,
    stageLabel: activeStage?.label ?? "Unassigned",
    rfqProgress: calculateLifecycleProgress(item),
    stageHistory,
    blockerStatus: blockedStage ? "Blocked" : undefined,
    blockerReasonCode: blockedStage?.blockerReasonCode,
    updatedAtValue: item.updatedAt,
    updatedAtLabel: formatDate(item.updatedAt),
  };
}

function translateStageNote(
  note: ManagerRfqDetailResponse["stageNotes"][number],
): StageNoteModel {
  return {
    id: note.id,
    author: note.author,
    note: note.note,
    createdAtValue: note.createdAt,
    createdLabel: formatDate(note.createdAt),
    tone: note.tone,
  };
}

function translateRecentFile(
  file: ManagerRfqDetailResponse["recentFiles"][number],
): RfqFileModel {
  return {
    id: file.id,
    label: file.label,
    type: file.type,
    uploadedLabel: formatDate(file.uploadedAt),
    uploadedBy: file.uploadedBy,
    status: file.status,
  };
}

function translateSubtask(
  task: ManagerRfqDetailResponse["subtasks"][number],
): RfqSubtaskModel {
  return {
    id: task.id,
    label: task.label,
    owner: task.owner,
    dueLabel: formatDate(task.dueDate),
    state: task.state,
  };
}

function translateUploadSlot(
  upload: ManagerRfqDetailResponse["uploads"][number],
): UploadSlotModel {
  return {
    kind: upload.kind,
    title: upload.title,
    description: upload.description,
    status: upload.status,
    fileName: upload.fileName,
    uploadedLabel: upload.uploadedAt ? formatDate(upload.uploadedAt) : undefined,
  };
}

export function translateRfqDetail(
  item: ManagerRfqDetailResponse,
): RfqDetailModel {
  const card = translateRfqCard(item);

  return {
    ...card,
    description: item.description,
    industry: item.industry,
    outcomeReason: item.outcomeReason,
    procurementLead: item.procurementLead,
    estimatedSubmissionLabel: formatDate(item.estimatedSubmissionDate),
    stageNotes: item.stageNotes.map(translateStageNote),
    recentFiles: item.recentFiles.map(translateRecentFile),
    subtasks: item.subtasks.map(translateSubtask),
    uploads: item.uploads.map(translateUploadSlot),
  };
}

const liveStatusMap: Record<ManagerApiRfqStatus, ManagerRfqStatus> = {
  Draft: "draft",
  "In preparation": "in_preparation",
  Submitted: "submitted",
  Awarded: "awarded",
  Lost: "lost",
  Cancelled: "cancelled",
};

export function translateManagerStats(
  stats: ManagerApiRfqStats,
): DashboardMetricModel[] {
  return [
    {
      id: "total-rfqs",
      label: "Total RFQs",
      value: `${stats.total_rfqs_12m}`,
      helper: "Rolling 12-month RFQ volume from the manager service.",
      trendLabel: "12-month window",
      trendDirection: "steady",
      tone: "steel",
    },
    {
      id: "open-rfqs",
      label: "Open RFQs",
      value: `${stats.open_rfqs}`,
      helper: "Currently active RFQs across the operational queue.",
      trendLabel: "Manager-owned backlog",
      trendDirection: "steady",
      tone: "gold",
    },
    {
      id: "critical-rfqs",
      label: "Critical RFQs",
      value: `${stats.critical_rfqs}`,
      helper: "Critical-priority pursuits flagged by the manager service.",
      trendLabel: "Priority-controlled scope",
      trendDirection: "steady",
      tone: "amber",
    },
    {
      id: "avg-cycle-days",
      label: "Avg Cycle Days",
      value: `${stats.avg_cycle_days} d`,
      helper: "Average lifecycle duration for completed RFQs.",
      trendLabel: "Manager analytics baseline",
      trendDirection: "steady",
      tone: "emerald",
    },
  ];
}

function normalizeManagerStatus(status: ManagerApiRfqStatus): ManagerRfqStatus {
  return liveStatusMap[status];
}

export function translateManagerRfqCard(
  item: ManagerApiRfqSummary,
): RfqCardModel {
  const status = normalizeManagerStatus(item.status);
  const isBlocked = item.current_stage_blocker_status === "Blocked";

  return {
    id: item.id,
    rfqCode: item.rfq_code ?? undefined,
    title: item.name,
    client: item.client,
    owner: item.owner,
    region: item.country ?? undefined,
    workflowName: item.workflow_name ?? undefined,
    dueDateValue: item.deadline,
    dueLabel: formatDate(item.deadline),
    status,
    statusLabel: rfqStatusMeta[status].label,
    priority: item.priority,
    tags: [],
    stageLabel: item.current_stage_name ?? "No active stage",
    rfqProgress: item.progress,
    stageHistory: [],
    blockerStatus: isBlocked ? "Blocked" : undefined,
    blockerReasonCode: isBlocked
      ? item.current_stage_blocker_reason_code ?? undefined
      : undefined,
  };
}

export function translateManagerRfqDetail(
  detail: ManagerApiRfqDetail,
  stages: ManagerApiStageSummary[],
  currentStage: ManagerApiStageDetail | null,
): RfqDetailModel {
  const shell = translateManagerRfqCard(detail);
  const stageCollections = translateManagerStageDetailCollections(currentStage);
  const stageHistory = stages.map(translateManagerStageSummary);
  const blockedStage =
    stageHistory.find((stage) => stage.state === "blocked")
    ?? (currentStage ? translateManagerStageSummary(currentStage) : null);

  return {
    ...shell,
    workflowId: detail.workflow_id,
    workflowName: detail.workflow_name ?? shell.workflowName,
    description: detail.description ?? undefined,
    industry: detail.industry ?? undefined,
    currentStageId: detail.current_stage_id ?? null,
    outcomeReason: detail.outcome_reason ?? undefined,
    stageHistory,
    blockerStatus:
      blockedStage?.state === "blocked" ? "Blocked" : shell.blockerStatus,
    blockerReasonCode:
      blockedStage?.state === "blocked"
        ? blockedStage.blockerReasonCode
        : shell.blockerReasonCode,
    estimatedSubmissionLabel: formatDate(
      resolveEstimatedSubmissionDateValue(stages, detail.deadline),
    ),
    updatedAtValue: detail.updated_at,
    updatedAtLabel: formatDate(detail.updated_at),
    stageNotes: stageCollections.notes,
    recentFiles: stageCollections.files,
    subtasks: stageCollections.subtasks,
    uploads: [],
  };
}

export function translateManagerAnalytics(
  analytics: ManagerApiRfqAnalytics,
): ManagerDashboardAnalyticsModel {
  return {
    metrics: [
      {
        id: "win-rate",
        label: "Win Rate",
        value: analytics.win_rate,
        displayValue: formatPercent(analytics.win_rate),
        helper: "Awarded share across the manager analytics baseline.",
        tone: "emerald",
      },
      {
        id: "estimation-accuracy",
        label: "Estimation Accuracy",
        value: analytics.estimation_accuracy,
        displayValue: formatPercent(analytics.estimation_accuracy),
        helper: "Manager-reported estimation accuracy.",
        tone: "steel",
      },
      {
        id: "avg-margin-submitted",
        label: "Avg Margin Submitted",
        value: analytics.avg_margin_submitted,
        displayValue: formatPercent(analytics.avg_margin_submitted),
        helper: "Average margin across submitted RFQs.",
        tone: "gold",
      },
      {
        id: "avg-margin-awarded",
        label: "Avg Margin Awarded",
        value: analytics.avg_margin_awarded,
        displayValue: formatPercent(analytics.avg_margin_awarded),
        helper: "Average margin across awarded RFQs.",
        tone: "amber",
      },
    ],
    byClient: analytics.by_client
      .slice()
      .sort((left, right) => right.rfq_count - left.rfq_count)
      .map((entry) => ({
        client: entry.client,
        rfqCount: entry.rfq_count,
        avgMarginValue: entry.avg_margin,
        avgMarginLabel: formatPercent(entry.avg_margin),
      })),
  };
}
