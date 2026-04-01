import { apiConfig } from "@/config/api";
import { briefingResponses } from "@/demo/intelligence/briefing";
import { requestJson } from "@/lib/http-client";
import type {
  BriefingArtifactModel,
  BriefingResponse,
} from "@/models/intelligence/briefing";
import { translateBriefing } from "@/translators/intelligence/briefing";
import { sleep } from "@/utils/async";

export async function getBriefingArtifact(
  rfqId: string,
): Promise<BriefingArtifactModel | null> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.7));
    const response = briefingResponses[rfqId];
    return response ? translateBriefing(response) : null;
  }

  const response = await requestJson<BriefingResponse>(
    `${apiConfig.intelligenceBaseUrl}/briefing/${rfqId}`,
  );

  return translateBriefing(response);
}
