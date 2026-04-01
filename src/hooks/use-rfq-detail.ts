"use client";

import { useEffect, useState } from "react";

import { getArtifactCatalog } from "@/connectors/intelligence/artifacts";
import { getBriefingArtifact } from "@/connectors/intelligence/briefing";
import { getIntelligenceSnapshot } from "@/connectors/intelligence/snapshot";
import { getWorkbookProfile, getWorkbookReview } from "@/connectors/intelligence/workbook";
import { getRfqDetail } from "@/connectors/manager/rfqs";
import type { ArtifactModel } from "@/models/intelligence/artifacts";
import type { BriefingArtifactModel } from "@/models/intelligence/briefing";
import type {
  IntelligenceSnapshotModel,
  ProcessingState,
} from "@/models/intelligence/snapshot";
import type {
  WorkbookProfileModel,
  WorkbookReviewModel,
} from "@/models/intelligence/workbook";
import type { RfqDetailModel } from "@/models/manager/rfq";

interface DetailState {
  shellLoading: boolean;
  artifactsLoading: boolean;
  rfq: RfqDetailModel | null;
  snapshot: IntelligenceSnapshotModel | null;
  briefing: BriefingArtifactModel | null;
  workbookProfile: WorkbookProfileModel | null;
  workbookReview: WorkbookReviewModel | null;
  artifacts: ArtifactModel[];
  phase: "loading" | ProcessingState;
}

export function useRfqDetail(rfqId: string) {
  const [state, setState] = useState<DetailState>({
    shellLoading: true,
    artifactsLoading: true,
    rfq: null,
    snapshot: null,
    briefing: null,
    workbookProfile: null,
    workbookReview: null,
    artifacts: [],
    phase: "loading",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const rfq = await getRfqDetail(rfqId);

      if (!active || !rfq) {
        if (active) {
          setState((current) => ({
            ...current,
            shellLoading: false,
            artifactsLoading: false,
            phase: "failed",
          }));
        }
        return;
      }

      const snapshot = await getIntelligenceSnapshot(rfqId);

      if (!active) {
        return;
      }

      setState((current) => ({
        ...current,
        shellLoading: false,
        rfq,
        snapshot,
        phase: snapshot?.state === "failed" ? "failed" : "partial",
      }));

      const [briefing, workbookProfile, workbookReview, artifacts] =
        await Promise.all([
          getBriefingArtifact(rfqId),
          getWorkbookProfile(rfqId),
          getWorkbookReview(rfqId),
          getArtifactCatalog(rfqId),
        ]);

      if (!active) {
        return;
      }

      setState({
        shellLoading: false,
        artifactsLoading: false,
        rfq,
        snapshot,
        briefing,
        workbookProfile,
        workbookReview,
        artifacts,
        phase: snapshot?.state ?? "partial",
      });
    }

    load();

    return () => {
      active = false;
    };
  }, [rfqId]);

  return state;
}
