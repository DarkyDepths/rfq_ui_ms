import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

export function PlatformWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="section-kicker">RFQ Intelligence</p>
      <div className="text-display text-xl font-semibold leading-tight text-foreground">
        {appConfig.name}
      </div>
      <p className="max-w-md text-sm text-muted">{appConfig.platformLine}</p>
    </div>
  );
}
