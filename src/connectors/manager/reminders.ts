import { requestManagerJson } from "@/connectors/manager/base";
import type {
  ManagerApiReminderCreateInput,
  ManagerApiReminderListResponse,
  ManagerApiReminderRuleListResponse,
  ManagerApiReminderRuleUpdateInput,
  ManagerApiReminderStats,
} from "@/models/manager/api-reminder";
import type {
  ReminderCreateInput,
  ReminderModel,
  ReminderRuleModel,
  ReminderStatsModel,
} from "@/models/manager/rfq";
import {
  translateManagerReminder,
  translateManagerReminderRule,
  translateManagerReminderStats,
} from "@/translators/manager/reminders";

export async function getRfqReminders(
  rfqId: string,
): Promise<ReminderModel[]> {
  const response = await requestManagerJson<ManagerApiReminderListResponse>(
    "/reminders",
    undefined,
    { rfq_id: rfqId },
  );

  return response.data.map(translateManagerReminder);
}

export async function getReminderStats(): Promise<ReminderStatsModel> {
  const response = await requestManagerJson<ManagerApiReminderStats>(
    "/reminders/stats",
  );

  return translateManagerReminderStats(response);
}

export async function getReminderRules(): Promise<ReminderRuleModel[]> {
  const response = await requestManagerJson<ManagerApiReminderRuleListResponse>(
    "/reminders/rules",
  );

  return response.data.map(translateManagerReminderRule);
}

export async function createReminder(
  input: ReminderCreateInput,
): Promise<void> {
  await requestManagerJson(
    "/reminders",
    {
      method: "POST",
      body: JSON.stringify({
        rfq_id: input.rfqId,
        rfq_stage_id: input.rfqStageId,
        type: input.type,
        message: input.message,
        due_date: input.dueDate,
        assigned_to: input.assignedTo,
      } satisfies ManagerApiReminderCreateInput),
    },
  );
}

export async function processReminders(): Promise<string> {
  const response = await requestManagerJson<{ message: string }>(
    "/reminders/process",
    {
      method: "POST",
    },
  );

  return response.message;
}

export async function sendReminderTestEmail(): Promise<string> {
  const response = await requestManagerJson<{ message: string }>(
    "/reminders/test",
    {
      method: "POST",
    },
  );

  return response.message;
}

export async function updateReminderRule(
  ruleId: string,
  isActive: boolean,
): Promise<void> {
  await requestManagerJson(
    `/reminders/rules/${ruleId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_active: isActive,
      } satisfies ManagerApiReminderRuleUpdateInput),
    },
  );
}
