"use client";

import Link from "next/link";
import { LayoutGrid, ListFilter, PlusSquare, Search } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { RFQCard } from "@/components/rfq/RFQCard";
import { RFQTable } from "@/components/rfq/RFQTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/role-context";
import { useRfqList } from "@/hooks/use-rfq-list";
import type { RfqCardModel } from "@/models/manager/rfq";

const statusOptions: Array<{
  label: string;
  value: "all" | RfqCardModel["status"];
}> = [
  { label: "All", value: "all" },
  { label: "In Preparation", value: "in_preparation" },
  { label: "Under Review", value: "under_review" },
  { label: "Submitted", value: "submitted" },
  { label: "Won", value: "won" },
  { label: "Partial / Warning", value: "attention_required" },
];

export function RFQListScreen() {
  const { role } = useRole();
  const {
    filteredRfqs,
    loading,
    search,
    setSearch,
    setStatusFilter,
    statusFilter,
    viewMode,
    setViewMode,
  } = useRfqList();

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="section-kicker">
              <ListFilter className="h-3.5 w-3.5" />
              RFQ queue shell
            </div>
            <h1 className="mt-4 text-display text-4xl font-semibold text-foreground">
              Operational RFQ list
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
              Search, scan, and open RFQs through the same boundary that will later connect to manager and intelligence services.
            </p>
          </div>
          {role === "manager" ? (
            <Button asChild size="lg" variant="outline">
              <Link href="/rfqs/new">
                <PlusSquare className="h-4 w-4" />
                Create RFQ
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-11"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search RFQ ID, title, client, owner, or region"
              value={search}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setViewMode("table")}
              variant={viewMode === "table" ? "default" : "secondary"}
            >
              Table
            </Button>
            <Button
              onClick={() => setViewMode("cards")}
              variant={viewMode === "cards" ? "default" : "secondary"}
            >
              <LayoutGrid className="h-4 w-4" />
              Cards
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              size="sm"
              variant={statusFilter === option.value ? "outline" : "secondary"}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <SkeletonCard className="h-[280px]" lines={6} />
          <SkeletonCard className="h-[280px]" lines={6} />
          <SkeletonCard className="h-[280px]" lines={6} />
        </div>
      ) : filteredRfqs.length === 0 ? (
        <EmptyState
          actionLabel="Reset Filters"
          description="No RFQs matched the current search and filter combination. Reset the demo controls to bring the queue back."
          onAction={() => {
            setSearch("");
            setStatusFilter("all");
          }}
          title="No RFQs in the current view"
        />
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredRfqs.map((rfq, index) => (
            <RFQCard key={rfq.id} index={index} rfq={rfq} />
          ))}
        </div>
      ) : (
        <RFQTable items={filteredRfqs} />
      )}
    </div>
  );
}
