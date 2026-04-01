import type {
  ProcessingState,
  SnapshotFlagResponse,
} from "@/models/intelligence/snapshot";

export interface WorkbookProfileResponse {
  rfqId: string;
  status: ProcessingState | "not_uploaded";
  version: string;
  updatedAt?: string;
  completion: number;
  trackedSheets: string[];
  missingSections: string[];
  owner: string;
}

export interface WorkbookReviewResponse {
  rfqId: string;
  status: ProcessingState | "not_uploaded";
  version: string;
  updatedAt?: string;
  readiness: number;
  missingResponses: number;
  flags: SnapshotFlagResponse[];
}

export interface WorkbookProfileModel {
  kind: "workbook_profile";
  status: ProcessingState | "not_uploaded";
  version: string;
  updatedLabel: string;
  completion: number;
  trackedSheets: string[];
  missingSections: string[];
  owner: string;
}

export interface WorkbookReviewModel {
  kind: "workbook_review";
  status: ProcessingState | "not_uploaded";
  version: string;
  updatedLabel: string;
  readiness: number;
  missingResponses: number;
  flags: SnapshotFlagResponse[];
}
