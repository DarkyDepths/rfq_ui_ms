"use client";

import { useEffect, useMemo, useState } from "react";

import { getArtifactCatalog, requestArtifactReprocess } from "@/connectors/intelligence/artifacts";
import { getBriefingArtifact } from "@/connectors/intelligence/briefing";
import { getIntelligenceSnapshot } from "@/connectors/intelligence/snapshot";
import {
  getWorkbookProfile,
  getWorkbookReview,
} from "@/connectors/intelligence/workbook";
import type { ArtifactModel, ReprocessKind, ReprocessResult } from "@/models/intelligence/artifacts";
import type { BriefingArtifactModel } from "@/models/intelligence/briefing";
import type { IntelligenceSnapshotModel } from "@/models/intelligence/snapshot";
import type {
  WorkbookProfileModel,
  WorkbookReviewModel,
} from "@/models/intelligence/workbook";
import { formatDate } from "@/utils/format";

export interface IntelligenceResourceState<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

export interface IntelligenceStaleNotice {
  intelligenceUpdatedAtValue: string;
  intelligenceUpdatedLabel: string;
  managerUpdatedAtValue: string;
  managerUpdatedLabel: string;
  message: string;
}

function createState<T>(data: T, loading = false): IntelligenceResourceState<T> {
  return {
    data,
    error: null,
    loading,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function parseTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function deriveStaleNotice(
  managerUpdatedAt: string | undefined,
  timestamps: Array<string | undefined>,
): IntelligenceStaleNotice | null {
  const managerTimestamp = parseTimestamp(managerUpdatedAt);

  if (!managerUpdatedAt || managerTimestamp === null) {
    return null;
  }

  const latestIntelligenceValue = timestamps.reduce<string | undefined>(
    (latest, candidate) => {
      const latestTimestamp = parseTimestamp(latest);
      const candidateTimestamp = parseTimestamp(candidate);

      if (candidateTimestamp === null) {
        return latest;
      }

      if (latestTimestamp === null || candidateTimestamp > latestTimestamp) {
        return candidate;
      }

      return latest;
    },
    undefined,
  );

  const intelligenceTimestamp = parseTimestamp(latestIntelligenceValue);

  if (!latestIntelligenceValue || intelligenceTimestamp === null) {
    return null;
  }

  if (managerTimestamp <= intelligenceTimestamp) {
    return null;
  }

  return {
    intelligenceUpdatedAtValue: latestIntelligenceValue,
    intelligenceUpdatedLabel: formatDate(latestIntelligenceValue),
    managerUpdatedAtValue: managerUpdatedAt,
    managerUpdatedLabel: formatDate(managerUpdatedAt),
    message:
      "Operational data changed after the latest intelligence artifact update. Intelligence may not reflect the newest stage, files, or notes yet.",
  };
}

export function useRfqIntelligence(
  rfqId: string,
  enabled: boolean,
  managerUpdatedAt?: string,
) {
  const [snapshot, setSnapshot] = useState<
    IntelligenceResourceState<IntelligenceSnapshotModel | null>
  >(createState(null, enabled));
  const [briefing, setBriefing] = useState<
    IntelligenceResourceState<BriefingArtifactModel | null>
  >(createState(null, enabled));
  const [workbookProfile, setWorkbookProfile] = useState<
    IntelligenceResourceState<WorkbookProfileModel | null>
  >(createState(null, enabled));
  const [workbookReview, setWorkbookReview] = useState<
    IntelligenceResourceState<WorkbookReviewModel | null>
  >(createState(null, enabled));
  const [artifacts, setArtifacts] = useState<
    IntelligenceResourceState<ArtifactModel[]>
  >(createState([], enabled));

  useEffect(() => {
    if (!enabled) {
      setSnapshot(createState(null));
      setBriefing(createState(null));
      setWorkbookProfile(createState(null));
      setWorkbookReview(createState(null));
      setArtifacts(createState([]));
      return;
    }

    let active = true;

    const loadResource = async <T,>(
      setState: React.Dispatch<React.SetStateAction<IntelligenceResourceState<T>>>,
      initialData: T,
      loader: () => Promise<T>,
      fallback: string,
    ) => {
      setState(createState(initialData, true));

      try {
        const data = await loader();

        if (!active) {
          return;
        }

        setState({
          data,
          error: null,
          loading: false,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          data: initialData,
          error: getErrorMessage(error, fallback),
          loading: false,
        });
      }
    };

    void loadResource(
      setSnapshot,
      null,
      () => getIntelligenceSnapshot(rfqId),
      "Snapshot could not be loaded.",
    );
    void loadResource(
      setBriefing,
      null,
      () => getBriefingArtifact(rfqId),
      "Briefing could not be loaded.",
    );
    void loadResource(
      setWorkbookProfile,
      null,
      () => getWorkbookProfile(rfqId),
      "Workbook profile could not be loaded.",
    );
    void loadResource(
      setWorkbookReview,
      null,
      () => getWorkbookReview(rfqId),
      "Workbook review could not be loaded.",
    );
    void loadResource(
      setArtifacts,
      [],
      () => getArtifactCatalog(rfqId),
      "Artifact catalog could not be loaded.",
    );

    return () => {
      active = false;
    };
  }, [enabled, rfqId]);

  const staleIntel = useMemo(
    () =>
      deriveStaleNotice(managerUpdatedAt, [
        snapshot.data?.updatedAtValue,
        briefing.data?.updatedAtValue,
        workbookProfile.data?.updatedAtValue,
        workbookReview.data?.updatedAtValue,
        ...artifacts.data
          .filter((artifact) => artifact.isCurrent !== false)
          .map((artifact) => artifact.updatedAtValue),
      ]),
    [
      artifacts.data,
      briefing.data?.updatedAtValue,
      managerUpdatedAt,
      snapshot.data?.updatedAtValue,
      workbookProfile.data?.updatedAtValue,
      workbookReview.data?.updatedAtValue,
    ],
  );

  return {
    artifacts,
    briefing,
    requestReprocess: (kind: ReprocessKind): Promise<ReprocessResult> =>
      requestArtifactReprocess(rfqId, kind),
    snapshot,
    staleIntel,
    workbookProfile,
    workbookReview,
  };
}
