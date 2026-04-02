"use client";

import { usePathname } from "next/navigation";

import type { BreadcrumbItem } from "@/models/ui/dashboard";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  overview: "Overview",
  rfqs: "RFQ Queue",
  new: "Create RFQ",
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Overview", href: "/overview", isCurrent: true }];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentHref = "";

  segments.forEach((segment, index) => {
    currentHref += `/${segment}`;
    breadcrumbs.push({
      label: LABELS[segment] ?? segment.replace(/-/g, " ").toUpperCase(),
      href: currentHref,
      isCurrent: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}
