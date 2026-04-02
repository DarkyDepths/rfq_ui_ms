import { apiConfig } from "@/config/api";
import {
  requestManagerJson,
  type ManagerRequestOptions,
} from "@/connectors/manager/base";
import { managerRfqDetailResponses } from "@/demo/manager/rfqs";
import { managerWorkflowResponses } from "@/demo/manager/workflows";
import type {
  ManagerApiStageDetail,
  ManagerApiStageListResponse,
  ManagerApiStageNoteInput,
  ManagerApiStageUpdateInput,
  ManagerApiSubtaskCreateInput,
  ManagerApiSubtaskUpdateInput,
} from "@/models/manager/api-stage";
import type {
  RfqFileModel,
  RfqSubtaskModel,
  StageNoteModel,
  SubtaskCreateInput,
  SubtaskUpdateInput,
} from "@/models/manager/rfq";
import type {
  StageProgressModel,
  StageTemplateModel,
  StageUpdateInput,
  StageWorkspaceModel,
} from "@/models/manager/stage";
import {
  translateManagerStageDetailCollections,
  translateManagerStageSummary,
  translateManagerStageWorkspace,
  translateManagerWorkflowStageTemplate,
  translateStageProgress,
  translateStageTemplate,
  translateStageUpdateInput,
} from "@/translators/manager/stages";
import { sleep } from "@/utils/async";

export interface StageActionOptions {
  actorTeam?: string;
  actorUserName?: string;
}

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

export async function getStageDetail(
  rfqId: string,
  stageId?: string | null,
): Promise<ManagerApiStageDetail | null> {
  if (!stageId) {
    return null;
  }

  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.35));
    return null;
  }

  return requestManagerJson<ManagerApiStageDetail>(
    `/rfqs/${rfqId}/stages/${stageId}`,
  );
}

export async function getStageWorkspace(
  rfqId: string,
  stageId?: string | null,
): Promise<StageWorkspaceModel | null> {
  if (apiConfig.useMockData || !stageId) {
    return null;
  }

  const detail = await getStageDetail(rfqId, stageId);
  return detail ? translateManagerStageWorkspace(detail) : null;
}

function buildActionOptions(
  options?: StageActionOptions,
): Pick<ManagerRequestOptions, "actorTeam" | "actorUserName"> {
  return {
    actorTeam: options?.actorTeam,
    actorUserName: options?.actorUserName,
  };
}

export async function updateStage(
  rfqId: string,
  stageId: string,
  input: StageUpdateInput,
  options?: StageActionOptions,
): Promise<StageWorkspaceModel> {
  const response = await requestManagerJson<ManagerApiStageDetail>(
    `/rfqs/${rfqId}/stages/${stageId}`,
    {
      ...buildActionOptions(options),
      method: "PATCH",
      body: JSON.stringify(
        translateStageUpdateInput(input) satisfies ManagerApiStageUpdateInput,
      ),
    },
  );

  return translateManagerStageWorkspace(response);
}

export async function advanceStage(
  rfqId: string,
  stageId: string,
  options?: StageActionOptions,
): Promise<StageWorkspaceModel> {
  const response = await requestManagerJson<ManagerApiStageDetail>(
    `/rfqs/${rfqId}/stages/${stageId}/advance`,
    {
      ...buildActionOptions(options),
      method: "POST",
    },
  );

  return translateManagerStageWorkspace(response);
}

export async function addStageNote(
  rfqId: string,
  stageId: string,
  text: string,
  options?: StageActionOptions,
): Promise<StageNoteModel> {
  const response = await requestManagerJson<{
    id: string;
    user_name: string;
    text: string;
    created_at: string;
  }>(
    `/rfqs/${rfqId}/stages/${stageId}/notes`,
    {
      ...buildActionOptions(options),
      method: "POST",
      body: JSON.stringify({ text } satisfies ManagerApiStageNoteInput),
    },
  );

  return {
    id: response.id,
    author: response.user_name,
    note: response.text,
    createdLabel: response.created_at,
  };
}

export async function uploadStageFile(
  rfqId: string,
  stageId: string,
  file: File,
  type: string,
  options?: StageActionOptions,
): Promise<RfqFileModel> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await requestManagerJson<ManagerApiStageDetail["files"][number]>(
    `/rfqs/${rfqId}/stages/${stageId}/files`,
    {
      ...buildActionOptions(options),
      method: "POST",
      body: formData,
    },
  );

  return translateManagerStageDetailCollections({
    id: stageId,
    name: "",
    order: 0,
    status: "In Progress",
    progress: 0,
    notes: [],
    subtasks: [],
    files: [response],
  } as ManagerApiStageDetail).files[0];
}

export async function deleteStageFile(fileId: string): Promise<void> {
  await requestManagerJson<void>(`/files/${fileId}`, {
    method: "DELETE",
  });
}

export async function createSubtask(
  rfqId: string,
  stageId: string,
  input: SubtaskCreateInput,
  options?: StageActionOptions,
): Promise<void> {
  await requestManagerJson(
    `/rfqs/${rfqId}/stages/${stageId}/subtasks`,
    {
      ...buildActionOptions(options),
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        assigned_to: input.assignedTo,
        due_date: input.dueDate,
      } satisfies ManagerApiSubtaskCreateInput),
    },
  );
}

export async function updateSubtask(
  rfqId: string,
  stageId: string,
  subtaskId: string,
  input: SubtaskUpdateInput,
  options?: StageActionOptions,
): Promise<void> {
  await requestManagerJson(
    `/rfqs/${rfqId}/stages/${stageId}/subtasks/${subtaskId}`,
    {
      ...buildActionOptions(options),
      method: "PATCH",
      body: JSON.stringify({
        name: input.name,
        assigned_to: input.assignedTo,
        due_date: input.dueDate,
        progress: input.progress,
        status: input.status,
      } satisfies ManagerApiSubtaskUpdateInput),
    },
  );
}

export async function deleteSubtask(
  rfqId: string,
  stageId: string,
  subtaskId: string,
  options?: StageActionOptions,
): Promise<void> {
  await requestManagerJson<void>(
    `/rfqs/${rfqId}/stages/${stageId}/subtasks/${subtaskId}`,
    {
      ...buildActionOptions(options),
      method: "DELETE",
    },
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
