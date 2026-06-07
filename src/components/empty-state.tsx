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
    <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background">
        <Radar className="h-7 w-7 text-primary" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
