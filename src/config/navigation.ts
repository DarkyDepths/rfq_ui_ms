import type { AppRole } from "@/models/ui/role";

export type NavigationIcon =
  | "layout-dashboard"
  | "bar-chart"
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
    title: "Dashboard",
    href: "/dashboard",
    description: "Executive intelligence and pursuit analytics.",
    icon: "bar-chart",
    roles: ["executive", "manager"],
    match: "exact",
  },
  {
    title: "Overview",
    href: "/overview",
    description: "Portfolio health, throughput, and intelligence posture.",
    icon: "layout-dashboard",
    roles: ["manager", "estimator"],
    match: "exact",
  },
  {
    title: "RFQ Queue",
    href: "/rfqs",
    description: "Operational RFQ list with lifecycle and status visibility.",
    icon: "files",
    roles: ["manager", "estimator"],
    match: "prefix",
  },
  {
    title: "Create RFQ",
    href: "/rfqs/new",
    description: "Workflow-based intake shell for new RFQ creation.",
    icon: "plus-square",
    roles: ["manager", "estimator"],
    match: "exact",
    highlight: true,
  },
  {
    title: "Featured Detail",
    href: "/rfqs/RFQ-2026-0142",
    description: "Fast path to the strongest complete intelligence demo state.",
    icon: "radar",
    roles: ["manager", "estimator"],
    match: "exact",
  },
];
