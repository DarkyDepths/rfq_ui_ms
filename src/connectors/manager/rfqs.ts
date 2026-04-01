import { apiConfig } from "@/config/api";
import {
  managerRfqDetailResponses,
  managerRfqListResponse,
} from "@/demo/manager/rfqs";
import { requestJson } from "@/lib/http-client";
import type {
  CreateRfqInput,
  DashboardMetricModel,
  ManagerRfqDetailResponse,
  ManagerRfqListResponse,
  RfqCardModel,
  RfqDetailModel,
  RfqMutationResult,
  UpdateRfqInput,
} from "@/models/manager/rfq";
import {
  translateDashboardMetric,
  translateRfqCard,
  translateRfqDetail,
} from "@/translators/manager/rfqs";
import { sleep } from "@/utils/async";

export async function listRfqs(): Promise<RfqCardModel[]> {
  if (apiConfig.useMockData) {
    await sleep(apiConfig.demoLatencyMs);
    return managerRfqListResponse.items.map(translateRfqCard);
  }

  const response = await requestJson<ManagerRfqListResponse>(
    `${apiConfig.managerBaseUrl}/rfqs`,
  );

  return response.items.map(translateRfqCard);
}

export async function getDashboardMetrics(): Promise<DashboardMetricModel[]> {
  if (apiConfig.useMockData) {
    await sleep(apiConfig.demoLatencyMs);
    return managerRfqListResponse.metrics.map(translateDashboardMetric);
  }

  const response = await requestJson<ManagerRfqListResponse>(
    `${apiConfig.managerBaseUrl}/rfqs`,
  );

  return response.metrics.map(translateDashboardMetric);
}

export async function getRfqDetail(
  rfqId: string,
): Promise<RfqDetailModel | null> {
  if (apiConfig.useMockData) {
    await sleep(apiConfig.demoLatencyMs);
    const detail = managerRfqDetailResponses[rfqId];
    return detail ? translateRfqDetail(detail) : null;
  }

  const response = await requestJson<ManagerRfqDetailResponse>(
    `${apiConfig.managerBaseUrl}/rfqs/${rfqId}`,
  );

  return translateRfqDetail(response);
}

export async function createRfqDraft(
  input: CreateRfqInput,
): Promise<RfqMutationResult> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.75));
    return {
      id: `DEMO-${input.title.slice(0, 12).replace(/\s+/g, "-").toUpperCase()}`,
      message: "Draft RFQ staged in demo mode.",
      status: "demo_staged",
    };
  }

  return requestJson<RfqMutationResult>(`${apiConfig.managerBaseUrl}/rfqs`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateRfqRecord(
  rfqId: string,
  input: UpdateRfqInput,
): Promise<RfqMutationResult> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.65));
    return {
      id: rfqId,
      message: "RFQ update accepted in demo mode.",
      status: "updated",
    };
  }

  return requestJson<RfqMutationResult>(
    `${apiConfig.managerBaseUrl}/rfqs/${rfqId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}
