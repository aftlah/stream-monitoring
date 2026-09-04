"use client";

import { Fragment, useMemo, useState } from "react";
import { Crosshair, ListVideo } from "lucide-react";

import type { LiveStream } from "@/types/live-stream";
import type { Streamer } from "@/types/streamer";
import { SearchStreamer } from "@/components/search-streamer";
import { Badge, LiveDot } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function LiveSidebar({
  streams,
  monitored,
}: {
  streams: LiveStream[];
  monitored: Streamer[];
}) {
  const [query, setQuery] = useState("");

  const liveByChannelId = useMemo(() => {
    return new Set(streams.map((s) => s.channelId));
  }, [streams]);

  const filteredMonitored = useMemo(() => {
    const q = normalize(query);
    const candidates = monitored.map((s) => {
      const isLive = liveByChannelId.has(s.channelId);
      return {
        key: `yt:${s.channelId}`,
        name: s.name,
        channelId: s.channelId,
        isLive,
      };
    });

    if (q.length === 0) return candidates;
    return candidates.filter((s) => s.name.toLowerCase().includes(q));
  }, [liveByChannelId, monitored, query]);

  const totalLiveInSidebar = useMemo(() => {
    return filteredMonitored.reduce((acc, s) => acc + (s.isLive ? 1 : 0), 0);
  }, [filteredMonitored]);

  return (
    <aside
      aria-labelledby="sidebar-title"
      className="space-y-3 lg:sticky lg:top-4 animate-fade-in-up"
    >
      <h2 id="sidebar-title" className="sr-only">
        Sidebar
      </h2>

      <Card className="relative shrink-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
          aria-hidden
        />
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Crosshair className="h-4 w-4" aria-hidden />
            Target Search
          </CardTitle>
          <SearchStreamer value={query} onChange={setQuery} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <ListVideo className="h-4 w-4 text-primary" aria-hidden />
              Streamer List
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="default">{monitored.length}</Badge>
              <Badge variant="live" className="flex items-center gap-1.5">
                <LiveDot />
                {totalLiveInSidebar}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="scroll-fade max-h-[70vh] space-y-0.5 overflow-auto lg:max-h-[calc(100vh-14rem)]">
          {filteredMonitored.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No matches for {query.length > 0 ? `\u201c${query}\u201d` : "your filter"}.
            </div>
          ) : (
            filteredMonitored.map((s) => (
              <Fragment key={s.key}>
                <div
                  className={`group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-all duration-200 ${
                    s.isLive
                      ? "border-l-[3px] border-l-primary/70 bg-primary/[0.03] text-foreground hover:bg-primary/[0.06]"
                      : "border-l-[3px] border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`truncate font-medium ${s.isLive ? "text-foreground" : ""}`}>
                      {s.name}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {s.isLive ? (
                      <Badge variant="live" className="flex items-center gap-1">
                        <LiveDot className="h-1.5 w-1.5" />
                        LIVE
                      </Badge>
                    ) : (
                      <Badge variant="secondary">OFFLINE</Badge>
                    )}

                    {s.isLive ? (
                      <a
                        href={`#stream-${s.channelId}`}
                        target="_self"
                        className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Jump to ${s.name}`}
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                </div>
              </Fragment>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
