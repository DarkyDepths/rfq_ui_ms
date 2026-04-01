import type {
  ManagerWorkflowResponse,
  WorkflowModel,
} from "@/models/manager/workflow";
import { translateStageTemplate } from "@/translators/manager/stages";

export function translateWorkflow(
  workflow: ManagerWorkflowResponse,
): WorkflowModel {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    recommendedUse: workflow.recommendedUse,
    turnaroundDays: workflow.turnaroundDays,
    stageCount: workflow.stages.length,
    stages: workflow.stages.map(translateStageTemplate),
  };
}
