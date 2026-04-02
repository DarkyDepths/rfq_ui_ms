export type ManagerApiRfqStatus =
  | "Draft"
  | "In preparation"
  | "Submitted"
  | "Awarded"
  | "Lost"
  | "Cancelled";

export type ManagerApiPriority = "normal" | "critical";

export interface ManagerApiRfqSummary {
  id: string;
  rfq_code?: string | null;
  name: string;
  client: string;
  country?: string | null;
  owner: string;
  priority: ManagerApiPriority;
  status: ManagerApiRfqStatus;
  progress: number;
  deadline: string;
  current_stage_name?: string | null;
  workflow_name?: string | null;
}

export interface ManagerApiRfqListResponse {
  data: ManagerApiRfqSummary[];
  total: number;
  page: number;
  size: number;
}

export interface ManagerApiRfqDetail {
  id: string;
  rfq_code?: string | null;
  name: string;
  client: string;
  status: ManagerApiRfqStatus;
  progress: number;
  deadline: string;
  current_stage_name?: string | null;
  workflow_name?: string | null;
  industry?: string | null;
  country?: string | null;
  priority: ManagerApiPriority;
  owner: string;
  description?: string | null;
  workflow_id: string;
  current_stage_id?: string | null;
  outcome_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManagerApiRfqStats {
  total_rfqs_12m: number;
  open_rfqs: number;
  critical_rfqs: number;
  avg_cycle_days: number;
}

export interface ManagerApiRfqAnalyticsByClient {
  client: string;
  rfq_count: number;
  avg_margin: number;
}

export interface ManagerApiRfqAnalytics {
  avg_margin_submitted: number;
  avg_margin_awarded: number;
  estimation_accuracy: number;
  win_rate: number;
  by_client: ManagerApiRfqAnalyticsByClient[];
}

export interface ManagerApiCreateRfqInput {
  name: string;
  client: string;
  deadline: string;
  owner: string;
  workflow_id: string;
  industry?: string;
  country?: string;
  priority: "normal" | "critical";
  description?: string;
}

export interface ManagerApiUpdateRfqInput {
  name?: string;
  client?: string;
  industry?: string;
  country?: string;
  priority?: "normal" | "critical";
  deadline?: string;
  owner?: string;
  description?: string;
  status?: ManagerApiRfqStatus;
  outcome_reason?: string;
}
