"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { listRfqs } from "@/connectors/manager/rfqs";
import type { RfqCardModel } from "@/models/manager/rfq";
import { apiConfig } from "@/config/api";

type ViewMode = "table" | "cards";

export function useRfqList() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState<RfqCardModel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RfqCardModel["status"]>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const items = await listRfqs({
          search: deferredSearch,
          size: 20,
          status: statusFilter,
        });

        if (!active) {
          return;
        }

        setError(null);
        setRfqs(items);
        setLoading(false);
      } catch (error) {
        if (!active) {
          return;
        }

        setError(
          error instanceof Error ? error.message : "RFQ list could not be loaded.",
        );
        setRfqs([]);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [deferredSearch, statusFilter]);

  const statusOptions: Array<{
    label: string;
    value: "all" | RfqCardModel["status"];
  }> = apiConfig.useMockData
    ? [
        { label: "All", value: "all" },
        { label: "In Preparation", value: "in_preparation" },
        { label: "Under Review", value: "under_review" },
        { label: "Submitted", value: "submitted" },
        { label: "Awarded", value: "awarded" },
        { label: "Partial / Warning", value: "attention_required" },
      ]
    : [
        { label: "All", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "In Preparation", value: "in_preparation" },
        { label: "Submitted", value: "submitted" },
        { label: "Awarded", value: "awarded" },
        { label: "Lost", value: "lost" },
        { label: "Cancelled", value: "cancelled" },
      ];

  return {
    error,
    loading,
    rfqs,
    filteredRfqs: rfqs,
    search,
    setSearch,
    statusFilter,
    statusOptions,
    setStatusFilter,
    viewMode,
    setViewMode,
  };
}
