import { Eye, Radio, Users } from "lucide-react";
import type { ReactNode } from "react";

import { SCAN_INTERVAL_SECONDS } from "@/lib/youtube";
import { NextScanCountdown } from "@/components/next-scan-countdown";
import { Card } from "@/components/ui/card";

function StatCard({
  label,
  value,
  icon,
  glowColor,
  iconGradient,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  glowColor?: string;
  iconGradient?: string;
}) {
  return (
    <Card className="group relative overflow-hidden">
      {/* Subtle radial glow behind the card */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${glowColor ?? "rgba(234,179,8,0.06)"}, transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-foreground">
            {value}
          </div>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30"
          style={{
            background: iconGradient ?? "linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)",
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
    <section aria-label="Statistics" className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="Total Monitored"
        value={totalMonitored}
        icon={<Users className="h-5 w-5 text-primary" aria-hidden />}
        iconGradient="linear-gradient(135deg, rgba(234,179,8,0.1) 0%, var(--card) 100%)"
        glowColor="rgba(234,179,8,0.06)"
      />
      <StatCard
        label="Live Now"
        value={
          <span className="flex items-center gap-2">
            {totalLive}
            {totalLive > 0 ? (
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-danger animate-dot-pulse" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
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
        value={<NextScanCountdown seconds={SCAN_INTERVAL_SECONDS} />}
        icon={<Eye className="h-5 w-5 text-primary" aria-hidden />}
        iconGradient="linear-gradient(135deg, rgba(234,179,8,0.1) 0%, var(--card) 100%)"
        glowColor="rgba(234,179,8,0.06)"
      />
    </section>
  );
}
