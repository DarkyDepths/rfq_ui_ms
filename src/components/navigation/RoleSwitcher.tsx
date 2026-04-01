"use client";

import { motion } from "framer-motion";

import { useRole } from "@/context/role-context";
import type { AppRole } from "@/models/ui/role";

const roles: Array<{
  value: AppRole;
  label: string;
  description: string;
}> = [
  {
    value: "manager",
    label: "Manager",
    description: "Portfolio control",
  },
  {
    value: "worker",
    label: "Worker",
    description: "Execution focus",
  },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-1">
      <div className="grid grid-cols-2 gap-1">
        {roles.map((option) => (
          <button
            key={option.value}
            className="relative min-w-[118px] rounded-xl px-3 py-2 text-left"
            onClick={() => setRole(option.value)}
            type="button"
          >
            {role === option.value ? (
              <motion.div
                className="absolute inset-0 rounded-xl border border-steel-500/35 bg-steel-500/16"
                layoutId="role-switch-surface"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            ) : null}
            <div className="relative">
              <div className="text-sm font-semibold text-foreground">
                {option.label}
              </div>
              <div className="text-[0.72rem] text-muted">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
