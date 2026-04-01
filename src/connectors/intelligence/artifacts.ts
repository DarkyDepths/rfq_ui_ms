import { apiConfig } from "@/config/api";
import { artifactResponses } from "@/demo/intelligence/artifacts";
import { requestJson } from "@/lib/http-client";
import type {
  ArtifactKind,
  ArtifactModel,
  ArtifactResponse,
  ReprocessResult,
} from "@/models/intelligence/artifacts";
import { translateArtifact } from "@/translators/intelligence/artifacts";
import { sleep } from "@/utils/async";

export async function getArtifactCatalog(
  rfqId: string,
): Promise<ArtifactModel[]> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.65));
    return (artifactResponses[rfqId] ?? []).map(translateArtifact);
  }

  const response = await requestJson<ArtifactResponse[]>(
    `${apiConfig.intelligenceBaseUrl}/artifacts/${rfqId}`,
  );

  return response.map(translateArtifact);
}

export async function requestArtifactReprocess(
  rfqId: string,
  kind: ArtifactKind,
): Promise<ReprocessResult> {
  if (apiConfig.useMockData) {
    await sleep(Math.round(apiConfig.demoLatencyMs * 0.5));
    return {
      rfqId,
      kind,
      accepted: true,
      message: `${kind} reprocess queued in demo mode.`,
    };
  }

  return requestJson<ReprocessResult>(
    `${apiConfig.intelligenceBaseUrl}/artifacts/${rfqId}/${kind}/reprocess`,
    {
      method: "POST",
    },
  );
}
