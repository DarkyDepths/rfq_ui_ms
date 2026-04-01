import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-foreground",
        steel: "border-steel-500/30 bg-steel-500/12 text-steel-300",
        gold: "border-gold-500/30 bg-gold-500/12 text-gold-300",
        emerald: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
        rose: "border-rose-500/30 bg-rose-500/12 text-rose-300",
        pending: "border-slate-500/30 bg-slate-500/12 text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
