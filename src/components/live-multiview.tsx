import { MonitorPlay, Trash2 } from "lucide-react";

import type { LayoutOption } from "@/types/layout";
import { getLayoutCapacity, getLayoutGridClasses } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { LivePlayer } from "@/components/live-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function buildClearHref(layout: LayoutOption) {
  const params = new URLSearchParams();
  params.set("layout", layout);
  params.set("mv", "0");
  return `/?${params.toString()}#live`;
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
  const capacity = layout === "all" ? selectedStreams.length : getLayoutCapacity(layout);
  const visible = selectedStreams.slice(0, capacity);
  const placeholders =
    layout === "all" ? 0 : Math.max(0, capacity - visible.length);
  const overflow = Math.max(0, selectedStreams.length - visible.length);
  const clearHref = buildClearHref(layout);

  return (
    <section id="multiview" aria-label="Multi-stream viewing" className="space-y-3 animate-fade-in-up">
      {/* Multiview header bar */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2">
          {/* Gold accent bar */}
          <div className="h-6 w-1 rounded-full bg-primary/70" aria-hidden />
          <MonitorPlay className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold tracking-wider text-foreground">MULTI-VIEW</h2>
          <Badge variant="default">{selectedStreams.length}</Badge>
          {overflow > 0 ? (
            <span className="text-xs text-muted-foreground">
              Showing {visible.length} (layout capacity). Switch layout to view more.
            </span>
          ) : null}
        </div>
        <Button asChild variant="secondary" size="sm" aria-label="Clear multi-view selection">
          <a href={clearHref} target="_self">
            Clear
            <Trash2 className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </Card>

      {visible.length === 0 ? (
        <Card className="relative overflow-hidden p-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: "radial-gradient(ellipse at center, rgba(234,179,8,0.06), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="text-sm font-semibold text-foreground">
              Select streams to start multi-view
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Use the Multi-View button on any live card to add it here.
            </div>
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
          {placeholders > 0
            ? Array.from({ length: placeholders }).map((_, idx) => (
                <Card
                  key={`waiting-${idx}`}
                  aria-label="Waiting for livestream"
                  className="flex h-full flex-col overflow-hidden animate-fade-in"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 rounded-full bg-muted-foreground/30" aria-hidden />
                        <div className="text-xs font-semibold tracking-widest text-muted-foreground">
                          EMPTY SLOT
                        </div>
                      </div>
                      <Badge variant="secondary">WAITING</Badge>
                    </div>
                    <div className="relative flex flex-1 items-center justify-center bg-black px-4 py-10">
                      {/* Grid pattern background */}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(234,179,8,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.04) 1px, transparent 1px)",
                          backgroundSize: "30px 30px",
                        }}
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08),transparent_60%)]" />
                      <div className="relative text-center text-xs font-semibold tracking-widest text-muted-foreground">
                        WAITING FOR LIVESTREAM
                      </div>
                    </div>
                    <div className="border-t border-border bg-background px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">
                        Slot ini akan terisi otomatis saat ada streamer yang live.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : null}
        </div>
      )}
    </section>
  );
}
