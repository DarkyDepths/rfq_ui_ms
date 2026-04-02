import type {
  ManagerApiReminder,
  ManagerApiReminderRule,
  ManagerApiReminderStats,
} from "@/models/manager/api-reminder";
import type {
  ReminderModel,
  ReminderRuleModel,
  ReminderStatsModel,
} from "@/models/manager/rfq";
import { formatDate } from "@/utils/format";

export function translateManagerReminder(
  reminder: ManagerApiReminder,
): ReminderModel {
  return {
    id: reminder.id,
    rfqId: reminder.rfq_id,
    rfqStageId: reminder.rfq_stage_id ?? undefined,
    type: reminder.type,
    message: reminder.message,
    dueDateValue: reminder.due_date,
    dueLabel: formatDate(reminder.due_date),
    status: reminder.status,
    delayDays: reminder.delay_days,
    assignedTo: reminder.assigned_to ?? undefined,
    createdBy: reminder.created_by ?? undefined,
    createdLabel: formatDate(reminder.created_at),
    updatedLabel: reminder.updated_at ? formatDate(reminder.updated_at) : undefined,
    lastSentLabel: reminder.last_sent_at ? formatDate(reminder.last_sent_at) : undefined,
    sendCount: reminder.send_count,
  };
}

export function translateManagerReminderStats(
  stats: ManagerApiReminderStats,
): ReminderStatsModel {
  return {
    openTasks: stats.open_tasks,
    overdueTasks: stats.overdue_tasks,
    dueThisWeek: stats.due_this_week,
    withActiveReminders: stats.with_active_reminders,
  };
}

export function translateManagerReminderRule(
  rule: ManagerApiReminderRule,
): ReminderRuleModel {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description ?? undefined,
    scope: rule.scope,
    isActive: rule.is_active,
    createdLabel: formatDate(rule.created_at),
  };
}
