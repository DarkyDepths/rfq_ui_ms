import { apiConfig } from "@/config/api";
import { requestManagerJson } from "@/connectors/manager/base";
import { managerRfqDetailResponses } from "@/demo/manager/rfqs";
import { managerWorkflowResponses } from "@/demo/manager/workflows";
import type {
  ManagerApiStageDetail,
  ManagerApiStageListResponse,
} from "@/models/manager/api-stage";
import type {
  RfqFileModel,
  RfqSubtaskModel,
  StageNoteModel,
} from "@/models/manager/rfq";
import type {
  ManagerStageStatusResponse,
  StageProgressModel,
  StageTemplateModel,
} from "@/models/manager/stage";
import {
  translateManagerStageDetailCollections,
  translateManagerStageSummary,
  translateManagerWorkflowStageTemplate,
  translateStageProgress,
  translateStageTemplate,
} from "@/translators/manager/stages";
import { sleep } from "@/utils/async";

export async function getWorkflowStages(
  workflowId: string,
): Promise<StageTemplateModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.45));
    const workflow = managerWorkflowResponses.find(
      (candidate) => candidate.id === workflowId,
    );
    return workflow ? workflow.stages.map(translateStageTemplate) : [];
  }

  const response = await requestManagerJson<{
    stages: {
      id: string;
      name: string;
      order: number;
      default_team?: string | null;
      planned_duration_days: number;
    }[];
  }>(`/workflows/${workflowId}`);

  return response.stages.map(translateManagerWorkflowStageTemplate);
}

export async function getRfqStages(rfqId: string): Promise<StageProgressModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.45));
    return (managerRfqDetailResponses[rfqId]?.stageHistory ?? []).map(
      translateStageProgress,
    );
  }

  const response = await requestManagerJson<ManagerApiStageListResponse>(
    `/rfqs/${rfqId}/stages`,
  );

  return response.data.map(translateManagerStageSummary);
}

async function getStageDetail(
  rfqId: string,
  stageId: string,
): Promise<ManagerApiStageDetail | null> {
  if (!stageId) {
    return null;
  }

  return requestManagerJson<ManagerApiStageDetail>(
    `/rfqs/${rfqId}/stages/${stageId}`,
  );
}

export async function listStageNotes(
  rfqId: string,
  stageId?: string,
): Promise<StageNoteModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.35));
    const notes = managerRfqDetailResponses[rfqId]?.stageNotes ?? [];
    return notes.map((note) => ({
      id: note.id,
      author: note.author,
      note: note.note,
      createdLabel: note.createdAt.slice(0, 10),
      tone: note.tone,
    }));
  }

  if (!stageId) {
    return [];
  }

  const detail = await getStageDetail(rfqId, stageId);
  return translateManagerStageDetailCollections(detail).notes;
}

export async function listStageFiles(
  rfqId: string,
  stageId?: string,
): Promise<RfqFileModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.35));
    const files = managerRfqDetailResponses[rfqId]?.recentFiles ?? [];
    return files.map((file) => ({
      id: file.id,
      label: file.label,
      type: file.type,
      uploadedLabel: file.uploadedAt.slice(0, 10),
      status: file.status,
    }));
  }

  if (!stageId) {
    return [];
  }

  const detail = await getStageDetail(rfqId, stageId);
  return translateManagerStageDetailCollections(detail).files;
}

export async function listSubtasks(
  rfqId: string,
  stageId?: string,
): Promise<RfqSubtaskModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.35));
    const tasks = managerRfqDetailResponses[rfqId]?.subtasks ?? [];
    return tasks.map((task) => ({
      id: task.id,
      label: task.label,
      owner: task.owner,
      dueLabel: task.dueDate,
      state: task.state,
    }));
  }

  if (!stageId) {
    return [];
  }

  const detail = await getStageDetail(rfqId, stageId);
  return translateManagerStageDetailCollections(detail).subtasks;
}
