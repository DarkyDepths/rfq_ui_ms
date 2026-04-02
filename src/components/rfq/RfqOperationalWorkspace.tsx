"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BellRing,
  Download,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
  Upload,
} from "lucide-react";

import type { RolePermissions } from "@/config/role-permissions";
import { createReminder, processReminders, sendReminderTestEmail, updateReminderRule } from "@/connectors/manager/reminders";
import {
  addStageNote,
  advanceStage,
  createSubtask,
  deleteStageFile,
  deleteSubtask,
  updateStage,
  updateSubtask,
  uploadStageFile,
} from "@/connectors/manager/stages";
import { updateRfqRecord } from "@/connectors/manager/rfqs";
import { useRfqReminders } from "@/hooks/use-rfq-reminders";
import { useStageWorkspace } from "@/hooks/use-stage-workspace";
import type {
  ReminderCreateInput,
  RfqDetailModel,
  RfqSubtaskModel,
  SubtaskCreateInput,
  SubtaskUpdateInput,
  UpdateRfqInput,
} from "@/models/manager/rfq";
import type { StageUpdateInput } from "@/models/manager/stage";
import type { AppRole } from "@/models/ui/role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { UploadZone } from "@/components/common/UploadZone";

type CapturedFieldEntry = {
  key: string;
  value: string;
};

type SubtaskDraft = {
  assignedTo: string;
  dueDate: string;
  name: string;
  progress: string;
  status: "Open" | "In progress" | "Done";
};

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

const fileTypeOptions = [
  "Client RFQ",
  "Design report",
  "BOQ / BOM",
  "Estimation Workbook",
  "Other",
];

const teamOptions = [
  "Estimation",
  "Engineering",
  "Executive",
  "Commercial",
  "Procurement",
];

const reminderStatusTone: Record<
  string,
  "amber" | "emerald" | "pending" | "rose" | "steel"
