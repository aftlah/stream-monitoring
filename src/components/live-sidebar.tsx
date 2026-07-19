"use client";

import { Fragment, useMemo, useState } from "react";
import { Crosshair, ExternalLink, ListVideo } from "lucide-react";

import type { LiveStream } from "@/types/live-stream";
import type { Streamer } from "@/types/streamer";
import { SearchStreamer } from "@/components/search-streamer";
import { Badge, LiveDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function toTiktokLiveUrl(tiktokUrl: string): string {
  try {
    const url = new URL(tiktokUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const at = parts.find((p) => p.startsWith("@"));
    if (!at) return tiktokUrl;
    const handle = at.slice(1).trim();
    if (handle.length === 0) return tiktokUrl;
    return `https://m.tiktok.com/@${encodeURIComponent(handle)}/live`;
  } catch {
    return tiktokUrl;
  }
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
      className="space-y-3 lg:sticky lg:top-4 animate-fade-in-up"
    >
      <h2 id="sidebar-title" className="sr-only">
        Sidebar
      </h2>

      {/* Search card */}
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

      {/* Streamer list */}
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
                    {s.isTiktokOnly ? (
                      <div className="text-[11px] text-muted-foreground">
                        TikTok account
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {s.isTiktokOnly ? <Badge variant="secondary">TIKTOK</Badge> : null}
                    {s.isLive ? (
                      <Badge variant="live" className="flex items-center gap-1">
                        <LiveDot className="h-1.5 w-1.5" />
                        LIVE
                      </Badge>
                    ) : (
                      <Badge variant="secondary">OFFLINE</Badge>
                    )}

                    {s.channelId && s.isLive ? (
                      <a
                        href={`#stream-${s.channelId}`}
                        target="_self"
                        className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                          href={toTiktokLiveUrl(s.tiktokUrl)}
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
    </aside>
  );
}
