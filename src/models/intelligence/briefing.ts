import type { ProcessingState } from "@/models/intelligence/snapshot";

export interface BriefingResponse {
  rfqId: string;
  status: ProcessingState;
  version: string;
  updatedAt?: string;
  executiveSummary: string;
  strategicSignals: string[];
  openQuestions: string[];
  recommendation: string;
}

export interface BriefingArtifactModel {
  kind: "briefing";
  title: string;
  status: ProcessingState;
  version: string;
  updatedLabel: string;
  summary: string;
  keySignals: string[];
  openQuestions: string[];
  recommendation: string;
}
