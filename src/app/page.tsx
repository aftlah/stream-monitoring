import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { EmptyState } from "@/components/empty-state";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { LiveGrid } from "@/components/live-grid";
import { LiveMultiview } from "@/components/live-multiview";
import { LiveSidebar } from "@/components/live-sidebar";
import { StatsBar } from "@/components/stats-bar";
import { TiktokLiveCard } from "@/components/tiktok-live-card";
import { getMonitoredStreamers } from "@/lib/streamers";
import { getTiktokLiveStatuses } from "@/lib/tiktok";
import { getLiveStreamsForStreamers } from "@/lib/youtube";
import { parseLayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const layout = parseLayoutOption(
    typeof resolvedSearchParams?.layout === "string"
      ? resolvedSearchParams.layout
      : undefined,
  );

  const watchParam = resolvedSearchParams?.watch;
  const requestedWatchIds = Array.isArray(watchParam)
    ? watchParam
    : typeof watchParam === "string" && watchParam.length > 0
      ? [watchParam]
      : [];
  const selectedVideoIds = Array.from(new Set(requestedWatchIds));

  const monitored = await getMonitoredStreamers();

  if (monitored.length === 0) {
    return (
      <div id="top" className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main
          id="content"
          className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6"
        >
          <div className="space-y-4">
            <EmptyState
              title="No monitored channels configured"
              description="Add channel entries to /data/streamers.json (name + channelId, optional tiktokUrl) to start monitoring."
            />
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  let liveStreams: LiveStream[] = [];
  let apiError: string | null = null;
  let tiktokLive: { name: string; tiktokUrl: string }[] = [];

  try {
    liveStreams = await getLiveStreamsForStreamers(monitored);
  } catch (err) {
    apiError = err instanceof Error ? err.message : "Unknown YouTube API error.";
  }

  const totalMonitored = monitored.length;
  try {
    const tiktokCandidates = monitored
      .filter((s) => typeof s.tiktokUrl === "string" && s.tiktokUrl.length > 0)
      .map((s) => ({ name: s.name, tiktokUrl: s.tiktokUrl! }));

    const statuses = await getTiktokLiveStatuses(
      tiktokCandidates.map((x) => x.tiktokUrl),
    );
    const liveSet = new Set(
      statuses.filter((s) => s.isLive).map((s) => s.tiktokUrl),
    );
    tiktokLive = tiktokCandidates.filter((c) => liveSet.has(c.tiktokUrl));
  } catch {
    tiktokLive = [];
  }

  const totalLive = liveStreams.length + tiktokLive.length;
  const liveByVideoId = new Map(liveStreams.map((s) => [s.videoId, s] as const));
  const selectedStreams = selectedVideoIds
    .map((id) => liveByVideoId.get(id))
    .filter((s): s is LiveStream => s !== undefined);
  const remainingLiveStreams =
    selectedVideoIds.length > 0
      ? liveStreams.filter((s) => !selectedVideoIds.includes(s.videoId))
      : liveStreams;

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main
        id="content"
        className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6"
      >
        <div className="space-y-4">
          <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Multi-stream monitoring for channels that are live right now.
            </p>
          </header>

          <div id="stats" className="space-y-4">
            <StatsBar totalMonitored={totalMonitored} totalLive={totalLive} />
            <LayoutSwitcher value={layout} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div id="live" className="space-y-4">
              {apiError ? (
                <EmptyState
                  title="Unable to fetch live status"
                  description={apiError}
                />
              ) : totalLive === 0 ? (
                <EmptyState
                  title="No channels are live right now"
                  description="RAGE LIVE MONITOR will automatically refresh on the next scan. Keep the dashboard open."
                />
              ) : (
                <>
                  <LiveMultiview
                    selectedStreams={selectedStreams}
                    layout={layout}
                    selectedVideoIds={selectedVideoIds}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Live Channels
                    </h2>
                    <div className="text-xs text-muted-foreground">
                      {remainingLiveStreams.length} shown
                    </div>
                  </div>
                  <LiveGrid
                    streams={remainingLiveStreams}
                    layout={layout}
                    selectedVideoIds={selectedVideoIds}
                  />
                  {tiktokLive.length > 0 ? (
                    <section aria-label="TikTok live" className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-foreground">
                          TikTok Live
                        </h2>
                        <div className="text-xs text-muted-foreground">
                          {tiktokLive.length} live
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {tiktokLive.map((t) => (
                          <TiktokLiveCard
                            key={t.tiktokUrl}
                            name={t.name}
                            tiktokUrl={t.tiktokUrl}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </>
              )}
            </div>

            <LiveSidebar
              streams={liveStreams}
              monitored={monitored}
              tiktokLive={tiktokLive}
            />
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
