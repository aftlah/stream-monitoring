import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { getMonitoredStreamers } from "@/lib/streamers";
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
              description="Add channel entries to /data/streamers.json (name + channelId) to start monitoring."
            />
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  let liveStreams: LiveStream[] = [];
  let apiError: string | null = null;

  try {
    liveStreams = await getLiveStreamsForStreamers(monitored);
  } catch (err) {
    apiError = err instanceof Error ? err.message : "Unknown YouTube API error.";
  }

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main
        id="content"
        className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8"
      >
        <div className="space-y-4 sm:space-y-7">
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

          <DashboardShell
            liveStreams={liveStreams}
            monitored={monitored}
            apiError={apiError}
            initialLayout={layout}
            initialSidebarHidden={sidebarHidden}
            initialMultiviewEnabled={multiviewEnabled}
            initialWatchIds={requestedWatchIds}
          />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
