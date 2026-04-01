import type { ProcessingState } from "@/models/intelligence/snapshot";

export type ArtifactKind =
  | "briefing"
  | "workbook_profile"
  | "workbook_review"
  | "snapshot";

export type ArtifactStatus = ProcessingState | "not_uploaded";

export interface ArtifactResponse {
  id: string;
  rfqId: string;
  kind: ArtifactKind;
  title: string;
  version: string;
  status: ArtifactStatus;
  updatedAt?: string;
  summary: string;
  owner: string;
}

export interface ArtifactModel {
  id: string;
  kind: ArtifactKind;
  title: string;
  version: string;
  status: ArtifactStatus;
  updatedLabel: string;
  summary: string;
  owner: string;
  accent: "steel" | "gold" | "emerald" | "rose";
}

export interface ReprocessResult {
  rfqId: string;
  kind: ArtifactKind;
  accepted: boolean;
  message: string;
}
