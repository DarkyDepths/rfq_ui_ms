"use client";

import { useEffect, useState } from "react";

import { getIntelligencePortfolioSummary } from "@/connectors/intelligence/snapshot";
import { getDashboardMetrics, listRfqs } from "@/connectors/manager/rfqs";
import type { RfqCardModel } from "@/models/manager/rfq";
import type { IntelligencePortfolioModel, KPIMetricModel } from "@/models/ui/dashboard";

interface OverviewState {
  loading: boolean;
  metrics: KPIMetricModel[];
  rfqs: RfqCardModel[];
  portfolio: IntelligencePortfolioModel | null;
}

export function useOverviewData() {
  const [state, setState] = useState<OverviewState>({
    loading: true,
    metrics: [],
    rfqs: [],
    portfolio: null,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const [metrics, rfqs, portfolio] = await Promise.all([
        getDashboardMetrics(),
        listRfqs(),
        getIntelligencePortfolioSummary(),
      ]);

      if (!active) {
        return;
      }

      setState({
        loading: false,
        metrics,
        rfqs,
        portfolio,
      });
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
