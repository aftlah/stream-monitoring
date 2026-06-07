import { MonitorPlay, Trash2 } from "lucide-react";

import type { LayoutOption } from "@/types/layout";
import { getLayoutCapacity, getLayoutGridClasses } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { LivePlayer } from "@/components/live-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function buildClearHref(layout: LayoutOption) {
  const params = new URLSearchParams();
  params.set("layout", layout);
  return `/?${params.toString()}#multiview`;
}

export function LiveMultiview({
  selectedStreams,
  layout,
  selectedVideoIds,
}: {
  selectedStreams: LiveStream[];
  layout: LayoutOption;
  selectedVideoIds: string[];
}) {
  const capacity = getLayoutCapacity(layout);
  const visible = selectedStreams.slice(0, capacity);
  const overflow = Math.max(0, selectedStreams.length - visible.length);
  const clearHref = buildClearHref(layout);

  return (
    <section id="multiview" aria-label="Multi-stream viewing" className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <MonitorPlay className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">MULTI-VIEW</h2>
          <Badge variant="default">{selectedStreams.length}</Badge>
          {overflow > 0 ? (
            <span className="text-xs text-muted-foreground">
              Showing {visible.length} (layout capacity). Switch layout to view more.
            </span>
          ) : null}
        </div>
        <Button asChild variant="secondary" size="sm" aria-label="Clear multi-view selection">
          <a href={clearHref}>
            Clear
            <Trash2 className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </Card>

      {visible.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm font-semibold text-foreground">
            Select streams to start multi-view
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Use the Multi-View button on any live card to add it here.
          </div>
        </Card>
      ) : (
        <div className={`grid gap-3 ${getLayoutGridClasses(layout)}`}>
          {visible.map((stream) => (
            <LivePlayer
              key={stream.videoId}
              stream={stream}
              layout={layout}
              selectedVideoIds={selectedVideoIds}
            />
          ))}
        </div>
      )}
    </section>
  );
}
