import { apiConfig } from "@/config/api";
import {
  workbookProfileResponses,
  workbookReviewResponses,
} from "@/demo/intelligence/workbook";
import { requestJson } from "@/lib/http-client";
import type {
  WorkbookProfileModel,
  WorkbookProfileResponse,
  WorkbookReviewModel,
  WorkbookReviewResponse,
} from "@/models/intelligence/workbook";
import {
  translateWorkbookProfile,
  translateWorkbookReview,
} from "@/translators/intelligence/workbook";
import { sleep } from "@/utils/async";

export async function getWorkbookProfile(
  rfqId: string,
): Promise<WorkbookProfileModel | null> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.72));
    const response = workbookProfileResponses[rfqId];
    return response ? translateWorkbookProfile(response) : null;
  }

  const response = await requestJson<WorkbookProfileResponse>(
    `${apiConfig.intelligenceBaseUrl}/workbook/${rfqId}/profile`,
  );

  return translateWorkbookProfile(response);
}

export async function getWorkbookReview(
  rfqId: string,
): Promise<WorkbookReviewModel | null> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.9));
    const response = workbookReviewResponses[rfqId];
    return response ? translateWorkbookReview(response) : null;
  }

  const response = await requestJson<WorkbookReviewResponse>(
    `${apiConfig.intelligenceBaseUrl}/workbook/${rfqId}/review`,
  );

  return translateWorkbookReview(response);
}
