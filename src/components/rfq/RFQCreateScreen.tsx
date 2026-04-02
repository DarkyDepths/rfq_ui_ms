"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ClipboardPlus, Sparkles } from "lucide-react";

import { SkeletonCard } from "@/components/common/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiConfig } from "@/config/api";
import { createRfqDraft } from "@/connectors/manager/rfqs";
import { listWorkflows } from "@/connectors/manager/workflows";
import { getPermissions } from "@/config/role-permissions";
import { useRole } from "@/context/role-context";
import type { WorkflowModel } from "@/models/manager/workflow";

const priorities = ["normal", "critical"] as const;

export function RFQCreateScreen() {
  const { role } = useRole();
  const permissions = getPermissions(role);
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowModel[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [title, setTitle] = useState("Structured Power Redundancy Upgrade");
  const [client, setClient] = useState("GHI Strategic Systems");
  const [owner, setOwner] = useState("Proposals Team A");
  const [valueSar, setValueSar] = useState("12400000");
  const [dueDate, setDueDate] = useState("2026-04-22");
  const [priority, setPriority] = useState<(typeof priorities)[number]>("critical");
  const [description, setDescription] = useState(
    "High-value package requiring synchronized operational control and intelligence visibility from intake onward.",
  );
  const [industry, setIndustry] = useState("Industrial Systems");
  const [country, setCountry] = useState("Saudi Arabia");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const workflowOptions = await listWorkflows();

        if (!active) {
          return;
        }

        setWorkflows(workflowOptions);
        setSelectedWorkflowId(workflowOptions[0]?.id ?? "");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
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

    if (!permissions.canCreateRfq || !selectedWorkflow) {
      return;
    }

    setErrorMessage("");
    setSaveMessage("");
    setSaving(true);

    try {
      const result = await createRfqDraft({
        client,
        country,
        deadline: dueDate,
        description,
        industry,
        name: title,
        owner,
        priority,
        workflowId: selectedWorkflow.id,
      });

      setSaveMessage(result.message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "RFQ creation failed.",
      );
    } finally {
      setSaving(false);
    }
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
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <form className="surface-panel p-8" onSubmit={handleSave}>
        <div className="section-kicker">
          <ClipboardPlus className="h-3.5 w-3.5" />
          Create RFQ shell
        </div>
        <h1 className="mt-4 text-display text-3xl font-semibold text-foreground lg:text-4xl">
          Stage a new RFQ draft through the manager path
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The frontend keeps creation on the manager boundary and does not invent unsupported live fields during submission.
        </p>

        <AnimatePresence>
          {saveMessage ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {saveMessage}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {errorMessage ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
            >
              <div className="text-sm font-medium text-rose-600 dark:text-rose-300">
                {errorMessage}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!permissions.canCreateRfq ? (
          <div className="mt-6 rounded-2xl border border-gold-500/25 bg-gold-500/10 p-4 text-sm leading-relaxed text-gold-700 dark:text-gold-200">
            Your role does not have permission to stage RFQ drafts. Switch to an operational role.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfq-owner">Owner</Label>
              <Input
                id="rfq-owner"
                onChange={(event) => setOwner(event.target.value)}
                value={owner}
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfq-industry">Industry</Label>
              <Input
                id="rfq-industry"
                onChange={(event) => setIndustry(event.target.value)}
                value={industry}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfq-country">Country</Label>
              <Input
                id="rfq-country"
                onChange={(event) => setCountry(event.target.value)}
                value={country}
              />
            </div>
          </div>

          {apiConfig.useMockData ? (
            <div className="space-y-2">
              <Label htmlFor="rfq-value">Demo Estimated Value (SAR)</Label>
              <Input
                id="rfq-value"
                onChange={(event) => setValueSar(event.target.value)}
                type="number"
                value={valueSar}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Priority Level</Label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((option) => (
                <Button
                  key={option}
                  className="capitalize"
                  onClick={() => setPriority(option)}
                  type="button"
                  variant={priority === option ? "default" : "secondary"}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-summary">Description</Label>
            <Textarea
              id="rfq-summary"
              className="h-24 resize-none"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button disabled={saving || !permissions.canCreateRfq} size="lg" type="submit">
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
            Workflow configuration
          </div>
          <h2 className="mt-3 text-xl font-semibold text-foreground">
            Select manager workflow shell
          </h2>
          <div className="mt-5 space-y-3">
            {workflows.map((workflow) => (
              <button
                key={workflow.id}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  workflow.id === selectedWorkflowId
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:bg-muted/40 dark:bg-white/[0.01] dark:hover:bg-white/[0.04]"
                }`}
                onClick={() => setSelectedWorkflowId(workflow.id)}
                type="button"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {workflow.name}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {workflow.description ?? "Manager workflow definition."}
                    </div>
                  </div>
                  <div className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground dark:bg-white/[0.04]">
                    {workflow.turnaroundDays ? `${workflow.turnaroundDays}d • ` : ""}
                    {workflow.stageCount}s
                  </div>
                </div>
                {workflow.recommendedUse || workflow.code ? (
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {workflow.recommendedUse ? "Use case" : "Code"}
                    </span>
                    : {workflow.recommendedUse ?? workflow.code}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6">
          <h3 className="text-base font-semibold text-foreground">
            Stage preview
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The workflow dictates lifecycle visibility and operational progression through the manager service.
          </p>
          <div className="mt-5 space-y-3 border-l border-border pl-4">
            {selectedWorkflow?.stages.map((stage) => (
              <div key={stage.id} className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-border" />
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{stage.label}</div>
                  <div className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {stage.assignedTeam ?? stage.ownerRole ?? "Unassigned"}
                  </div>
                </div>
                {stage.summary ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">{stage.summary}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
