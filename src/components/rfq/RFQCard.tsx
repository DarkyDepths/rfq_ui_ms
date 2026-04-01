import Link from "next/link";
import { ArrowUpRight, Building2, MapPinned, User2 } from "lucide-react";
import { motion } from "framer-motion";

import { RFQStageTimeline } from "@/components/rfq/RFQStageTimeline";
import { RFQStatusChip } from "@/components/rfq/RFQStatusChip";
import { Badge } from "@/components/ui/badge";
import type { RfqCardModel } from "@/models/manager/rfq";

export function RFQCard({
  rfq,
  index = 0,
}: {
  rfq: RfqCardModel;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link className="block" href={`/rfqs/${rfq.id}`}>
        <div className="surface-panel surface-panel-hover p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {rfq.id}
              </div>
              <h3 className="mt-1 text-xl font-semibold text-foreground">
                {rfq.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <RFQStatusChip status={rfq.status} />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {rfq.summaryLine}
          </p>

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gold-500" />
              <span className="truncate">{rfq.client}</span>
            </div>
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-steel-500" />
              <span className="truncate">{rfq.owner}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-emerald-500" />
              <span className="truncate">{rfq.region}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="steel" className="opacity-80 border-transparent">
              Intel: {rfq.intelligenceState}
            </Badge>
            {rfq.tags.map((tag) => (
              <Badge key={`${rfq.id}-${tag}`} variant="default">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 dark:bg-white/[0.02]">
            <div className="mb-2 flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>{rfq.stageLabel}</span>
              <span className="font-mono">{rfq.stageProgress}%</span>
            </div>
            <RFQStageTimeline compact stages={rfq.stageHistory} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Bid Value
              </div>
              <div className="mt-0.5 font-mono text-base font-medium text-foreground">
                {rfq.valueLabel}
              </div>
            </div>
            <div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Due Date
              </div>
              <div className="mt-0.5 font-mono text-base font-medium text-foreground">
                {rfq.dueLabel}
              </div>
            </div>
            <div className="max-w-[12rem] text-right text-sm font-medium text-primary">
              {rfq.nextAction}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
