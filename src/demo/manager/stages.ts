import type {
  ManagerStageStatusResponse,
  ManagerStageTemplateResponse,
} from "@/models/manager/stage";

export const standardWorkflowStages: ManagerStageTemplateResponse[] = [
  {
    id: "intake",
    label: "Intake",
    order: 1,
    summary: "Scope registration and RFQ intake alignment.",
    ownerRole: "shared",
  },
  {
    id: "qualification",
    label: "Qualification",
    order: 2,
    summary: "Commercial fit and risk qualification.",
    ownerRole: "manager",
  },
  {
    id: "pricing",
    label: "Pricing",
    order: 3,
    summary: "Workbook pricing preparation and supplier checks.",
    ownerRole: "estimator",
  },
  {
    id: "review",
    label: "Review",
    order: 4,
    summary: "Cross-functional review and intelligence validation.",
    ownerRole: "shared",
  },
  {
    id: "submission",
    label: "Submission",
    order: 5,
    summary: "Final package submission and delivery confirmation.",
    ownerRole: "manager",
  },
  {
    id: "award",
    label: "Award",
    order: 6,
    summary: "Outcome tracking and closing brief.",
    ownerRole: "manager",
  },
];

export const rapidWorkflowStages: ManagerStageTemplateResponse[] = [
  {
    id: "intake",
    label: "Intake",
    order: 1,
    summary: "Rapid response registration.",
    ownerRole: "shared",
  },
  {
    id: "scope-scan",
    label: "Scope Scan",
    order: 2,
    summary: "Fast package parsing and feasibility scan.",
    ownerRole: "estimator",
  },
  {
    id: "pricing",
    label: "Pricing",
    order: 3,
    summary: "Commercial workbook response drafting.",
    ownerRole: "estimator",
  },
  {
    id: "approval",
    label: "Approval",
    order: 4,
    summary: "Internal approval checkpoint.",
    ownerRole: "manager",
  },
  {
    id: "submission",
    label: "Submission",
    order: 5,
    summary: "Rapid submission window execution.",
    ownerRole: "manager",
  },
];

export const strategicWorkflowStages: ManagerStageTemplateResponse[] = [
  {
    id: "intake",
    label: "Intake",
    order: 1,
    summary: "Strategic intake and sponsor alignment.",
    ownerRole: "shared",
  },
  {
    id: "qualification",
    label: "Qualification",
    order: 2,
    summary: "Fit scoring and initial commercial gate.",
    ownerRole: "manager",
  },
  {
    id: "package-analysis",
    label: "Package Analysis",
    order: 3,
    summary: "Deep package parsing and artifact preparation.",
    ownerRole: "estimator",
  },
  {
    id: "pricing",
    label: "Pricing",
    order: 4,
    summary: "Workbook construction and vendor checks.",
    ownerRole: "estimator",
  },
  {
    id: "technical-review",
    label: "Technical Review",
    order: 5,
    summary: "Engineering and intelligence review loop.",
    ownerRole: "shared",
  },
  {
    id: "submission",
    label: "Submission",
    order: 6,
    summary: "Submission preparation and risk finalization.",
    ownerRole: "manager",
  },
  {
    id: "award",
    label: "Award",
    order: 7,
    summary: "Award capture and closeout intelligence.",
    ownerRole: "manager",
  },
];

export function buildStageHistory(
  stages: ManagerStageTemplateResponse[],
  activeStageId: string,
  activeTimestamp?: string,
  blockedStageIds: string[] = [],
): ManagerStageStatusResponse[] {
  const activeOrder =
    stages.find((stage) => stage.id === activeStageId)?.order ?? stages.length;

  return stages.map((stage) => {
    if (blockedStageIds.includes(stage.id)) {
      return {
        ...stage,
        state: "blocked",
        timestamp: stage.id === activeStageId ? activeTimestamp : undefined,
      };
    }

    if (stage.id === activeStageId) {
      return {
        ...stage,
        state: "active",
        timestamp: activeTimestamp,
      };
    }

    return {
      ...stage,
      state: stage.order < activeOrder ? "completed" : "upcoming",
    };
  });
}
