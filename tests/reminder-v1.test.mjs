import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const workspaceSource = await readFile(
  path.join(process.cwd(), "src", "components", "rfq", "RfqOperationalWorkspace.tsx"),
  "utf8",
);
const overviewSource = await readFile(
  path.join(process.cwd(), "src", "components", "rfq", "RFQOverviewScreen.tsx"),
  "utf8",
);
const centerPanelSource = await readFile(
  path.join(process.cwd(), "src", "components", "reminders", "ReminderCenterPanel.tsx"),
  "utf8",
);
const reminderDialogSource = await readFile(
  path.join(process.cwd(), "src", "components", "reminders", "ReminderDetailDialog.tsx"),
  "utf8",
);
const rfqHookSource = await readFile(
  path.join(process.cwd(), "src", "hooks", "use-rfq-reminders.ts"),
  "utf8",
);
const centerHookSource = await readFile(
  path.join(process.cwd(), "src", "hooks", "use-reminder-center.ts"),
  "utf8",
);
const permissionsSource = await readFile(
  path.join(process.cwd(), "src", "config", "role-capabilities.ts"),
  "utf8",
);
const reminderUtilsSource = await readFile(
  path.join(process.cwd(), "src", "utils", "reminder.ts"),
  "utf8",
);

assert.ok(workspaceSource.includes("Create and review reminders attached to this RFQ here."));
assert.ok(workspaceSource.includes("Reminder Center"));
assert.ok(workspaceSource.includes("Reminder scope"));
assert.ok(workspaceSource.includes("Stage-linked"));
assert.ok(workspaceSource.includes("RFQ-level"));
assert.ok(workspaceSource.includes("This reminder will follow the RFQ as a whole"));
assert.ok(workspaceSource.includes('rfqStageId: reminderForm.scope === "stage" ? currentStageId : undefined'));
assert.ok(!workspaceSource.includes("rfqStageId: currentStageId"));
assert.ok(workspaceSource.includes("Resolve"));
assert.ok(workspaceSource.includes("View details"));
assert.ok(workspaceSource.includes("reminderDueDateValidationMessage"));
assert.ok(workspaceSource.includes("getReminderTypeLabel(reminder.type)"));
assert.ok(!workspaceSource.includes("Portfolio Reminder Service"));
assert.ok(!workspaceSource.includes("Process Due"));
assert.ok(!workspaceSource.includes("Test Email"));

assert.ok(overviewSource.includes("ReminderCenterPanel"));

assert.ok(centerPanelSource.includes("Reminder Center"));
assert.ok(centerPanelSource.includes("Run Batch Now"));
assert.ok(centerPanelSource.includes("Service-wide Reminders"));
assert.ok(centerPanelSource.includes("records"));
assert.ok(centerPanelSource.includes("Reminder Rules"));
assert.ok(centerPanelSource.includes("Automatic reminders are batch-driven."));
assert.ok(centerPanelSource.includes("resolveReminder"));
assert.ok(centerPanelSource.includes("Show all records"));
assert.ok(centerPanelSource.includes("overdue first"));
assert.ok(centerPanelSource.includes("View details"));
assert.ok(centerPanelSource.includes("getReminderTypeLabel(reminder.type)"));

assert.ok(rfqHookSource.includes("getRfqReminders"));
assert.ok(!rfqHookSource.includes("getReminderStats"));
assert.ok(!rfqHookSource.includes("getReminderRules"));

assert.ok(centerHookSource.includes("listReminders"));
assert.ok(centerHookSource.includes("getReminderStats"));
assert.ok(centerHookSource.includes("getReminderRules"));

assert.ok(permissionsSource.includes('"reminder:update"'));
assert.ok(reminderDialogSource.includes("Reminder Detail"));
assert.ok(reminderDialogSource.includes("Reminder Message"));
assert.ok(reminderDialogSource.includes("RFQ-level reminder"));
assert.ok(reminderUtilsSource.includes("Reminder due date cannot be in the past."));
assert.ok(reminderUtilsSource.includes("sortRemindersForDisplay"));
