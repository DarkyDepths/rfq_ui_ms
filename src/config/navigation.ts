import type { AppRole } from "@/models/ui/role";

export type NavigationIcon =
  | "layout-dashboard"
  | "files"
  | "plus-square"
  | "radar"
  | "folder-kanban";

export interface NavigationItem {
  title: string;
  href: string;
  description: string;
  icon: NavigationIcon;
  roles?: AppRole[];
  match?: "exact" | "prefix";
  highlight?: boolean;
}

export const primaryNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/overview",
    description: "Portfolio health, throughput, and intelligence posture.",
    icon: "layout-dashboard",
    roles: ["manager", "worker"],
    match: "exact",
  },
  {
    title: "RFQ Queue",
    href: "/rfqs",
    description: "Operational RFQ list with lifecycle and status visibility.",
    icon: "files",
    roles: ["manager", "worker"],
    match: "prefix",
  },
  {
    title: "Create RFQ",
    href: "/rfqs/new",
    description: "Workflow-based intake shell for new RFQ creation.",
    icon: "plus-square",
    roles: ["manager"],
    match: "exact",
    highlight: true,
  },
  {
    title: "Featured Detail",
    href: "/rfqs/RFQ-2026-0142",
    description: "Fast path to the strongest complete intelligence demo state.",
    icon: "radar",
    roles: ["manager", "worker"],
    match: "exact",
  },
];
