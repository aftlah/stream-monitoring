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
import { getLayoutCapacity, parseLayoutOption } from "@/types/layout";
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

  const multiviewEnabled = resolvedSearchParams?.mv !== "0";
  const sidebarHidden = resolvedSearchParams?.sb === "0";

  const watchParam = resolvedSearchParams?.watch;
  const requestedWatchIds = Array.isArray(watchParam)
    ? watchParam
    : typeof watchParam === "string" && watchParam.length > 0
      ? [watchParam]
      : [];

  const monitored = await getMonitoredStreamers();

  if (monitored.length === 0) {
    return (
      <div id="top" className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main
          id="content"
          className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6"
        >
          <div className="space-y-6">
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
  const capacity = getLayoutCapacity(layout);

  const selectedVideoIds = multiviewEnabled
    ? Array.from(
        new Set(
          requestedWatchIds.length > 0
            ? requestedWatchIds
            : liveStreams.slice(0, capacity).map((s) => s.videoId),
        ),
      )
    : [];

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
        className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8"
      >
        <div className="space-y-4 sm:space-y-7">
          {/* Dashboard title */}
          <header className="animate-fade-in-up">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/60 pb-2.5 sm:gap-3 sm:pb-4">
              <div className="space-y-0.5 sm:space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                  Operations
                </p>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Dashboard
                </h1>
                <p className="hidden max-w-xl text-sm text-muted-foreground sm:block">
                  Multi-stream monitoring for channels that are live right now.
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-medium text-primary sm:flex">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inset-0 rounded-full bg-primary animate-dot-pulse" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                System online
              </div>
            </div>
          </header>

          {/* Stats + Layout */}
          <div id="stats" className="space-y-2.5 animate-fade-in-up delay-100 sm:space-y-4">
            <StatsBar totalMonitored={totalMonitored} totalLive={totalLive} />
            <LayoutSwitcher value={layout} sidebarHidden={sidebarHidden} />
          </div>

          {/* Main content layout (Flex for smooth animation) */}
          <div
            className={`flex flex-col lg:flex-row transition-all duration-500 ease-in-out ${
              sidebarHidden ? "gap-0" : "gap-6"
            }`}
          >
            <div id="live" className="flex-1 space-y-3 min-w-0 transition-all duration-500 sm:space-y-5">
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
                  {multiviewEnabled ? (
                    <LiveMultiview
                      selectedStreams={selectedStreams}
                      layout={layout}
                      selectedVideoIds={selectedVideoIds}
                    />
                  ) : null}

                  {/* Live Channels section header */}
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

                  {/* TikTok Live section */}
                  {tiktokLive.length > 0 ? (
                    <section aria-label="TikTok live" className="space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
                        <h2 className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-foreground">
                          <span
                            className="inline-block h-4 w-1 rounded-full bg-gradient-to-b from-[#25F4EE] to-[#FE2C55]"
                            aria-hidden
                          />
                          TikTok Live
                        </h2>
                        <div className="rounded-full border border-border/70 bg-card/50 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
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

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out shrink-0 ${
                sidebarHidden
                  ? "w-full lg:w-0 max-h-0 lg:max-h-none opacity-0 m-0"
                  : "w-full lg:w-[360px] max-h-[2000px] lg:max-h-none opacity-100"
              }`}
            >
              <div
                className={`w-full lg:w-[360px] transition-transform duration-500 ease-in-out ${
                  sidebarHidden ? "translate-x-8 lg:translate-x-[100%]" : "translate-x-0"
                }`}
              >
                <LiveSidebar
                  streams={liveStreams}
                  monitored={monitored}
                  tiktokLive={tiktokLive}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
