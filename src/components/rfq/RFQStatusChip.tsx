"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import type { ManagerRfqStatus } from "@/models/manager/rfq";
import { rfqStatusMeta } from "@/utils/status";

export function RFQStatusChip({ status }: { status: ManagerRfqStatus }) {
  const meta = rfqStatusMeta[status];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0.6, y: 6 }}
      transition={{ duration: 0.24 }}
    >
      <Badge variant={meta.tone}>{meta.label}</Badge>
    </motion.div>
  );
}
