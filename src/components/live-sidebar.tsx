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

  const filteredLive = useMemo(() => {
    const q = normalize(query);
    if (q.length === 0) return streams;
    return streams.filter((s) => {
      const haystack = `${s.streamerName} ${s.title}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, streams]);

  const tiktokOnly = useMemo(() => {
    const q = normalize(query);
    const candidates = monitored.filter(
      (s) => typeof s.tiktokUrl === "string" && s.tiktokUrl.length > 0,
    );
    const withNoYouTube = candidates.filter((s) => !s.channelId);
    if (q.length === 0) return withNoYouTube;
    return withNoYouTube.filter((s) => s.name.toLowerCase().includes(q));
  }, [monitored, query]);

  const filteredTiktokLive = useMemo(() => {
    const q = normalize(query);
    if (q.length === 0) return tiktokLive;
    return tiktokLive.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, tiktokLive]);

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
              Live List
            </span>
            <Badge variant="default">{streams.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {filteredLive.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No matches for “{query}”.
            </div>
          ) : (
            filteredLive.map((s) => (
              <Fragment key={s.channelId}>
                <a
                  href={`#stream-${s.channelId}`}
                  target="_self"
                  className="flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2 text-sm text-foreground hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Jump to ${s.streamerName}`}
                >
                  <span className="min-w-0 truncate">{s.streamerName}</span>
                  <Badge variant="live">LIVE</Badge>
                </a>
              </Fragment>
            ))
          )}
        </CardContent>
      </Card>

      {filteredTiktokLive.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">TikTok Live</span>
              <Badge variant="default">{filteredTiktokLive.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {filteredTiktokLive.map((s) => (
              <div
                key={s.tiktokUrl}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-foreground"
              >
                <div className="min-w-0">
                  <div className="truncate">{s.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="live">LIVE</Badge>
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {tiktokOnly.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">TikTok</span>
              <Badge variant="default">{tiktokOnly.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {tiktokOnly.map((s) => (
              <div
                key={s.tiktokUrl}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-foreground"
              >
                <div className="min-w-0">
                  <div className="truncate">{s.name}</div>
                  {s.tiktokForceLive ? (
                    <div className="text-xs text-muted-foreground">
                      Manual (not auto-detected)
                    </div>
                  ) : null}
                </div>
                <Button asChild size="sm" variant="secondary" aria-label={`Open ${s.name} on TikTok`}>
                  <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer">
                    Open
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

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
