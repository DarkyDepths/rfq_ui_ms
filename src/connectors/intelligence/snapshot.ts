import { apiConfig } from "@/config/api";
import { intelligencePortfolioResponse, snapshotResponses } from "@/demo/intelligence/snapshot";
import { requestJson } from "@/lib/http-client";
import type {
  IntelligencePortfolioResponse,
  IntelligenceSnapshotModel,
  SnapshotResponse,
} from "@/models/intelligence/snapshot";
import type { IntelligencePortfolioModel } from "@/models/ui/dashboard";
import {
  translatePortfolioSummary,
  translateSnapshot,
} from "@/translators/intelligence/snapshot";
import { sleep } from "@/utils/async";

export async function getIntelligencePortfolioSummary(): Promise<IntelligencePortfolioModel> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.6));
    return translatePortfolioSummary(intelligencePortfolioResponse);
  }

  const response = await requestJson<IntelligencePortfolioResponse>(
    `${apiConfig.intelligenceBaseUrl}/snapshot/portfolio`,
  );

  return translatePortfolioSummary(response);
}

export async function getIntelligenceSnapshot(
  rfqId: string,
): Promise<IntelligenceSnapshotModel | null> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.85));
    const response = snapshotResponses[rfqId];
    return response ? translateSnapshot(response) : null;
  }

  const response = await requestJson<SnapshotResponse>(
    `${apiConfig.intelligenceBaseUrl}/snapshot/${rfqId}`,
  );

  return translateSnapshot(response);
}
