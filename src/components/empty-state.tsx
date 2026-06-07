import { Radar } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="relative flex flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center sm:p-12">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse at center, rgba(234,179,8,0.08), transparent 60%)",
        }}
        aria-hidden
      />

      {/* Radar icon with animated rings */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Pulsing concentric circles */}
        <span
          className="absolute inset-0 rounded-full border border-primary/15 animate-radar-ping"
          aria-hidden
        />
        <span
          className="absolute inset-2 rounded-full border border-primary/10 animate-radar-ping delay-500"
          aria-hidden
        />
        {/* Icon container */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted to-card shadow-lg shadow-black/20">
          <Radar className="h-7 w-7 text-primary animate-pulse-glow" aria-hidden />
        </div>
      </div>

      <div className="relative space-y-2 animate-fade-in-up delay-200">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}
