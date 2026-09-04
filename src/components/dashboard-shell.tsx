"use client";

import { useCallback, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { LiveGrid } from "@/components/live-grid";
import { LiveMultiview } from "@/components/live-multiview";
import { LiveSidebar } from "@/components/live-sidebar";
import { StatsBar } from "@/components/stats-bar";
import { getLayoutCapacity, type LayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import type { Streamer } from "@/types/streamer";

function replaceQuery(updates: Record<string, string | null>) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
  }
  const qs = params.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(window.history.state, "", next);
}

export function DashboardShell({
  liveStreams,
  monitored,
  apiError,
  initialLayout,
  initialSidebarHidden,
  initialMultiviewEnabled,
  initialWatchIds,
}: {
  liveStreams: LiveStream[];
  monitored: Streamer[];
  apiError: string | null;
  initialLayout: LayoutOption;
  initialSidebarHidden: boolean;
  initialMultiviewEnabled: boolean;
  initialWatchIds: string[];
}) {
  const [layout, setLayout] = useState<LayoutOption>(initialLayout);
  const [sidebarHidden, setSidebarHidden] = useState(initialSidebarHidden);
  const [multiviewEnabled] = useState(initialMultiviewEnabled);
  const [watchIds] = useState(initialWatchIds);

  const totalMonitored = monitored.length;
  const totalLive = liveStreams.length;
  const capacity = getLayoutCapacity(layout);

  const selectedVideoIds = useMemo(() => {
    if (!multiviewEnabled) return [];
    const preferred =
      watchIds.length > 0
        ? watchIds
        : liveStreams.slice(0, capacity).map((s) => s.videoId);
    return Array.from(new Set(preferred));
  }, [capacity, liveStreams, multiviewEnabled, watchIds]);

  const liveByVideoId = useMemo(
    () => new Map(liveStreams.map((s) => [s.videoId, s] as const)),
    [liveStreams],
  );

  const selectedStreams = useMemo(
    () =>
      selectedVideoIds
        .map((id) => liveByVideoId.get(id))
        .filter((s): s is LiveStream => s !== undefined),
    [liveByVideoId, selectedVideoIds],
  );

  const remainingLiveStreams = useMemo(
    () =>
      selectedVideoIds.length > 0
        ? liveStreams.filter((s) => !selectedVideoIds.includes(s.videoId))
        : liveStreams,
    [liveStreams, selectedVideoIds],
  );

  const onLayoutChange = useCallback((next: LayoutOption) => {
    setLayout(next);
    replaceQuery({ layout: next });
  }, []);

  const onToggleSidebar = useCallback(() => {
    setSidebarHidden((prev) => {
      const next = !prev;
      replaceQuery({ sb: next ? "0" : null });
      return next;
    });
  }, []);

  return (
    <>
      <div id="stats" className="space-y-2.5 animate-fade-in-up delay-100 sm:space-y-4">
        <StatsBar totalMonitored={totalMonitored} totalLive={totalLive} />
        <LayoutSwitcher
          value={layout}
          sidebarHidden={sidebarHidden}
          onLayoutChange={onLayoutChange}
          onToggleSidebar={onToggleSidebar}
        />
      </div>

      <div
        className={`flex flex-col transition-all duration-300 ease-out lg:flex-row ${
          sidebarHidden ? "gap-0" : "gap-6"
        }`}
      >
        <div id="live" className="min-w-0 flex-1 space-y-3 sm:space-y-5">
          {apiError ? (
            <EmptyState title="Unable to fetch live status" description={apiError} />
          ) : totalLive === 0 ? (
            <EmptyState
              title="No channels are live right now"
              description="RAGE LIVE MONITOR will automatically refresh on the next scan. Keep the dashboard open."
            />
          ) : (
            <>
              {multiviewEnabled ? (
                <LiveMultiview
                  selectedStreams={selectedStreams}
                  layout={layout}
                  selectedVideoIds={selectedVideoIds}
                />
              ) : null}

              <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
                <h2 className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-foreground">
                  <span
                    className="inline-block h-4 w-1 rounded-full bg-primary shadow-[0_0_10px_rgba(234,179,8,0.45)]"
                    aria-hidden
                  />
                  Live Channels
                </h2>
                <div className="rounded-full border border-border/70 bg-card/50 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {remainingLiveStreams.length} shown
                </div>
              </div>
              <LiveGrid
                streams={remainingLiveStreams}
                layout={layout}
                selectedVideoIds={selectedVideoIds}
              />
            </>
          )}
        </div>

        <div
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
            sidebarHidden
              ? "m-0 max-h-0 w-full opacity-0 lg:max-h-none lg:w-0"
              : "max-h-[2000px] w-full opacity-100 lg:max-h-none lg:w-[360px]"
          }`}
        >
          <div
            className={`w-full lg:w-[360px] transition-transform duration-300 ease-out ${
              sidebarHidden ? "translate-x-8 lg:translate-x-[100%]" : "translate-x-0"
            }`}
          >
            <LiveSidebar streams={liveStreams} monitored={monitored} />
          </div>
        </div>
      </div>
    </>
  );
}
