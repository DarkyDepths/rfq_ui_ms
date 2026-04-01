"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ClipboardPlus, Sparkles } from "lucide-react";

import { UploadZone } from "@/components/common/UploadZone";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRfqDraft } from "@/connectors/manager/rfqs";
import { listWorkflows } from "@/connectors/manager/workflows";
import { useRole } from "@/context/role-context";
import type { PriorityLevel } from "@/models/manager/rfq";
import type { WorkflowModel } from "@/models/manager/workflow";

const priorities: PriorityLevel[] = ["normal", "high", "critical"];

export function RFQCreateScreen() {
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowModel[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [title, setTitle] = useState("Structured Power Redundancy Upgrade");
  const [client, setClient] = useState("GHI Strategic Systems");
  const [valueSar, setValueSar] = useState("12400000");
  const [dueDate, setDueDate] = useState("2026-04-22");
  const [priority, setPriority] = useState<PriorityLevel>("high");
  const [summaryLine, setSummaryLine] = useState(
    "High-value package requiring synchronized operational control and intelligence visibility from intake onward.",
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const workflowOptions = await listWorkflows();

      if (!active) {
        return;
      }

      setWorkflows(workflowOptions);
      setSelectedWorkflowId(workflowOptions[0]?.id ?? "");
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const selectedWorkflow = workflows.find(
    (workflow) => workflow.id === selectedWorkflowId,
  );

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (role !== "manager" || !selectedWorkflow) {
      return;
    }

    setSaving(true);
    const result = await createRfqDraft({
      title,
      client,
      workflowId: selectedWorkflow.id,
      valueSar: Number(valueSar),
      dueDate,
      priority,
      summaryLine,
    });
    setSaving(false);
    setSaveMessage(result.message);
  };

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SkeletonCard className="h-[620px]" lines={10} />
        <SkeletonCard className="h-[620px]" lines={10} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <form className="surface-panel p-6" onSubmit={handleSave}>
        <div className="section-kicker">
          <ClipboardPlus className="h-3.5 w-3.5" />
          Create RFQ shell
        </div>
        <h1 className="mt-5 text-display text-4xl font-semibold text-foreground">
          Stage a new RFQ draft through the manager-owned intake path
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The frontend keeps creation on the manager boundary and prepares the intelligence service for downstream artifact generation without embedding backend workflow logic in the UI.
        </p>

        <AnimatePresence>
          {saveMessage ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {saveMessage}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {role !== "manager" ? (
          <div className="mt-5 rounded-2xl border border-gold-500/20 bg-gold-500/10 p-4 text-sm leading-relaxed text-gold-100">
            Worker view keeps create access visible for the defense demo, but the action stays manager-owned. Switch to the manager role to stage a draft.
          </div>
        ) : null}

        <div className="mt-6 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfq-title">RFQ Title</Label>
              <Input
                id="rfq-title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfq-client">Client</Label>
              <Input
                id="rfq-client"
                onChange={(event) => setClient(event.target.value)}
                value={client}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfq-value">Estimated Value (SAR)</Label>
              <Input
                id="rfq-value"
                onChange={(event) => setValueSar(event.target.value)}
                type="number"
                value={valueSar}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfq-due-date">Due Date</Label>
              <Input
                id="rfq-due-date"
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                value={dueDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((option) => (
                <Button
                  key={option}
                  onClick={() => setPriority(option)}
                  type="button"
                  variant={priority === option ? "outline" : "secondary"}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-summary">Operational Summary</Label>
            <Textarea
              id="rfq-summary"
              onChange={(event) => setSummaryLine(event.target.value)}
              value={summaryLine}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={saving || role !== "manager"} size="lg" type="submit">
            {saving ? "Staging Draft..." : "Stage Draft RFQ"}
          </Button>
          <Button size="lg" type="button" variant="secondary">
            Demo Validation Notes
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="surface-panel p-6">
          <div className="section-kicker">
            <Sparkles className="h-3.5 w-3.5" />
            Workflow selection
          </div>
          <h2 className="mt-4 text-display text-2xl font-semibold text-foreground">
            Choose the manager workflow shell
          </h2>
          <div className="mt-5 space-y-3">
            {workflows.map((workflow) => (
              <button
                key={workflow.id}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  workflow.id === selectedWorkflowId
                    ? "border-steel-500/35 bg-steel-500/12"
                    : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
                onClick={() => setSelectedWorkflowId(workflow.id)}
                type="button"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {workflow.name}
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {workflow.description}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted">
                    {workflow.turnaroundDays} days • {workflow.stageCount} stages
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted">
                  Recommended for: {workflow.recommendedUse}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Stage preview
          </h3>
          <p className="mt-2 text-sm text-muted">
            The selected workflow determines lifecycle visibility in the manager domain and the points where intelligence artifacts become operationally relevant.
          </p>
          <div className="mt-5 space-y-3">
            {selectedWorkflow?.stages.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-foreground">{stage.label}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted">
                    {stage.ownerRole}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted">{stage.summary}</div>
              </div>
            ))}
          </div>
        </div>

        <UploadZone
          description="Optional starting package drop for the demo shell. A real manager create flow can later hand off package intake to the intelligence service."
          initialStatus="missing"
          title="Optional Package ZIP"
        />
        <UploadZone
          description="Optional workbook upload to prepare the downstream workbook profile and review boundary once the RFQ exists."
          initialStatus="missing"
          title="Optional Workbook"
        />
      </div>
    </div>
  );
}
