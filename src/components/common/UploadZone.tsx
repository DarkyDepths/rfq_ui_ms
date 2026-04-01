"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, UploadCloud, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

type UploadState = "ready" | "processing" | "missing" | "failed";

export function UploadZone({
  title,
  description,
  initialStatus,
  fileName,
  uploadedLabel,
}: {
  title: string;
  description: string;
  initialStatus: UploadState;
  fileName?: string;
  uploadedLabel?: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<UploadState>(initialStatus);
  const [currentFileName, setCurrentFileName] = useState(fileName);

  useEffect(() => {
    setStatus(initialStatus);
    setCurrentFileName(fileName);
  }, [fileName, initialStatus]);

  const triggerUpload = () => {
    setStatus("processing");
    setCurrentFileName("demo_refresh_upload.zip");

    window.setTimeout(() => {
      setStatus("ready");
    }, appConfig.timings.uploadTransitionMs);
  };

  const statusBadge =
    status === "ready" ? (
      <Badge variant="emerald">Ready</Badge>
    ) : status === "processing" ? (
      <Badge variant="steel">Processing</Badge>
    ) : status === "failed" ? (
      <Badge variant="rose">Failed</Badge>
    ) : (
      <Badge variant="pending">Awaiting Upload</Badge>
    );

  return (
    <motion.div
      animate={{
        scale: dragActive ? 1.01 : 1,
        borderColor: dragActive ? "rgba(74, 144, 217, 0.38)" : "rgba(255,255,255,0.08)",
      }}
      className={cn(
        "surface-panel surface-panel-hover border-dashed p-5",
        dragActive && "shadow-steel",
      )}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        triggerUpload();
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border",
              dragActive
                ? "animate-pulseRing border-steel-400/30 bg-steel-500/15"
                : "border-white/10 bg-white/[0.03]",
            )}
          >
            {status === "processing" ? (
              <LoaderCircle className="h-5 w-5 animate-spin text-steel-300" />
            ) : status === "failed" ? (
              <XCircle className="h-5 w-5 text-rose-300" />
            ) : status === "ready" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : (
              <UploadCloud className="h-5 w-5 text-gold-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {statusBadge}
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {description}
            </p>
            <div className="mt-3 text-xs text-muted">
              {currentFileName
                ? `${currentFileName}${uploadedLabel ? ` • ${uploadedLabel}` : ""}`
                : "Drag a file here or trigger a demo upload transition."}
            </div>
          </div>
        </div>

        <Button onClick={triggerUpload} variant="secondary">
          {status === "ready" ? "Refresh Demo Upload" : "Simulate Upload"}
        </Button>
      </div>
    </motion.div>
  );
}
