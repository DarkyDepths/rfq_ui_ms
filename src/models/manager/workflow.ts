import type {
  ManagerStageTemplateResponse,
  StageTemplateModel,
} from "@/models/manager/stage";

export interface ManagerWorkflowResponse {
  id: string;
  name: string;
  description: string;
  recommendedUse: string;
  turnaroundDays: number;
  stages: ManagerStageTemplateResponse[];
}

export interface WorkflowModel {
  id: string;
  name: string;
  code?: string;
  description?: string;
  recommendedUse?: string;
  turnaroundDays?: number;
  stageCount: number;
  isActive?: boolean;
  isDefault?: boolean;
  stages: StageTemplateModel[];
}
