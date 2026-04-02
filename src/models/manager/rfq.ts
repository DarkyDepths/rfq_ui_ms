import type {
  ManagerStageStatusResponse,
  StageProgressModel,
} from "@/models/manager/stage";

export type ManagerRfqStatus =
  | "draft"
  | "in_preparation"
  | "under_review"
  | "submitted"
  | "awarded"
  | "lost"
  | "cancelled"
  | "attention_required";

export type IntelligenceState = "pending" | "partial" | "complete" | "failed";
export type PriorityLevel = "critical" | "high" | "normal";

export interface ManagerMetricResponse {
  id: string;
  label: string;
  value: number;
  unit: "count" | "percent" | "days";
  helper: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "steady";
  tone: "steel" | "gold" | "emerald" | "amber";
}

export interface ManagerRfqListItemResponse {
  id: string;
  title: string;
  client: string;
  owner: string;
  region: string;
  valueSar: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  workflowName: string;
  status: ManagerRfqStatus;
  intelligenceState: IntelligenceState;
  priority: PriorityLevel;
  nextAction: string;
  summaryLine: string;
  tags: string[];
  stageHistory: ManagerStageStatusResponse[];
}

export interface ManagerRfqListResponse {
  items: ManagerRfqListItemResponse[];
  metrics: ManagerMetricResponse[];
}

export interface ManagerStageNoteResponse {
  id: string;
  stageId: string;
  author: string;
  note: string;
  createdAt: string;
  tone: "info" | "warning" | "success";
}

export interface ManagerFileResponse {
  id: string;
  label: string;
  type: string;
  uploadedAt: string;
  status: "processed" | "pending" | "rejected";
}

export interface ManagerSubtaskResponse {
  id: string;
  label: string;
  owner: string;
  dueDate: string;
  state: "open" | "in_progress" | "done";
}

export interface ManagerUploadSlotResponse {
  kind: "zip" | "workbook";
  title: string;
  description: string;
  status: "ready" | "processing" | "missing" | "failed";
  fileName?: string;
  uploadedAt?: string;
}

export interface ManagerRfqDetailResponse extends ManagerRfqListItemResponse {
  description: string;
  procurementLead: string;
  estimatedSubmissionDate: string;
  stageNotes: ManagerStageNoteResponse[];
  recentFiles: ManagerFileResponse[];
  subtasks: ManagerSubtaskResponse[];
  uploads: ManagerUploadSlotResponse[];
}

export interface DashboardMetricModel {
  id: string;
  label: string;
  value: string;
  helper: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "steady";
  tone: "steel" | "gold" | "emerald" | "amber";
}

export interface StageNoteModel {
  id: string;
  author: string;
  note: string;
  createdLabel: string;
  tone?: "info" | "warning" | "success";
}

export interface RfqFileModel {
  id: string;
  label: string;
  type: string;
  uploadedLabel: string;
  status?: "processed" | "pending" | "rejected";
  uploadedBy?: string;
  downloadUrl?: string;
}

export interface RfqSubtaskModel {
  id: string;
  label: string;
  owner: string;
  dueLabel: string;
  state: "open" | "in_progress" | "done";
  progress?: number;
}

export interface UploadSlotModel {
  kind: "zip" | "workbook";
  title: string;
  description: string;
  status: "ready" | "processing" | "missing" | "failed";
  fileName?: string;
  uploadedLabel?: string;
}

export interface RfqCardModel {
  id: string;
  rfqCode?: string;
  title: string;
  client: string;
  owner: string;
  region?: string;
  workflowName?: string;
  valueLabel?: string;
  dueDateValue: string;
  dueLabel: string;
  status: ManagerRfqStatus;
  statusLabel: string;
  intelligenceState?: IntelligenceState;
  priority: PriorityLevel;
  nextAction?: string;
  summaryLine?: string;
  tags: string[];
  stageLabel: string;
  stageProgress: number;
  stageHistory: StageProgressModel[];
  updatedAtValue?: string;
  updatedAtLabel?: string;
}

export interface RfqDetailModel extends RfqCardModel {
  description?: string;
  procurementLead?: string;
  estimatedSubmissionLabel?: string;
  currentStageId?: string | null;
  outcomeReason?: string;
  stageNotes: StageNoteModel[];
  recentFiles: RfqFileModel[];
  subtasks: RfqSubtaskModel[];
  uploads: UploadSlotModel[];
}

export interface CreateRfqInput {
  name: string;
  client: string;
  owner: string;
  workflowId: string;
  deadline: string;
  priority: "normal" | "critical";
  description?: string;
  industry?: string;
  country?: string;
}

export interface UpdateRfqInput {
  name?: string;
  client?: string;
  industry?: string;
  country?: string;
  priority?: "normal" | "critical";
  deadline?: string;
  owner?: string;
  description?: string;
  status?: ManagerRfqStatus;
  outcomeReason?: string;
}

export interface RfqMutationResult {
  id: string;
  message: string;
  status: "demo_staged" | "created" | "updated";
}
