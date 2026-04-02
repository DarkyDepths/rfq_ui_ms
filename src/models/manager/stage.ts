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
