"use client";

import { FileStack, RotateCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ArtifactModel } from "@/models/intelligence/artifacts";
import { intelligenceStatusMeta } from "@/utils/status";
import { cn } from "@/lib/utils";

const accentMap: Record<ArtifactModel["accent"], string> = {
  steel: "from-steel-500/18 to-transparent",
  gold: "from-gold-500/18 to-transparent",
  emerald: "from-emerald-500/18 to-transparent",
  rose: "from-rose-500/18 to-transparent",
};

export function ArtifactCard({
  artifact,
  allowReprocess,
  onReprocess,
}: {
  artifact: ArtifactModel;
  allowReprocess?: boolean;
  onReprocess?: (kind: ArtifactModel["kind"]) => void;
}) {
  const statusMeta = intelligenceStatusMeta[artifact.status];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.38 }}
      className="surface-panel surface-panel-hover p-5"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
          accentMap[artifact.accent],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            {artifact.kind === "snapshot" ? (
              <Sparkles className="h-5 w-5 text-gold-300" />
            ) : (
              <FileStack className="h-5 w-5 text-steel-300" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {artifact.kind.replaceAll("_", " ")}
            </div>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {artifact.title}
            </h3>
          </div>
        </div>
        <Badge variant={statusMeta.tone}>{statusMeta.label}</Badge>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-muted">
        {artifact.summary}
      </p>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Badge variant="default">{artifact.version}</Badge>
        <Badge variant="default">{artifact.updatedLabel}</Badge>
        <Badge variant="default">{artifact.owner}</Badge>
      </div>

      {allowReprocess ? (
        <div className="relative mt-5">
          <Button
            onClick={() => onReprocess?.(artifact.kind)}
            size="sm"
            variant="secondary"
          >
            <RotateCw className="h-4 w-4" />
            Reprocess
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
