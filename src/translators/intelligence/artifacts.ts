import type {
  ArtifactModel,
  ArtifactResponse,
} from "@/models/intelligence/artifacts";
import { formatDate } from "@/utils/format";
import { getAccentForArtifact } from "@/utils/status";

export function translateArtifact(artifact: ArtifactResponse): ArtifactModel {
  return {
    id: artifact.id,
    kind: artifact.kind,
    title: artifact.title,
    version: artifact.version,
    status: artifact.status,
    updatedLabel: artifact.updatedAt ? formatDate(artifact.updatedAt) : "Pending",
    summary: artifact.summary,
    owner: artifact.owner,
    accent: getAccentForArtifact(artifact.kind),
  };
}
