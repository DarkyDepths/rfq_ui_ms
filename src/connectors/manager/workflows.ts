import { apiConfig } from "@/config/api";
import { managerWorkflowResponses } from "@/demo/manager/workflows";
import { requestJson } from "@/lib/http-client";
import type {
  ManagerWorkflowResponse,
  WorkflowModel,
} from "@/models/manager/workflow";
import { translateWorkflow } from "@/translators/manager/workflows";
import { sleep } from "@/utils/async";

export async function listWorkflows(): Promise<WorkflowModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.7));
    return managerWorkflowResponses.map(translateWorkflow);
  }

  const response = await requestJson<ManagerWorkflowResponse[]>(
    `${apiConfig.managerBaseUrl}/workflows`,
  );

  return response.map(translateWorkflow);
}

export async function getWorkflow(
  workflowId: string,
): Promise<WorkflowModel | null> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.55));
    const workflow = managerWorkflowResponses.find(
      (candidate) => candidate.id === workflowId,
    );
    return workflow ? translateWorkflow(workflow) : null;
  }

  const response = await requestJson<ManagerWorkflowResponse>(
    `${apiConfig.managerBaseUrl}/workflows/${workflowId}`,
  );

  return translateWorkflow(response);
}
