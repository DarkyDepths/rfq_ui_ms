"use client";

import { motion } from "framer-motion";

import type { StageProgressModel } from "@/models/manager/stage";
import { cn } from "@/lib/utils";

export function RFQStageTimeline({
  stages,
  compact = false,
}: {
  stages: StageProgressModel[];
  compact?: boolean;
}) {
  return (
    <div className={cn("flex w-full items-center gap-2", compact && "gap-1.5")}>
      {stages.map((stage) => {
        const isActive = stage.state === "active";
        const isBlocked = stage.state === "blocked";
        const isCompleted = stage.state === "completed";

        return (
          <div key={stage.id} className="flex min-w-0 flex-1 items-center gap-2">
            <motion.div
              animate={
                isActive
                  ? { scale: [1, 1.05, 1], opacity: [0.88, 1, 0.88] }
                  : { scale: 1, opacity: 1 }
              }
              transition={isActive ? { duration: 1.8, repeat: Number.POSITIVE_INFINITY } : undefined}
              className={cn(
                "relative flex h-9 flex-1 items-center rounded-xl border px-3 text-xs",
                isCompleted && "border-emerald-500/25 bg-emerald-500/12 text-emerald-200",
                isActive && "border-steel-500/30 bg-steel-500/14 text-steel-100",
                isBlocked && "border-rose-500/30 bg-rose-500/14 text-rose-200",
                !isCompleted && !isActive && !isBlocked && "border-white/8 bg-white/[0.03] text-muted",
              )}
            >
              <span className="truncate">{stage.label}</span>
              {isActive ? (
                <span className="ml-auto h-2 w-2 rounded-full bg-steel-300 shadow-[0_0_0_6px_rgba(74,144,217,0.14)]" />
              ) : null}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
