"use client";

import { motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";

export function IntelligenceReadinessBar({
  readiness,
  confidence,
}: {
  readiness: number;
  confidence: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Readiness
          </div>
          <div className="mt-2 text-display text-3xl font-semibold text-foreground">
            {readiness}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Confidence
          </div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0.4, y: 10 }}
            className="mt-2 text-display text-3xl font-semibold text-steel-300"
          >
            {confidence}%
          </motion.div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Progress value={readiness} />
        <Progress className="opacity-65" value={confidence} />
      </div>
    </div>
  );
}
