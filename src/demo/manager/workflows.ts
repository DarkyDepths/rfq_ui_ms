import type { ManagerWorkflowResponse } from "@/models/manager/workflow";

import {
  rapidWorkflowStages,
  standardWorkflowStages,
  strategicWorkflowStages,
} from "@/demo/manager/stages";

export const managerWorkflowResponses: ManagerWorkflowResponse[] = [
  {
    id: "workflow-standard",
    name: "Standard Bid Lifecycle",
    description:
      "Balanced workflow for regular RFQs with commercial and intelligence checkpoints.",
    recommendedUse: "General industrial and infrastructure RFQs.",
    turnaroundDays: 9,
    stages: standardWorkflowStages,
  },
  {
    id: "workflow-rapid",
    name: "Rapid Turnaround Response",
    description:
      "Compressed intake-to-submission path for short-response tenders and re-bids.",
    recommendedUse: "Urgent addenda, quick-turn bids, and limited-scope packages.",
    turnaroundDays: 4,
    stages: rapidWorkflowStages,
  },
  {
    id: "workflow-strategic",
    name: "Strategic Programs Review",
    description:
      "Expanded intelligence and technical review for high-value, defense-adjacent programs.",
    recommendedUse: "Large multi-lot programs with engineering and executive gates.",
    turnaroundDays: 14,
    stages: strategicWorkflowStages,
  },
];
