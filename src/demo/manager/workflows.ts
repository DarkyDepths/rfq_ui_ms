import type { ManagerWorkflowResponse } from "@/models/manager/workflow";

import {
  ghiLongWorkflowStages,
  ghiShortWorkflowStages,
} from "@/demo/manager/stages";

export const managerWorkflowResponses: ManagerWorkflowResponse[] = [
  {
    id: "workflow-ghi-long",
    code: "GHI-LONG",
    name: "GHI long workflow",
    description:
      "Full GHI workflow spanning intake, technical preparation, submission, and outcome capture.",
    recommendedUse: "Use when the RFQ requires the complete GHI operational lifecycle.",
    turnaroundDays: 19,
    selectionMode: "fixed",
    baseWorkflowId: null,
    stages: ghiLongWorkflowStages,
  },
  {
    id: "workflow-ghi-short",
    code: "GHI-SHORT",
    name: "GHI short workflow",
    description:
      "Compressed GHI workflow with a mandatory Go / No-Go decision before estimation and submission.",
    recommendedUse: "Use for smaller or faster GHI pursuits that still require formal go/no-go control.",
    turnaroundDays: 11,
    selectionMode: "fixed",
    baseWorkflowId: null,
    stages: ghiShortWorkflowStages,
  },
  {
    id: "workflow-ghi-custom",
    code: "GHI-CUSTOM",
    name: "GHI customized workflow",
    description:
      "Custom GHI workflow based on the long catalog, with required core stages locked and optional stages chosen at create time.",
    recommendedUse: "Use when the RFQ needs a tailored subset of the long GHI lifecycle.",
    turnaroundDays: 19,
    selectionMode: "customizable",
    baseWorkflowId: "workflow-ghi-long",
    stages: ghiLongWorkflowStages,
  },
];
