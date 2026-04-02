"use client";

import { useEffect, useState } from "react";

import {
  getDashboardAnalytics,
  getDashboardMetrics,
} from "@/connectors/manager/rfqs";
import type {
  KPIMetricModel,
  ManagerDashboardAnalyticsModel,
} from "@/models/ui/dashboard";

interface DashboardState {
  analytics: ManagerDashboardAnalyticsModel | null;
  error: string | null;
  loading: boolean;
  metrics: KPIMetricModel[];
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    error: null,
    loading: true,
    metrics: [],
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [metrics, analytics] = await Promise.all([
          getDashboardMetrics(),
          getDashboardAnalytics(),
        ]);

        if (!active) {
          return;
        }

        setState({
          analytics,
          error: null,
          loading: false,
          metrics,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          analytics: null,
          error:
            error instanceof Error
              ? error.message
              : "Dashboard data could not be loaded.",
          loading: false,
          metrics: [],
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
