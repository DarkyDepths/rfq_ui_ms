import Image from "next/image";

import { cn } from "@/lib/utils";

export function GHILogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/12 via-transparent to-steel-500/10 p-2.5",
        className,
      )}
    >
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#1E1610] ring-1 ring-gold-500/25">
        <Image
          alt="Al Bassam Group logo"
          className="object-contain p-1"
          fill
          priority
          sizes="44px"
          src="/brand/albassam-logo.png"
        />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-gold-300">
            Al Bassam Group
          </div>
          <div className="text-sm font-medium text-foreground/90">
            GHI Platform Identity
          </div>
        </div>
      ) : null}
    </div>
  );
}
