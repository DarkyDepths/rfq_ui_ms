export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface KPIMetricModel {
  id: string;
  label: string;
  value: string;
  helper: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "steady";
  tone: "steel" | "gold" | "emerald" | "amber";
}

export interface IntelligencePortfolioModel {
  completeCount: number;
  partialCount: number;
  failedCount: number;
  readinessAverage: number;
  narrative: string;
  featuredRfqId: string;
}
