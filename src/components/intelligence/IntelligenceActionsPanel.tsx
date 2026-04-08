"use client";

import { useState } from "react";
import { ArrowRight, FilePlus2, RefreshCw, RotateCw, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RolePermissions } from "@/config/role-permissions";
import type { ReprocessKind } from "@/models/intelligence/artifacts";
import type { IntelligenceLifecycleTriggerResult } from "@/models/intelligence/triggers";
import type { ManagerRfqStatus } from "@/models/manager/rfq";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatTriggerMessage(result: IntelligenceLifecycleTriggerResult) {
  const artifacts = result.artifacts
    ? Object.entries(result.artifacts)
        .map(([key, value]) =>
          value?.status ? `${key.replaceAll("_", " ")}: ${value.status}` : null,
        )
        .filter(Boolean)
    : [];

  const base = result.status.replaceAll("_", " ");
  return artifacts.length > 0 ? `${base}. ${artifacts.join(" · ")}` : base;
}

function mapStatusToOutcome(status: ManagerRfqStatus) {
  if (status === "awarded" || status === "lost" || status === "cancelled") {
    return status;
  }

  return null;
}

export function IntelligenceActionsPanel({
  onRefresh,
  onReprocess,
  onTriggerIntake,
  onTriggerOutcome,
  onTriggerWorkbook,
  permissions,
  rfqOutcomeReason,
  rfqStatus,
}: {
  onRefresh: () => void;
  onReprocess: (kind: ReprocessKind) => Promise<{ message: string }>;
  onTriggerIntake: () => Promise<IntelligenceLifecycleTriggerResult>;
  onTriggerOutcome: (input: {
    outcome: "awarded" | "lost" | "cancelled";
    outcomeReason?: string;
  }) => Promise<IntelligenceLifecycleTriggerResult>;
  onTriggerWorkbook: () => Promise<IntelligenceLifecycleTriggerResult>;
  permissions: RolePermissions;
  rfqOutcomeReason?: string;
  rfqStatus: ManagerRfqStatus;
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const terminalOutcome = mapStatusToOutcome(rfqStatus);
  const canTrigger = permissions.canTriggerIntelligence;

  async function runAction<T>(
    key: string,
    task: () => Promise<T>,
    formatMessage: (result: T) => string,
  ) {
    setBusyAction(key);
    setError("");
    setMessage("");

    try {
      const result = await task();
      setMessage(formatMessage(result));
      return result;
    } catch (actionError) {
      setError(
        getErrorMessage(
          actionError,
          "The intelligence action could not be completed.",
        ),
      );
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {canTrigger ? (
        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Intelligence Triggers
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Trigger the supported intelligence flows directly from the app. This bridges the current event-bus gap without leaving the UI.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={busyAction === "trigger-intake"}
                onClick={() =>
                  void runAction("trigger-intake", onTriggerIntake, formatTriggerMessage)
                }
                size="sm"
                variant="secondary"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Trigger Intake
              </Button>
              <Button
                disabled={busyAction === "trigger-workbook"}
                onClick={() =>
                  void runAction("trigger-workbook", onTriggerWorkbook, formatTriggerMessage)
                }
                size="sm"
                variant="secondary"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                Trigger Workbook
              </Button>
              <Button
                disabled={!terminalOutcome || busyAction === "trigger-outcome"}
                onClick={() =>
                  terminalOutcome
                    ? void runAction(
                        "trigger-outcome",
                        () =>
                          onTriggerOutcome({
                            outcome: terminalOutcome,
                            outcomeReason: rfqOutcomeReason,
                          }),
                        formatTriggerMessage,
                      )
                    : undefined
                }
                size="sm"
                variant="secondary"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Trigger Outcome
              </Button>
              <Button onClick={onRefresh} size="sm" variant="ghost">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {permissions.canReprocessArtifacts ? (
        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Reprocess Actions
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Confirmed reprocess routes remain available here. The richer orchestration actions are above.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={busyAction === "reprocess:intake"}
                onClick={() =>
                  void runAction("reprocess:intake", () => onReprocess("intake"), (result) => result.message)
                }
                size="sm"
                variant="secondary"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Reprocess Intake
              </Button>
              <Button
                disabled={busyAction === "reprocess:workbook"}
                onClick={() =>
                  void runAction("reprocess:workbook", () => onReprocess("workbook"), (result) => result.message)
                }
                size="sm"
                variant="secondary"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Reprocess Workbook
              </Button>
              <Badge variant="steel">Status: {rfqStatus.replaceAll("_", " ")}</Badge>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
