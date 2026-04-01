import { AlertTriangle, LoaderCircle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProcessingState } from "@/models/intelligence/snapshot";

const stateMeta: Record<
  ProcessingState,
  {
    icon: typeof Sparkles;
    badge: "steel" | "gold" | "emerald" | "rose" | "pending";
    title: string;
    description: string;
  }
> = {
  pending: {
    icon: LoaderCircle,
    badge: "pending",
    title: "Awaiting Processing",
    description: "Intelligence artifacts have not yet been generated for this RFQ.",
  },
  partial: {
    icon: Sparkles,
    badge: "gold",
    title: "Partial Intelligence",
    description: "Some artifacts are available. Processing continues for remaining items.",
  },
  complete: {
    icon: Sparkles,
    badge: "emerald",
    title: "Complete Intelligence",
    description: "All intelligence artifacts have been generated and aligned.",
  },
  failed: {
    icon: AlertTriangle,
    badge: "rose",
    title: "Processing Failed",
    description: "One or more intelligence stages failed and require intervention.",
  },
};

export function PartialIntelligenceState({
  state,
  summary,
  actions,
}: {
  state: ProcessingState;
  summary: string;
  actions: string[];
}) {
  const meta = stateMeta[state];
  const Icon = meta.icon;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 dark:bg-white/[0.03]">
          <Icon
            className={`h-5 w-5 ${
              state === "pending" ? "animate-spin text-muted-foreground" : ""
            } ${state === "complete" ? "text-emerald-500" : ""} ${
              state === "failed" ? "text-rose-500" : ""
            } ${state === "partial" ? "text-amber-500 dark:text-gold-300" : ""}`}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {meta.title}
            </h3>
            <Badge variant={meta.badge}>{state}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>

      {actions.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {actions.map((action) => (
            <div key={action} className="stat-cell text-sm text-muted-foreground">
              {action}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