> = {
  open: "pending",
  overdue: "rose",
  resolved: "emerald",
  sent: "steel",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function mapSubtaskStateToManagerStatus(
  state: RfqSubtaskModel["state"],
): "Open" | "In progress" | "Done" {
  switch (state) {
    case "done":
      return "Done";
    case "in_progress":
      return "In progress";
    default:
      return "Open";
  }
}

function buildCapturedFieldEntries(
  capturedData: Record<string, string>,
  mandatoryFields: string[],
): CapturedFieldEntry[] {
  const keys = Array.from(new Set([...mandatoryFields, ...Object.keys(capturedData)]));
  return keys.length > 0
    ? keys.map((key) => ({ key, value: capturedData[key] ?? "" }))
    : [{ key: "", value: "" }];
}

function buildCapturedData(entries: CapturedFieldEntry[]) {
  return entries.reduce<Record<string, string>>((accumulator, entry) => {
    const key = entry.key.trim();
    if (!key) {
      return accumulator;
    }
    accumulator[key] = entry.value;
    return accumulator;
  }, {});
}

export function RfqOperationalWorkspace({
  permissions,
  rfq,
  role,
  onRefreshRfq,
}: {
  permissions: RolePermissions;
  rfq: RfqDetailModel;
  role: AppRole;
  onRefreshRfq: () => void;
}) {
  const stageWorkspace = useStageWorkspace(rfq.id, rfq.currentStageId);
  const reminders = useRfqReminders(rfq.id);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [fileType, setFileType] = useState("Client RFQ");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedFields, setCapturedFields] = useState<CapturedFieldEntry[]>([
    { key: "", value: "" },
  ]);
  const [stageForm, setStageForm] = useState({
    assignedTeam: "",
    blockerReasonCode: "",
    blockerStatus: "" as "" | "Blocked" | "Resolved",
    progress: "0",
  });
  const [rfqForm, setRfqForm] = useState({
    client: "",
    deadline: "",
    description: "",
    outcomeReason: "",
    owner: "",
    priority: "normal" as "normal" | "critical",
    status: "in_preparation" as UpdateRfqInput["status"],
    title: "",
  });
  const [newSubtask, setNewSubtask] = useState({
    assignedTo: "",
    dueDate: "",
    name: "",
  });
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, SubtaskDraft>>({});
  const [reminderForm, setReminderForm] = useState({
    assignedTo: "",
    dueDate: "",
    message: "",
    type: "internal" as "internal" | "external",
  });

  useEffect(() => {
    setRfqForm({
      client: rfq.client,
      deadline: rfq.dueDateValue.slice(0, 10),
      description: rfq.description ?? "",
      outcomeReason: rfq.outcomeReason ?? "",
      owner: rfq.owner,
      priority: rfq.priority === "critical" ? "critical" : "normal",
      status: rfq.status,
      title: rfq.title,
    });
    setSubtaskDrafts(
      rfq.subtasks.reduce<Record<string, SubtaskDraft>>((accumulator, task) => {
        accumulator[task.id] = {
          assignedTo: task.owner === "Unassigned" ? "" : task.owner,
          dueDate: task.dueDateValue?.slice(0, 10) ?? "",
          name: task.label,
          progress: typeof task.progress === "number" ? `${task.progress}` : "0",
          status: mapSubtaskStateToManagerStatus(task.state),
        };
        return accumulator;
      }, {}),
    );
  }, [rfq]);

  useEffect(() => {
    if (!stageWorkspace.workspace) {
      setCapturedFields([{ key: "", value: "" }]);
      setStageForm({
        assignedTeam: "",
        blockerReasonCode: "",
        blockerStatus: "",
        progress: "0",
      });
      return;
    }

    setCapturedFields(
      buildCapturedFieldEntries(
        stageWorkspace.workspace.capturedData,
        stageWorkspace.workspace.mandatoryFields,
      ),
    );
    setStageForm({
      assignedTeam: stageWorkspace.workspace.assignedTeam ?? "",
      blockerReasonCode: stageWorkspace.workspace.blockerReasonCode ?? "",
      blockerStatus: stageWorkspace.workspace.blockerStatus ?? "",
      progress: `${stageWorkspace.workspace.progress ?? 0}`,
    });
  }, [stageWorkspace.workspace]);

  const currentStageId = rfq.currentStageId ?? undefined;
  const canManageWorkspace = role === "manager";
  const canManageSubtasks = role !== "executive";
  const canManageReminders = role === "manager";
  const canEditRfq = role === "manager";
  const currentActorTeam =
    stageForm.assignedTeam.trim() || stageWorkspace.workspace?.assignedTeam || undefined;
  const capturedData = buildCapturedData(capturedFields);
  const missingMandatoryFields = (stageWorkspace.workspace?.mandatoryFields ?? []).filter(
    (field) => !capturedData[field]?.trim(),
  );

  const refreshOperational = () => {
    onRefreshRfq();
    stageWorkspace.refresh();
    reminders.refresh();
  };

  async function runAction<T>(key: string, task: () => Promise<T>, successMessage: string) {
    setBusyAction(key);
    setError("");
    setMessage("");

    try {
      const result = await task();
      refreshOperational();
      setMessage(successMessage);
      return result;
    } catch (actionError) {
      setError(getErrorMessage(actionError, "The manager action could not be completed."));
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  const handleSaveStage = async () => {
    if (!currentStageId || !canManageWorkspace) {
      return;
    }

    const progress = rfq.subtasks.length > 0 ? undefined : Number.parseInt(stageForm.progress, 10);
    const stageInput: StageUpdateInput = {
      assignedTeam: stageForm.assignedTeam || undefined,
      blockerReasonCode: stageForm.blockerReasonCode || undefined,
      blockerStatus: stageForm.blockerStatus || undefined,
      capturedData,
      progress: Number.isFinite(progress) ? progress : undefined,
    };

    await runAction(
      "save-stage",
      () => updateStage(rfq.id, currentStageId, stageInput, { actorTeam: currentActorTeam }),
      "Current stage updated.",
    );
  };

  const handleAdvanceStage = async () => {
    if (!currentStageId || !permissions.canAdvanceStage) {
      return;
    }

    const response = await runAction(
      "advance-stage",
      () => advanceStage(rfq.id, currentStageId, { actorTeam: currentActorTeam }),
      "Stage advanced.",
    );

    if (response) {
      onRefreshRfq();
    }
  };

  const handleAddNote = async () => {
    if (!currentStageId || !permissions.canManageStageNotes || !noteText.trim()) {
      return;
    }

    const response = await runAction(
      "add-note",
      () => addStageNote(rfq.id, currentStageId, noteText.trim(), { actorTeam: currentActorTeam }),
      "Stage note added.",
    );

    if (response) {
      setNoteText("");
    }
  };

  const handleUploadFile = async () => {
    if (!currentStageId || !permissions.canUploadFiles || !selectedFile) {
      return;
    }

    const response = await runAction(
      "upload-file",
      () => uploadStageFile(rfq.id, currentStageId, selectedFile, fileType, { actorTeam: currentActorTeam }),
      `File uploaded as ${fileType}.`,
    );

    if (response) {
      setSelectedFile(null);
      setFileType("Client RFQ");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    await runAction(`delete-file:${fileId}`, () => deleteStageFile(fileId), "File deleted.");
  };

  const handleCreateSubtask = async () => {
    if (!currentStageId || !canManageSubtasks || !newSubtask.name.trim()) {
      return;
    }

    const input: SubtaskCreateInput = {
      assignedTo: newSubtask.assignedTo || undefined,
      dueDate: newSubtask.dueDate || undefined,
      name: newSubtask.name.trim(),
    };

    const response = await runAction(
      "create-subtask",
      () => createSubtask(rfq.id, currentStageId, input, { actorTeam: currentActorTeam }),
      "Subtask created.",
    );

    if (response !== null) {
      setNewSubtask({ assignedTo: "", dueDate: "", name: "" });
    }
  };

  const handleUpdateSubtask = async (subtaskId: string) => {
    if (!currentStageId || !canManageSubtasks) {
      return;
    }

    const draft = subtaskDrafts[subtaskId];
    if (!draft) {
      return;
    }

    const input: SubtaskUpdateInput = {
      assignedTo: draft.assignedTo || undefined,
      dueDate: draft.dueDate || undefined,
      name: draft.name,
      progress: Number.parseInt(draft.progress, 10),
      status: draft.status,
    };

    await runAction(
      `update-subtask:${subtaskId}`,
      () => updateSubtask(rfq.id, currentStageId, subtaskId, input, { actorTeam: currentActorTeam }),
      "Subtask updated.",
    );
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!currentStageId || !canManageSubtasks) {
      return;
    }

    await runAction(
      `delete-subtask:${subtaskId}`,
      () => deleteSubtask(rfq.id, currentStageId, subtaskId, { actorTeam: currentActorTeam }),
      "Subtask deleted.",
    );
  };

  const handleCreateReminder = async () => {
    if (!canManageReminders || !reminderForm.message.trim() || !reminderForm.dueDate) {
      return;
    }

    const input: ReminderCreateInput = {
      assignedTo: reminderForm.assignedTo || undefined,
      dueDate: reminderForm.dueDate,
      message: reminderForm.message.trim(),
      rfqId: rfq.id,
      rfqStageId: currentStageId,
      type: reminderForm.type,
    };

    const response = await runAction("create-reminder", () => createReminder(input), "Reminder created.");

    if (response !== null) {
      setReminderForm({ assignedTo: "", dueDate: "", message: "", type: "internal" });
    }
  };

  const handleProcessReminders = async () => {
    const response = await runAction("process-reminders", () => processReminders(), "Reminder batch processed.");
    if (typeof response === "string") {
      setMessage(response);
    }
  };

  const handleReminderTest = async () => {
    const response = await runAction("test-reminder-email", () => sendReminderTestEmail(), "Reminder test completed.");
    if (typeof response === "string") {
      setMessage(response);
    }
  };

  const handleToggleReminderRule = async (ruleId: string, isActive: boolean) => {
    await runAction(
      `toggle-rule:${ruleId}`,
      () => updateReminderRule(ruleId, isActive),
      `Reminder rule ${isActive ? "enabled" : "disabled"}.`,
    );
  };

  const handleSaveRfq = async () => {
    if (!canEditRfq) {
      return;
    }

    const input: UpdateRfqInput = {
      client: rfqForm.client,
      deadline: rfqForm.deadline,
      description: rfqForm.description,
      name: rfqForm.title,
      outcomeReason: rfqForm.outcomeReason || undefined,
      owner: rfqForm.owner,
      priority: rfqForm.priority,
      status: rfqForm.status,
    };

    const response = await runAction("save-rfq", () => updateRfqRecord(rfq.id, input), "RFQ updated.");
    if (response) {
      onRefreshRfq();
    }
  };

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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Current Stage Workspace
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Edit captured data, blocker state, assigned team, and progress here. Stage advancement stays validated by the manager service.
                </p>
              </div>
              <Button onClick={refreshOperational} size="sm" variant="secondary">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            {stageWorkspace.loading ? (
              <div className="mt-4">
                <SkeletonCard className="h-[220px]" lines={6} />
              </div>
            ) : stageWorkspace.error ? (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-700 dark:text-amber-300">
                {stageWorkspace.error}
              </div>
            ) : !stageWorkspace.workspace ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                This RFQ has no active current-stage workspace. Terminal RFQs keep history, but there is no active stage to edit.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="steel">
                    {stageWorkspace.workspace.statusLabel ?? rfq.stageLabel}
                  </Badge>
                  {stageWorkspace.workspace.assignedTeam ? (
                    <Badge variant="gold">
                      Team: {stageWorkspace.workspace.assignedTeam}
                    </Badge>
                  ) : null}
                  {missingMandatoryFields.length > 0 ? (
                    <Badge variant="rose">
                      Missing {missingMandatoryFields.length} mandatory field(s)
                    </Badge>
                  ) : (
                    <Badge variant="emerald">Mandatory fields satisfied</Badge>
                  )}
                  {rfq.subtasks.length > 0 ? (
                    <Badge variant="amber">Progress is subtask-driven</Badge>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assigned-team">Assigned Team</Label>
                    <select
                      className={selectClassName}
                      id="assigned-team"
                      onChange={(event) =>
                        setStageForm((current) => ({
                          ...current,
                          assignedTeam: event.target.value,
                        }))
                      }
                      value={stageForm.assignedTeam}
                    >
                      <option value="">Unassigned</option>
                      {teamOptions.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage-progress">Stage Progress</Label>
                    <Input
                      disabled={!canManageWorkspace || rfq.subtasks.length > 0}
                      id="stage-progress"
                      max={100}
                      min={0}
                      onChange={(event) =>
                        setStageForm((current) => ({
                          ...current,
                          progress: event.target.value,
                        }))
                      }
                      type="number"
                      value={stageForm.progress}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blocker-status">Blocker Status</Label>
                    <select
                      className={selectClassName}
                      id="blocker-status"
                      onChange={(event) =>
                        setStageForm((current) => ({
                          ...current,
                          blockerStatus: event.target.value as "" | "Blocked" | "Resolved",
                        }))
                      }
                      value={stageForm.blockerStatus}
                    >
                      <option value="">No blocker state</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blocker-reason">Blocker Reason Code</Label>
                    <Input
                      id="blocker-reason"
                      onChange={(event) =>
                        setStageForm((current) => ({
                          ...current,
                          blockerReasonCode: event.target.value,
                        }))
                      }
                      placeholder="waiting_client_input"
                      value={stageForm.blockerReasonCode}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Captured Data
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Workflow-mandatory fields appear automatically. You can add more captured keys when the stage needs them.
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        setCapturedFields((current) => [...current, { key: "", value: "" }])
                      }
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {capturedFields.map((field, index) => (
                      <div
                        key={`${field.key || "field"}-${index}`}
                        className="grid gap-3 md:grid-cols-[0.9fr_1.1fr_auto]"
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`captured-key-${index}`}>Field Key</Label>
                          <Input
                            id={`captured-key-${index}`}
                            onChange={(event) =>
                              setCapturedFields((current) =>
                                current.map((entry, currentIndex) =>
                                  currentIndex === index
                                    ? { ...entry, key: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            value={field.key}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`captured-value-${index}`}>Value</Label>
                          <Input
                            id={`captured-value-${index}`}
                            onChange={(event) =>
                              setCapturedFields((current) =>
                                current.map((entry, currentIndex) =>
                                  currentIndex === index
                                    ? { ...entry, value: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            value={field.value}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          {stageWorkspace.workspace?.mandatoryFields.includes(field.key) ? (
                            <Badge variant="gold">Mandatory</Badge>
                          ) : null}
                          <Button
                            onClick={() =>
                              setCapturedFields((current) =>
                                current.length === 1
                                  ? [{ key: "", value: "" }]
                                  : current.filter((_, currentIndex) => currentIndex !== index),
                              )
                            }
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Planned Start
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {stageWorkspace.workspace.plannedStartLabel ?? "Pending"}
                    </div>
                  </div>
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Planned End
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {stageWorkspace.workspace.plannedEndLabel ?? "Pending"}
                    </div>
                  </div>
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Actual Start
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {stageWorkspace.workspace.actualStartLabel ?? "Pending"}
                    </div>
                  </div>
                  <div className="stat-cell">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Actual End
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {stageWorkspace.workspace.actualEndLabel ?? "Pending"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!canManageWorkspace || !currentStageId || busyAction === "save-stage"}
                    onClick={handleSaveStage}
                  >
                    <Save className="h-4 w-4" />
                    Save Stage
                  </Button>
                  <Button
                    disabled={!permissions.canAdvanceStage || !currentStageId || busyAction === "advance-stage"}
                    onClick={handleAdvanceStage}
                    variant="secondary"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Advance Stage
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Stage Notes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Notes stay attached to the current manager stage and refresh after each save.
                </p>
              </div>
              <Badge variant="steel">{rfq.stageNotes.length} note(s)</Badge>
            </div>

            {permissions.canManageStageNotes && currentStageId ? (
              <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4 dark:bg-white/[0.02]">
                <Textarea
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Add an operational note for this stage..."
                  value={noteText}
                />
                <div className="flex justify-end">
                  <Button
                    disabled={!noteText.trim() || busyAction === "add-note"}
                    onClick={handleAddNote}
                    size="sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Add Note
                  </Button>
                </div>
              </div>
            ) : null}

            {rfq.stageNotes.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No current-stage notes are available.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {rfq.stageNotes.map((note) => (
                  <div key={note.id} className="stat-cell">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {note.author}
                      </span>
                      <Badge
                        variant={
                          note.tone === "success"
                            ? "emerald"
                            : note.tone === "warning"
                              ? "gold"
                              : "steel"
                        }
                      >
                        {note.createdLabel}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Files</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload directly into the current stage, then download or delete files from the manager service.
                </p>
              </div>
              <Badge variant="steel">{rfq.recentFiles.length} file(s)</Badge>
            </div>

            {rfq.uploads.length > 0 ? (
              <div className="mt-4 space-y-4">
                {rfq.uploads.map((upload) => (
                  <UploadZone
                    key={upload.kind}
                    description={upload.description}
                    fileName={upload.fileName}
                    initialStatus={upload.status}
                    title={upload.title}
                    uploadedLabel={upload.uploadedLabel}
                  />
                ))}
              </div>
            ) : permissions.canUploadFiles && currentStageId ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4 dark:bg-white/[0.02]">
                <div className="grid gap-3 md:grid-cols-[1fr_0.9fr]">
                  <div className="space-y-2">
                    <Label htmlFor="stage-file-upload">File</Label>
                    <Input
                      id="stage-file-upload"
                      onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                      type="file"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage-file-type">File Type</Label>
                    <select
                      className={selectClassName}
                      id="stage-file-type"
                      onChange={(event) => setFileType(event.target.value)}
                      value={fileType}
                    >
                      {fileTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    disabled={!selectedFile || busyAction === "upload-file"}
                    onClick={handleUploadFile}
                    size="sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                  </Button>
                </div>
              </div>
            ) : null}

            {rfq.recentFiles.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No current-stage files are available.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {rfq.recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="stat-cell flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{file.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.type} · {file.uploadedLabel}
                        {file.uploadedBy ? ` · ${file.uploadedBy}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {file.downloadUrl ? (
                        <Button asChild size="sm" variant="secondary">
                          <a href={file.downloadUrl} rel="noreferrer" target="_blank">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </Button>
                      ) : null}
                      {permissions.canUploadFiles ? (
                        <Button
                          disabled={busyAction === `delete-file:${file.id}`}
                          onClick={() => handleDeleteFile(file.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  RFQ Lifecycle Controls
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Patch the RFQ shell directly from the manager service, including terminal outcomes when needed.
                </p>
              </div>
              <Badge variant={role === "manager" ? "steel" : "pending"}>
                {role === "manager" ? "Editable" : "Read Only"}
              </Badge>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rfq-title">RFQ Title</Label>
                  <Input
                    disabled={!canEditRfq}
                    id="rfq-title"
                    onChange={(event) =>
                      setRfqForm((current) => ({ ...current, title: event.target.value }))
                    }
                    value={rfqForm.title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfq-client">Client</Label>
                  <Input
                    disabled={!canEditRfq}
                    id="rfq-client"
                    onChange={(event) =>
                      setRfqForm((current) => ({ ...current, client: event.target.value }))
                    }
                    value={rfqForm.client}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfq-owner">Owner</Label>
                  <Input
                    disabled={!canEditRfq}
                    id="rfq-owner"
                    onChange={(event) =>
                      setRfqForm((current) => ({ ...current, owner: event.target.value }))
                    }
                    value={rfqForm.owner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfq-deadline">Deadline</Label>
                  <Input
                    disabled={!canEditRfq}
                    id="rfq-deadline"
                    onChange={(event) =>
                      setRfqForm((current) => ({ ...current, deadline: event.target.value }))
                    }
                    type="date"
                    value={rfqForm.deadline}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfq-priority">Priority</Label>
                  <select
                    className={selectClassName}
                    disabled={!canEditRfq}
                    id="rfq-priority"
                    onChange={(event) =>
                      setRfqForm((current) => ({
                        ...current,
                        priority: event.target.value as "normal" | "critical",
                      }))
                    }
                    value={rfqForm.priority}
                  >
                    <option value="normal">normal</option>
                    <option value="critical">critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rfq-status">Status</Label>
                  <select
                    className={selectClassName}
                    disabled={!canEditRfq}
                    id="rfq-status"
                    onChange={(event) =>
                      setRfqForm((current) => ({
                        ...current,
                        status: event.target.value as UpdateRfqInput["status"],
                      }))
                    }
                    value={rfqForm.status}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_preparation">In preparation</option>
                    <option value="submitted">Submitted</option>
                    <option value="awarded">Awarded</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfq-description">Description</Label>
                <Textarea
                  disabled={!canEditRfq}
                  id="rfq-description"
                  onChange={(event) =>
                    setRfqForm((current) => ({ ...current, description: event.target.value }))
                  }
                  value={rfqForm.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfq-outcome-reason">Outcome Reason</Label>
                <Textarea
                  disabled={!canEditRfq}
                  id="rfq-outcome-reason"
                  onChange={(event) =>
                    setRfqForm((current) => ({
                      ...current,
                      outcomeReason: event.target.value,
                    }))
                  }
                  placeholder="Why the RFQ was awarded, lost, or cancelled..."
                  value={rfqForm.outcomeReason}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={!canEditRfq || busyAction === "save-rfq"}
                  onClick={handleSaveRfq}
                >
                  <Save className="h-4 w-4" />
                  Save RFQ
                </Button>
              </div>
            </div>
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Subtasks roll up directly into stage progress when they exist.
                </p>
              </div>
              <Badge variant="steel">{rfq.subtasks.length} task(s)</Badge>
            </div>

            {canManageSubtasks && currentStageId ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4 dark:bg-white/[0.02]">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    onChange={(event) =>
                      setNewSubtask((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Subtask name"
                    value={newSubtask.name}
                  />
                  <Input
                    onChange={(event) =>
                      setNewSubtask((current) => ({
                        ...current,
                        assignedTo: event.target.value,
                      }))
                    }
                    placeholder="Assigned to"
                    value={newSubtask.assignedTo}
                  />
                  <Input
                    onChange={(event) =>
                      setNewSubtask((current) => ({ ...current, dueDate: event.target.value }))
                    }
                    type="date"
                    value={newSubtask.dueDate}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    disabled={!newSubtask.name.trim() || busyAction === "create-subtask"}
                    onClick={handleCreateSubtask}
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Subtask
                  </Button>
                </div>
              </div>
            ) : null}

            {rfq.subtasks.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No current-stage subtasks are available.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {rfq.subtasks.map((task) => {
                  const draft = subtaskDrafts[task.id];

                  return (
                    <div key={task.id} className="stat-cell space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium text-foreground">{task.label}</div>
                        <Badge
                          variant={
                            task.state === "done"
                              ? "emerald"
                              : task.state === "in_progress"
                                ? "steel"
                                : "pending"
                          }
                        >
                          {task.state.replace("_", " ")}
                        </Badge>
                      </div>

                      {draft ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            onChange={(event) =>
                              setSubtaskDrafts((current) => ({
                                ...current,
                                [task.id]: {
                                  ...current[task.id],
                                  name: event.target.value,
                                },
                              }))
                            }
                            value={draft.name}
                          />
                          <Input
                            onChange={(event) =>
                              setSubtaskDrafts((current) => ({
                                ...current,
                                [task.id]: {
                                  ...current[task.id],
                                  assignedTo: event.target.value,
                                },
                              }))
                            }
                            placeholder="Assigned to"
                            value={draft.assignedTo}
                          />
                          <Input
                            max={100}
                            min={0}
                            onChange={(event) =>
                              setSubtaskDrafts((current) => ({
                                ...current,
                                [task.id]: {
                                  ...current[task.id],
                                  progress: event.target.value,
                                },
                              }))
                            }
                            type="number"
                            value={draft.progress}
                          />
                          <Input
                            onChange={(event) =>
                              setSubtaskDrafts((current) => ({
                                ...current,
                                [task.id]: {
                                  ...current[task.id],
                                  dueDate: event.target.value,
                                },
                              }))
                            }
                            type="date"
                            value={draft.dueDate}
                          />
                          <select
                            className={selectClassName}
                            onChange={(event) =>
                              setSubtaskDrafts((current) => ({
                                ...current,
                                [task.id]: {
                                  ...current[task.id],
                                  status: event.target.value as SubtaskDraft["status"],
                                },
                              }))
                            }
                            value={draft.status}
                          >
                            <option value="Open">Open</option>
                            <option value="In progress">In progress</option>
                            <option value="Done">Done</option>
                          </select>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              disabled={busyAction === `update-subtask:${task.id}`}
                              onClick={() => handleUpdateSubtask(task.id)}
                              size="sm"
                              variant="secondary"
                            >
                              <Save className="h-3.5 w-3.5" />
                              Save
                            </Button>
                            <Button
                              disabled={busyAction === `delete-subtask:${task.id}`}
                              onClick={() => handleDeleteSubtask(task.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {task.owner} · due {task.dueLabel}
                          {typeof task.progress === "number" ? ` · ${task.progress}%` : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Reminders</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create RFQ-level reminders, process due reminders, and toggle reminder rules directly from the manager service.
                </p>
              </div>
              <Badge variant="steel">{reminders.reminders.length} reminder(s)</Badge>
            </div>

            {reminders.loading ? (
              <div className="mt-4">
                <SkeletonCard className="h-[180px]" lines={5} />
              </div>
            ) : reminders.error ? (
              <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-700 dark:text-rose-300">
                {reminders.error}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reminders.stats ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="stat-cell">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Open Tasks
                      </div>
                      <div className="mt-1 text-lg font-semibold text-foreground">
                        {reminders.stats.openTasks}
                      </div>
                    </div>
                    <div className="stat-cell">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Overdue
                      </div>
                      <div className="mt-1 text-lg font-semibold text-foreground">
                        {reminders.stats.overdueTasks}
                      </div>
                    </div>
                    <div className="stat-cell">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Due This Week
                      </div>
                      <div className="mt-1 text-lg font-semibold text-foreground">
                        {reminders.stats.dueThisWeek}
                      </div>
                    </div>
                    <div className="stat-cell">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Active Reminder RFQs
                      </div>
                      <div className="mt-1 text-lg font-semibold text-foreground">
                        {reminders.stats.withActiveReminders}
                      </div>
                    </div>
                  </div>
                ) : null}

                {canManageReminders ? (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 dark:bg-white/[0.02]">
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        className={selectClassName}
                        onChange={(event) =>
                          setReminderForm((current) => ({
                            ...current,
                            type: event.target.value as "internal" | "external",
                          }))
                        }
                        value={reminderForm.type}
                      >
                        <option value="internal">internal</option>
                        <option value="external">external</option>
                      </select>
                      <Input
                        onChange={(event) =>
                          setReminderForm((current) => ({
                            ...current,
                            assignedTo: event.target.value,
                          }))
                        }
                        placeholder="Assigned to"
                        value={reminderForm.assignedTo}
                      />
                      <Input
                        onChange={(event) =>
                          setReminderForm((current) => ({
                            ...current,
                            dueDate: event.target.value,
                          }))
                        }
                        type="date"
                        value={reminderForm.dueDate}
                      />
                      <Input
                        onChange={(event) =>
                          setReminderForm((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                        placeholder="Reminder message"
                        value={reminderForm.message}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <Button
                        disabled={busyAction === "test-reminder-email"}
                        onClick={handleReminderTest}
                        size="sm"
                        variant="ghost"
                      >
                        <BellRing className="h-3.5 w-3.5" />
                        Test Email
                      </Button>
                      <Button
                        disabled={busyAction === "process-reminders"}
                        onClick={handleProcessReminders}
                        size="sm"
                        variant="secondary"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Process Due
                      </Button>
                      <Button
                        disabled={!reminderForm.message.trim() || !reminderForm.dueDate || busyAction === "create-reminder"}
                        onClick={handleCreateReminder}
                        size="sm"
                      >
                        <BellRing className="h-3.5 w-3.5" />
                        Create Reminder
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  {reminders.reminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No reminders are currently attached to this RFQ.
                    </p>
                  ) : (
                    reminders.reminders.map((reminder) => (
                      <div key={reminder.id} className="stat-cell">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium text-foreground">
                            {reminder.message}
                          </div>
                          <Badge variant={reminderStatusTone[reminder.status] ?? "steel"}>
                            {reminder.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {reminder.type} · due {reminder.dueLabel}
                          {reminder.assignedTo ? ` · ${reminder.assignedTo}` : ""}
                          {reminder.delayDays > 0 ? ` · ${reminder.delayDays} day(s) late` : ""}
                          {reminder.sendCount > 0 ? ` · sent ${reminder.sendCount} time(s)` : ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {canManageReminders && reminders.rules.length > 0 ? (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 dark:bg-white/[0.02]">
                    <div className="text-sm font-semibold text-foreground">
                      Reminder Rules
                    </div>
                    {reminders.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {rule.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rule.scope}
                            {rule.description ? ` · ${rule.description}` : ""}
                          </div>
                        </div>
                        <Button
                          disabled={busyAction === `toggle-rule:${rule.id}`}
                          onClick={() => handleToggleReminderRule(rule.id, !rule.isActive)}
                          size="sm"
                          variant="secondary"
                        >
                          {rule.isActive ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
