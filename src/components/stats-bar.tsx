import { Eye, Radio, Users } from "lucide-react";
import type { ReactNode } from "react";

import { SCAN_INTERVAL_SECONDS } from "@/lib/youtube";
import { NextScanCountdown } from "@/components/next-scan-countdown";
import { Card } from "@/components/ui/card";

function StatCard({
  label,
  shortLabel,
  value,
  icon,
  glowColor,
  iconGradient,
}: {
  label: string;
  shortLabel: string;
  value: ReactNode;
  icon: ReactNode;
  glowColor?: string;
  iconGradient?: string;
}) {
  return (
    <Card className="group relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 80% 40%, ${glowColor ?? "rgba(234,179,8,0.08)"}, transparent 65%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-60"
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-2 p-2.5 sm:gap-4 sm:p-5">
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px] sm:tracking-[0.2em]">
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
          <div className="mt-1 font-mono text-lg font-bold tabular-nums tracking-tight text-foreground sm:mt-2 sm:text-[1.75rem]">
            {value}
          </div>
        </div>
        <div
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/35 sm:flex"
          style={{
            background:
              iconGradient ??
              "linear-gradient(145deg, rgba(234,179,8,0.08) 0%, var(--muted) 100%)",
          }}
        >
          {icon}
        </div>
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
    <section aria-label="Statistics" className="grid grid-cols-3 gap-2 sm:gap-3">
      <StatCard
        label="Total Monitored"
        shortLabel="Monitored"
        value={totalMonitored}
        icon={<Users className="h-5 w-5 text-primary" aria-hidden />}
        iconGradient="linear-gradient(135deg, rgba(234,179,8,0.1) 0%, var(--card) 100%)"
        glowColor="rgba(234,179,8,0.06)"
      />
      <StatCard
        label="Live Now"
        shortLabel="Live"
        value={
          <span className="flex items-center gap-1.5 sm:gap-2">
            {totalLive}
            {totalLive > 0 ? (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-danger animate-dot-pulse" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-danger sm:h-2.5 sm:w-2.5" />
              </span>
            ) : null}
          </span>
        }
        icon={<Radio className="h-5 w-5 text-danger" aria-hidden />}
        iconGradient="linear-gradient(135deg, rgba(239,68,68,0.1) 0%, var(--card) 100%)"
        glowColor="rgba(239,68,68,0.06)"
      />
      <StatCard
        label="Next Scan"
        shortLabel="Scan"
        value={<NextScanCountdown seconds={SCAN_INTERVAL_SECONDS} />}
        icon={<Eye className="h-5 w-5 text-primary" aria-hidden />}
        iconGradient="linear-gradient(135deg, rgba(234,179,8,0.1) 0%, var(--card) 100%)"
        glowColor="rgba(234,179,8,0.06)"
      />
    </section>
  );
}
