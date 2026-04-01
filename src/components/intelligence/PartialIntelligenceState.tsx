import { AlertTriangle, LoaderCircle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProcessingState } from "@/models/intelligence/snapshot";

const stateMeta: Record<
  ProcessingState,
  {
    icon: typeof Sparkles;
    badge: "steel" | "gold" | "emerald" | "rose" | "pending";
    title: string;
  }
> = {
  pending: {
    icon: LoaderCircle,
    badge: "pending",
    title: "Waiting for intelligence processing",
  },
  partial: {
    icon: Sparkles,
    badge: "gold",
    title: "Partial intelligence available",
  },
  complete: {
    icon: Sparkles,
    badge: "emerald",
    title: "Complete intelligence available",
  },
  failed: {
    icon: AlertTriangle,
    badge: "rose",
    title: "Processing needs intervention",
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
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Icon className="h-5 w-5 text-gold-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{meta.title}</h3>
            <Badge variant={meta.badge}>{meta.title}</Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <div
            key={action}
            className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-muted"
          >
            {action}
          </div>
        ))}
      </div>
    </div>
  );
}
