import type { LayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { LiveCard } from "@/components/live-card";
import { getLayoutCapacity, getLayoutGridClasses } from "@/types/layout";

export function LiveGrid({
  streams,
  layout,
  selectedVideoIds,
}: {
  streams: LiveStream[];
  layout: LayoutOption;
  selectedVideoIds: string[];
}) {
  const capacity = layout === "all" ? streams.length : getLayoutCapacity(layout);
  const visible = streams.slice(0, capacity);

  return (
    <section aria-label="Live streams" className="min-w-0">
      <div className={`grid gap-3 ${getLayoutGridClasses(layout)}`}>
        {visible.map((stream, i) => (
          <LiveCard
            key={stream.channelId}
            stream={stream}
            layout={layout}
            selectedVideoIds={selectedVideoIds}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
