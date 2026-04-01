import { apiConfig } from "@/config/api";
import { managerRfqDetailResponses } from "@/demo/manager/rfqs";
import { managerWorkflowResponses } from "@/demo/manager/workflows";
import { requestJson } from "@/lib/http-client";
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
import { translateStageProgress, translateStageTemplate } from "@/translators/manager/stages";
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

  const response = await requestJson<ManagerStageStatusResponse[]>(
    `${apiConfig.managerBaseUrl}/workflows/${workflowId}/stages`,
  );

  return response.map(translateStageTemplate);
}

export async function getRfqStages(rfqId: string): Promise<StageProgressModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.45));
    return (managerRfqDetailResponses[rfqId]?.stageHistory ?? []).map(
      translateStageProgress,
    );
  }

  const response = await requestJson<ManagerStageStatusResponse[]>(
    `${apiConfig.managerBaseUrl}/rfqs/${rfqId}/stages`,
  );

  return response.map(translateStageProgress);
}

export async function listStageNotes(rfqId: string): Promise<StageNoteModel[]> {
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

  return requestJson<StageNoteModel[]>(
    `${apiConfig.managerBaseUrl}/rfqs/${rfqId}/stage-notes`,
  );
}

export async function listStageFiles(rfqId: string): Promise<RfqFileModel[]> {
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

  return requestJson<RfqFileModel[]>(
    `${apiConfig.managerBaseUrl}/rfqs/${rfqId}/stage-files`,
  );
}

export async function listSubtasks(rfqId: string): Promise<RfqSubtaskModel[]> {
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

  return requestJson<RfqSubtaskModel[]>(
    `${apiConfig.managerBaseUrl}/rfqs/${rfqId}/subtasks`,
  );
}
