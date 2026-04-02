import type {
  ArtifactKind,
  ArtifactStatus,
} from "@/models/intelligence/artifacts";
import type { ManagerRfqStatus } from "@/models/manager/rfq";

export const rfqStatusMeta: Record<
  ManagerRfqStatus,
  {
    label: string;
    tone: "steel" | "gold" | "emerald" | "rose" | "pending";
  }
> = {
  draft: {
    label: "Draft",
    tone: "pending",
  },
  in_preparation: {
    label: "In Preparation",
    tone: "pending",
  },
  under_review: {
    label: "Under Review",
    tone: "steel",
  },
  submitted: {
    label: "Submitted",
    tone: "steel",
  },
  awarded: {
    label: "Awarded",
    tone: "emerald",
  },
  lost: {
    label: "Lost",
    tone: "rose",
  },
  cancelled: {
    label: "Cancelled",
    tone: "rose",
  },
  attention_required: {
    label: "Partial / Warning",
    tone: "gold",
  },
};

export const intelligenceStatusMeta: Record<
  ArtifactStatus,
  {
    label: string;
    tone: "steel" | "gold" | "emerald" | "rose" | "pending";
  }
> = {
  pending: {
    label: "Pending",
    tone: "pending",
  },
  partial: {
    label: "Partial",
    tone: "gold",
  },
  complete: {
    label: "Complete",
    tone: "emerald",
  },
  failed: {
    label: "Failed",
    tone: "rose",
  },
  not_uploaded: {
    label: "No Workbook Yet",
    tone: "pending",
  },
};

export const artifactKindLabel: Record<ArtifactKind, string> = {
  briefing: "Briefing",
  workbook_profile: "Workbook Profile",
  workbook_review: "Workbook Review",
  snapshot: "Snapshot",
};

export function getAccentForArtifact(kind: ArtifactKind) {
  switch (kind) {
    case "briefing":
      return "gold";
    case "workbook_profile":
      return "steel";
    case "workbook_review":
      return "emerald";
    case "snapshot":
      return "rose";
    default:
      return "steel";
  }
}
