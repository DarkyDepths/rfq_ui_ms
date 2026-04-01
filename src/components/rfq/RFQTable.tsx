"use client";

import Link from "next/link";
import { ArrowUpDown, CalendarDays, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { RFQStatusChip } from "@/components/rfq/RFQStatusChip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { RfqCardModel } from "@/models/manager/rfq";

type SortField = "client" | "due" | "status";
type SortDirection = "asc" | "desc";

function sortItems(
  items: RfqCardModel[],
  field: SortField,
  direction: SortDirection,
) {
  const factor = direction === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    switch (field) {
      case "client":
        return left.client.localeCompare(right.client) * factor;
      case "status":
        return left.statusLabel.localeCompare(right.statusLabel) * factor;
      case "due":
      default:
        return left.dueLabel.localeCompare(right.dueLabel) * factor;
    }
  });
}

export function RFQTable({ items }: { items: RfqCardModel[] }) {
  const [sortField, setSortField] = useState<SortField>("due");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const sortedItems = sortItems(items, sortField, sortDirection);

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            RFQ Queue
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            Operational and intelligence-aligned records
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <CalendarDays className="h-4 w-4" />
          Sorted by {sortField.replace("_", " ")}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RFQ</TableHead>
            <TableHead>
              <Button onClick={() => toggleSort("client")} size="sm" variant="ghost">
                Client
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>
              <Button onClick={() => toggleSort("due")} size="sm" variant="ghost">
                Due Date
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => (
            <motion.tr
              key={item.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.35, delay: 0.32 + index * 0.05 }}
              className="border-b border-white/6 transition-colors hover:bg-white/[0.03]"
            >
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {item.id} • {item.valueLabel}
                  </div>
                </div>
              </TableCell>
              <TableCell>{item.client}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <RFQStatusChip status={item.status} />
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-foreground">{item.stageLabel}</div>
                <div className="text-xs text-muted">{item.nextAction}</div>
              </TableCell>
              <TableCell>{item.dueLabel}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/rfqs/${item.id}`}>
                    Detail
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
