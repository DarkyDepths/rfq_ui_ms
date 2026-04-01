import type {
  BriefingArtifactModel,
  BriefingResponse,
} from "@/models/intelligence/briefing";
import { formatDate } from "@/utils/format";

export function translateBriefing(
  briefing: BriefingResponse,
): BriefingArtifactModel {
  return {
    kind: "briefing",
    title: "Bid Briefing",
    status: briefing.status,
    version: briefing.version,
    updatedLabel: briefing.updatedAt ? formatDate(briefing.updatedAt) : "Pending",
    summary: briefing.executiveSummary,
    keySignals: briefing.strategicSignals,
    openQuestions: briefing.openQuestions,
    recommendation: briefing.recommendation,
  };
}
