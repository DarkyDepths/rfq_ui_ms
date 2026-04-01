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
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {rfq.id}
              </div>
              <h3 className="mt-2 text-display text-xl font-semibold text-foreground">
                {rfq.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <RFQStatusChip status={rfq.status} />
              <ArrowUpRight className="h-4 w-4 text-muted" />
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">{rfq.summaryLine}</p>

          <div className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gold-300" />
              {rfq.client}
            </div>
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-steel-300" />
              {rfq.owner}
            </div>
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-emerald-300" />
              {rfq.region}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {rfq.tags.map((tag) => (
              <Badge key={`${rfq.id}-${tag}`} variant="default">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
              <span>{rfq.stageLabel}</span>
              <span>{rfq.stageProgress}%</span>
            </div>
            <RFQStageTimeline compact stages={rfq.stageHistory} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">
                Bid Value
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {rfq.valueLabel}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">
                Due Date
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {rfq.dueLabel}
              </div>
            </div>
            <div className="max-w-xs text-right text-sm text-muted">
              {rfq.nextAction}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
