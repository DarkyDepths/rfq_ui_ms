"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { listRfqs } from "@/connectors/manager/rfqs";
import type { RfqCardModel } from "@/models/manager/rfq";

type ViewMode = "table" | "cards";

export function useRfqList() {
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState<RfqCardModel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RfqCardModel["status"]>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function load() {
      const items = await listRfqs();

      if (!active) {
        return;
      }

      setRfqs(items);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredRfqs = rfqs.filter((rfq) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [rfq.id, rfq.title, rfq.client, rfq.owner, rfq.region]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesStatus = statusFilter === "all" || rfq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return {
    loading,
    rfqs,
    filteredRfqs,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
  };
}
