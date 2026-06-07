"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowUp, Crosshair, ExternalLink, ListVideo } from "lucide-react";

import type { LiveStream } from "@/types/live-stream";
import type { Streamer } from "@/types/streamer";
import { SearchStreamer } from "@/components/search-streamer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function LiveSidebar({
  streams,
  monitored,
  tiktokLive,
}: {
  streams: LiveStream[];
  monitored: Streamer[];
  tiktokLive: { name: string; tiktokUrl: string }[];
}) {
  const [query, setQuery] = useState("");

  const liveByChannelId = useMemo(() => {
    return new Set(streams.map((s) => s.channelId));
  }, [streams]);

  const tiktokLiveByUrl = useMemo(() => {
    return new Set(tiktokLive.map((t) => t.tiktokUrl));
  }, [tiktokLive]);

  const filteredMonitored = useMemo(() => {
    const q = normalize(query);
    const candidates = monitored
      .filter((s) => Boolean(s.channelId) || Boolean(s.tiktokUrl))
      .map((s) => {
        const channelId = s.channelId;
        const tiktokUrl = s.tiktokUrl;
        const isYoutubeLive = channelId ? liveByChannelId.has(channelId) : false;
        const isTiktokLive = tiktokUrl ? tiktokLiveByUrl.has(tiktokUrl) : false;
        const isLive = isYoutubeLive || isTiktokLive;

        return {
          key: channelId ? `yt:${channelId}` : tiktokUrl ? `tt:${tiktokUrl}` : s.name,
          name: s.name,
          channelId,
          tiktokUrl,
          isLive,
          isTiktokOnly: !channelId && Boolean(tiktokUrl),
        };
      });

    if (q.length === 0) return candidates;
    return candidates.filter((s) => s.name.toLowerCase().includes(q));
  }, [liveByChannelId, monitored, query, tiktokLiveByUrl]);

  const totalLiveInSidebar = useMemo(() => {
    return filteredMonitored.reduce((acc, s) => acc + (s.isLive ? 1 : 0), 0);
  }, [filteredMonitored]);

  return (
    <aside
      aria-labelledby="sidebar-title"
      className="space-y-3 lg:sticky lg:top-4 lg:h-[calc(100vh-5rem)] lg:overflow-auto"
    >
      <h2 id="sidebar-title" className="sr-only">
        Sidebar
      </h2>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-primary" aria-hidden />
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
              <Badge variant="live">{totalLiveInSidebar}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {filteredMonitored.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No matches for {query.length > 0 ? `“${query}”` : "your filter"}.
            </div>
          ) : (
            filteredMonitored.map((s) => (
              <Fragment key={s.key}>
                <div className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-foreground">
                  <div className="min-w-0">
                    <div className="truncate">{s.name}</div>
                    {s.isTiktokOnly ? (
                      <div className="text-xs text-muted-foreground">
                        TikTok account
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {s.isTiktokOnly ? <Badge variant="secondary">TIKTOK</Badge> : null}
                    {s.isLive ? (
                      <Badge variant="live">LIVE</Badge>
                    ) : (
                      <Badge variant="secondary">OFFLINE</Badge>
                    )}

                    {s.channelId && s.isLive ? (
                      <a
                        href={`#stream-${s.channelId}`}
                        target="_self"
                        className="rounded-md border border-transparent px-2 py-1 text-xs text-foreground hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Jump to ${s.name}`}
                      >
                        View
                      </a>
                    ) : null}

                    {s.tiktokUrl ? (
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        aria-label={`Open ${s.name} on TikTok`}
                      >
                        <a
                          href={s.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Fragment>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-primary" aria-hidden />
            Quick Nav
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href="#top" target="_self" aria-label="Jump to top">
              Top
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="#stats" target="_self" aria-label="Jump to statistics">
              Statistics
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="#live" target="_self" aria-label="Jump to live grid">
              Live Grid
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="#multiview" target="_self" aria-label="Jump to multi-view">
              Multi-View
            </a>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
