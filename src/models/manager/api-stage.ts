export interface ManagerApiStageSummary {
  id: string;
  name: string;
  order: number;
  assigned_team?: string | null;
  status: string;
  progress: number;
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  blocker_status?: string | null;
  blocker_reason_code?: string | null;
}

export interface ManagerApiStageListResponse {
  data: ManagerApiStageSummary[];
}

export interface ManagerApiStageNote {
  id: string;
  user_name: string;
  text: string;
  created_at: string;
}

export interface ManagerApiStageFile {
  id: string;
  filename: string;
  download_url: string;
  type: string;
  uploaded_by: string;
  size_bytes?: number | null;
  uploaded_at: string;
}

export interface ManagerApiStageSubtask {
  id: string;
  name: string;
  assigned_to?: string | null;
  due_date?: string | null;
  progress: number;
  status: string;
  created_at: string;
}

export interface ManagerApiStageDetail extends ManagerApiStageSummary {
  captured_data?: Record<string, unknown> | null;
  mandatory_fields?: string | null;
  notes: ManagerApiStageNote[];
  files: ManagerApiStageFile[];
  subtasks: ManagerApiStageSubtask[];
}
