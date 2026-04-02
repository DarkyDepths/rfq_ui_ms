import type {
  ManagerApiStageDetail,
  ManagerApiStageFile,
  ManagerApiStageNote,
  ManagerApiStageSubtask,
  ManagerApiStageSummary,
} from "@/models/manager/api-stage";
import type { ManagerApiWorkflowStageTemplate } from "@/models/manager/api-workflow";
import type {
  RfqFileModel,
  RfqSubtaskModel,
  StageNoteModel,
} from "@/models/manager/rfq";
import type {
  ManagerStageStatusResponse,
  ManagerStageTemplateResponse,
  StageProgressModel,
  StageProgressState,
  StageTemplateModel,
} from "@/models/manager/stage";
import { formatDate } from "@/utils/format";

export function translateStageTemplate(
  stage: ManagerStageTemplateResponse,
): StageTemplateModel {
  return {
    id: stage.id,
    label: stage.label,
    order: stage.order,
    summary: stage.summary,
    ownerRole: stage.ownerRole,
  };
}

export function translateStageProgress(
  stage: ManagerStageStatusResponse,
): StageProgressModel {
  return {
    ...translateStageTemplate(stage),
    state: stage.state,
    timestampLabel: stage.timestamp ? formatDate(stage.timestamp) : undefined,
  };
}

function resolveStageProgressState(
  status: string,
  blockerStatus?: string | null,
): StageProgressState {
  if (blockerStatus === "Blocked") {
    return "blocked";
  }

  const normalized = status.trim().toLowerCase();

  if (normalized === "completed" || normalized === "skipped") {
    return "completed";
  }

  if (normalized === "in progress") {
    return "active";
  }

  return "upcoming";
}

function resolveStageTimestamp(stage: ManagerApiStageSummary) {
  if (stage.actual_end) {
    return formatDate(stage.actual_end);
  }

  if (stage.actual_start) {
    return formatDate(stage.actual_start);
  }

  if (stage.planned_end) {
    return formatDate(stage.planned_end);
  }

  return undefined;
}

export function translateManagerWorkflowStageTemplate(
  stage: ManagerApiWorkflowStageTemplate,
): StageTemplateModel {
  return {
    id: stage.id,
    label: stage.name,
    order: stage.order,
    summary: `Planned duration: ${stage.planned_duration_days} day${
      stage.planned_duration_days === 1 ? "" : "s"
    }`,
    assignedTeam: stage.default_team ?? undefined,
    plannedDurationDays: stage.planned_duration_days,
  };
}

export function translateManagerStageSummary(
  stage: ManagerApiStageSummary,
): StageProgressModel {
  return {
    id: stage.id,
    label: stage.name,
    order: stage.order,
    summary: stage.assigned_team ? `Assigned team: ${stage.assigned_team}` : undefined,
    assignedTeam: stage.assigned_team ?? undefined,
    state: resolveStageProgressState(stage.status, stage.blocker_status),
    timestampLabel: resolveStageTimestamp(stage),
    progress: stage.progress,
    statusLabel: stage.status,
    blockerReasonCode: stage.blocker_reason_code ?? undefined,
  };
}

export function translateManagerStageNote(
  note: ManagerApiStageNote,
): StageNoteModel {
  return {
    id: note.id,
    author: note.user_name,
    note: note.text,
    createdLabel: formatDate(note.created_at),
  };
}

export function translateManagerStageFile(
  file: ManagerApiStageFile,
): RfqFileModel {
  return {
    id: file.id,
    label: file.filename,
    type: file.type,
    uploadedLabel: formatDate(file.uploaded_at),
    uploadedBy: file.uploaded_by,
    downloadUrl: file.download_url,
  };
}

function normalizeSubtaskState(
  status: string,
): RfqSubtaskModel["state"] {
  switch (status.trim().toLowerCase()) {
    case "done":
      return "done";
    case "in progress":
      return "in_progress";
    default:
      return "open";
  }
}

export function translateManagerSubtask(
  subtask: ManagerApiStageSubtask,
): RfqSubtaskModel {
  return {
    id: subtask.id,
    label: subtask.name,
    owner: subtask.assigned_to ?? "Unassigned",
    dueLabel: subtask.due_date ? formatDate(subtask.due_date) : "Pending",
    state: normalizeSubtaskState(subtask.status),
    progress: subtask.progress,
  };
}

export function translateManagerStageDetailCollections(
  stage: ManagerApiStageDetail | null,
) {
  return {
    files: stage ? stage.files.map(translateManagerStageFile) : [],
    notes: stage ? stage.notes.map(translateManagerStageNote) : [],
    subtasks: stage ? stage.subtasks.map(translateManagerSubtask) : [],
  };
}
