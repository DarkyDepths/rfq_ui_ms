"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import type { KPIMetricModel } from "@/models/ui/dashboard";
import { cn } from "@/lib/utils";

const toneStyles: Record<KPIMetricModel["tone"], string> = {
  steel: "from-steel-500/18 to-transparent text-steel-300",
  gold: "from-gold-500/18 to-transparent text-gold-300",
  emerald: "from-emerald-500/18 to-transparent text-emerald-300",
  amber: "from-amber-500/18 to-transparent text-amber-300",
};

function TrendIcon({
  direction,
}: {
  direction: KPIMetricModel["trendDirection"];
}) {
  if (direction === "up") {
    return <ArrowUpRight className="h-4 w-4" />;
  }

  if (direction === "down") {
    return <ArrowDownRight className="h-4 w-4" />;
  }

  return <ArrowRight className="h-4 w-4" />;
}

export function KPICard({
  metric,
  index = 0,
}: {
  metric: KPIMetricModel;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <Card className="surface-panel-hover h-full">
        <CardContent className="relative overflow-hidden p-5">
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
              toneStyles[metric.tone],
            )}
          />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {metric.label}
            </div>
            <div className="mt-4 text-display text-4xl font-semibold tracking-[-0.04em]">
              {metric.value}
            </div>
            <p className="mt-2 text-sm text-muted">{metric.helper}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-foreground">
              <TrendIcon direction={metric.trendDirection} />
              {metric.trendLabel}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
