"use client";

import { useEffect, useState } from "react";

import { getArtifactCatalog } from "@/connectors/intelligence/artifacts";
import { getBriefingArtifact } from "@/connectors/intelligence/briefing";
import { getIntelligenceSnapshot } from "@/connectors/intelligence/snapshot";
import {
  getWorkbookProfile,
  getWorkbookReview,
} from "@/connectors/intelligence/workbook";
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

interface IntelligenceState {
  artifacts: ArtifactModel[];
  artifactsLoading: boolean;
  briefing: BriefingArtifactModel | null;
  phase: "loading" | ProcessingState;
  snapshot: IntelligenceSnapshotModel | null;
  workbookProfile: WorkbookProfileModel | null;
  workbookReview: WorkbookReviewModel | null;
}

export function useRfqIntelligence(rfqId: string, enabled: boolean) {
  const [state, setState] = useState<IntelligenceState>({
    artifacts: [],
    artifactsLoading: enabled,
    briefing: null,
    phase: enabled ? "loading" : "pending",
    snapshot: null,
    workbookProfile: null,
    workbookReview: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        artifacts: [],
        artifactsLoading: false,
        briefing: null,
        phase: "pending",
        snapshot: null,
        workbookProfile: null,
        workbookReview: null,
      });
      return;
    }

    let active = true;

    async function load() {
      const snapshot = await getIntelligenceSnapshot(rfqId);

      if (!active) {
        return;
      }

      setState((current) => ({
        ...current,
        phase: snapshot?.state === "failed" ? "failed" : "partial",
        snapshot,
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
        artifacts,
        artifactsLoading: false,
        briefing,
        phase: snapshot?.state ?? "partial",
        snapshot,
        workbookProfile,
        workbookReview,
      });
    }

    load();

    return () => {
      active = false;
    };
  }, [enabled, rfqId]);

  return state;
}
