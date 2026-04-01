import type { AppRole } from "@/models/ui/role";

/**
 * Manager vs Worker Visibility / Action Matrix
 *
 * ┌──────────────────────────────┬───────────┬───────────┐
 * │ Capability                   │ Manager   │ Worker    │
 * ├──────────────────────────────┼───────────┼───────────┤
 * │ Create RFQ                   │ ✅        │ ❌        │
 * │ View all RFQs (portfolio)    │ ✅        │ ❌        │
 * │ View assigned RFQs           │ ✅        │ ✅        │
 * │ Portfolio KPI section        │ ✅        │ ❌        │
 * │ Intelligence posture board   │ ✅        │ ❌        │
 * │ Advance RFQ stage            │ ✅        │ ❌        │
 * │ Reprocess artifacts          │ ✅        │ ❌        │
 * │ View intelligence detail     │ ✅        │ ✅ (read) │
 * │ View artifacts catalog       │ ✅        │ ✅ (read) │
 * │ Upload files                 │ ✅        │ ✅        │
 * │ View operational detail      │ ✅        │ ✅        │
 * │ View subtasks                │ ✅        │ ✅        │
 * │ Manage stage notes           │ ✅        │ ❌        │
 * └──────────────────────────────┴───────────┴───────────┘
 */

interface RolePermissions {
  canCreateRfq: boolean;
  canViewAllRfqs: boolean;
  canViewPortfolio: boolean;
  canReprocessArtifacts: boolean;
  canAdvanceStage: boolean;
  canManageStageNotes: boolean;
  canUploadFiles: boolean;
  canViewIntelligence: boolean;
  canViewArtifacts: boolean;
  overviewTitle: string;
  overviewSubtitle: string;
  detailTabs: readonly string[];
  primaryCta: { label: string; href: string } | null;
}

export const rolePermissions: Record<AppRole, RolePermissions> = {
  manager: {
    canCreateRfq: true,
    canViewAllRfqs: true,
    canViewPortfolio: true,
    canReprocessArtifacts: true,
    canAdvanceStage: true,
    canManageStageNotes: true,
    canUploadFiles: true,
    canViewIntelligence: true,
    canViewArtifacts: true,
    overviewTitle: "Portfolio Overview",
    overviewSubtitle:
      "RFQ lifecycle health, intelligence posture, and operational throughput.",
    detailTabs: ["operational", "intelligence", "artifacts"],
    primaryCta: { label: "Create RFQ", href: "/rfqs/new" },
  },
  worker: {
    canCreateRfq: false,
    canViewAllRfqs: false,
    canViewPortfolio: false,
    canReprocessArtifacts: false,
    canAdvanceStage: false,
    canManageStageNotes: false,
    canUploadFiles: true,
    canViewIntelligence: true,
    canViewArtifacts: true,
    overviewTitle: "My Assignments",
    overviewSubtitle:
      "Active RFQs assigned to you with pending actions and upload targets.",
    detailTabs: ["operational", "intelligence", "artifacts"],
    primaryCta: null,
  },
} as const;

export function getPermissions(role: AppRole): RolePermissions {
  return rolePermissions[role];
}
