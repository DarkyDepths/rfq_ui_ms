"use client";

import { useEffect, useState } from "react";

import { getReminderStats } from "@/connectors/manager/reminders";
import type { ReminderStatsModel } from "@/models/manager/rfq";

interface ReminderSummaryState {
  error: string | null;
  loading: boolean;
  stats: ReminderStatsModel | null;
}

export function useReminderSummary() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ReminderSummaryState>({
    error: null,
    loading: true,
    stats: null,
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({
      ...current,
      error: null,
      loading: true,
    }));

    async function load() {
      try {
        const stats = await getReminderStats();

        if (!active) {
          return;
        }

        setState({
          error: null,
          loading: false,
          stats,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          error:
            error instanceof Error
              ? error.message
              : "Reminder summary could not be loaded.",
          loading: false,
          stats: null,
        });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return {
    ...state,
    refresh: () => setReloadKey((value) => value + 1),
  };
}
