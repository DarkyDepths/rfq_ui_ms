import type {
  DashboardMetricModel,
  ManagerMetricResponse,
  ManagerRfqDetailResponse,
  ManagerRfqListItemResponse,
  RfqCardModel,
  RfqDetailModel,
  RfqFileModel,
  RfqSubtaskModel,
  StageNoteModel,
  UploadSlotModel,
} from "@/models/manager/rfq";
import { translateStageProgress } from "@/translators/manager/stages";
import {
  formatCompactCurrency,
  formatDate,
  formatPercent,
} from "@/utils/format";
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
    item.stageHistory[item.stageHistory.length - 1]
  );
}

function calculateStageProgress(item: ManagerRfqListItemResponse) {
  const activeStage = getActiveStage(item);
  if (!activeStage) {
    return 0;
  }

  return Math.round((activeStage.order / item.stageHistory.length) * 100);
}

export function translateRfqCard(
  item: ManagerRfqListItemResponse,
): RfqCardModel {
  const activeStage = getActiveStage(item);

  return {
    id: item.id,
    title: item.title,
    client: item.client,
    owner: item.owner,
    region: item.region,
    workflowName: item.workflowName,
    valueLabel: formatCompactCurrency(item.valueSar),
    dueLabel: formatDate(item.dueDate),
    status: item.status,
    statusLabel: rfqStatusMeta[item.status].label,
    intelligenceState: item.intelligenceState,
    priority: item.priority,
    nextAction: item.nextAction,
    summaryLine: item.summaryLine,
    tags: item.tags,
    stageLabel: activeStage?.label ?? "Unassigned",
    stageProgress: calculateStageProgress(item),
    stageHistory: item.stageHistory.map(translateStageProgress),
  };
}

function translateStageNote(
  note: ManagerRfqDetailResponse["stageNotes"][number],
): StageNoteModel {
  return {
    id: note.id,
    author: note.author,
    note: note.note,
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
    procurementLead: item.procurementLead,
    estimatedSubmissionLabel: formatDate(item.estimatedSubmissionDate),
    stageNotes: item.stageNotes.map(translateStageNote),
    recentFiles: item.recentFiles.map(translateRecentFile),
    subtasks: item.subtasks.map(translateSubtask),
    uploads: item.uploads.map(translateUploadSlot),
  };
}
