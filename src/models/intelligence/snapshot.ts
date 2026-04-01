export type ProcessingState = "pending" | "partial" | "complete" | "failed";

export interface SnapshotFlagResponse {
  severity: "low" | "medium" | "high";
  label: string;
  detail: string;
}

export interface SnapshotResponse {
  rfqId: string;
  state: ProcessingState;
  intake: {
    status: ProcessingState;
    summary: string;
    sectionsDetected: number;
    lineItems: number;
    processedAt?: string;
    missing: string[];
  };
  briefing: {
    status: ProcessingState;
    summary: string;
    generatedAt?: string;
    strengths: string[];
    risks: string[];
  };
  workbook: {
    status: ProcessingState | "not_uploaded";
    uploadedAt?: string;
    reviewStatus: ProcessingState | "not_uploaded";
    pendingQuestions: string[];
  };
  quality: {
    summary: string;
    gaps: string[];
  };
  readiness: {
    score: number;
    confidence: number;
    blockers: string[];
  };
  reviewFlags: SnapshotFlagResponse[];
}

export interface IntelligencePortfolioResponse {
  completeCount: number;
  partialCount: number;
  failedCount: number;
  readinessAverage: number;
  narrative: string;
  featuredRfqId: string;
}

export interface SnapshotFlagModel extends SnapshotFlagResponse {}

export interface IntelligenceSnapshotModel {
  rfqId: string;
  state: ProcessingState;
  intakeStatusLabel: string;
  intakeSummary: string;
  intakeStats: string[];
  briefingStatusLabel: string;
  briefingSummary: string;
  briefingStrengths: string[];
  briefingRisks: string[];
  workbookStatusLabel: string;
  workbookSummary: string;
  readinessScore: number;
  confidenceScore: number;
  blockers: string[];
  gaps: string[];
  reviewFlags: SnapshotFlagModel[];
}
