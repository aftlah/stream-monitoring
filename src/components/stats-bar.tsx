import { Eye, Radio, Users } from "lucide-react";
import type { ReactNode } from "react";

import { SCAN_INTERVAL_SECONDS } from "@/lib/youtube";
import { NextScanCountdown } from "@/components/next-scan-countdown";
import { Card } from "@/components/ui/card";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
        {icon}
      </div>
    </Card>
  );
}

export function StatsBar({
  totalMonitored,
  totalLive,
}: {
  totalMonitored: number;
  totalLive: number;
}) {
  return (
    <section aria-label="Statistics" className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="TOTAL MONITORED"
        value={totalMonitored}
        icon={<Users className="h-5 w-5 text-primary" aria-hidden />}
      />
      <StatCard
        label="LIVE NOW"
        value={totalLive}
        icon={<Radio className="h-5 w-5 text-danger" aria-hidden />}
      />
      <StatCard
        label="NEXT SCAN"
        value={<NextScanCountdown seconds={SCAN_INTERVAL_SECONDS} />}
        icon={<Eye className="h-5 w-5 text-primary" aria-hidden />}
      />
    </section>
  );
}
