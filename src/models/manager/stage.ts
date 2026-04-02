import type { AppRole } from "@/models/ui/role";

export type StageProgressState = "completed" | "active" | "upcoming" | "blocked";

export interface ManagerStageTemplateResponse {
  id: string;
  label: string;
  order: number;
  summary: string;
  ownerRole: AppRole | "shared";
}

export interface ManagerStageStatusResponse
  extends ManagerStageTemplateResponse {
  state: StageProgressState;
  timestamp?: string;
}

export interface StageTemplateModel {
  id: string;
  label: string;
  order: number;
  summary?: string;
  ownerRole?: AppRole | "shared";
  assignedTeam?: string;
  plannedDurationDays?: number;
}

export interface StageProgressModel extends StageTemplateModel {
  state: StageProgressState;
  timestampLabel?: string;
  progress?: number;
  statusLabel?: string;
  blockerReasonCode?: string;
}

export interface StageWorkspaceModel extends StageProgressModel {
  capturedData: Record<string, string>;
  mandatoryFields: string[];
  blockerStatus?: "Blocked" | "Resolved";
  plannedStartValue?: string;
  plannedStartLabel?: string;
  plannedEndValue?: string;
  plannedEndLabel?: string;
  actualStartValue?: string;
  actualStartLabel?: string;
  actualEndValue?: string;
  actualEndLabel?: string;
}

export interface StageUpdateInput {
  progress?: number;
  assignedTeam?: string;
  capturedData?: Record<string, string>;
  blockerStatus?: "Blocked" | "Resolved";
  blockerReasonCode?: string;
}
