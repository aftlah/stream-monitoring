"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowUp, Crosshair, ListVideo } from "lucide-react";

import type { LiveStream } from "@/types/live-stream";
import { SearchStreamer } from "@/components/search-streamer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function LiveSidebar({ streams }: { streams: LiveStream[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (q.length === 0) return streams;
    return streams.filter((s) => {
      const haystack = `${s.streamerName} ${s.title}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, streams]);

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
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No matches for “{query}”.
            </div>
          ) : (
            filtered.map((s) => (
              <Fragment key={s.channelId}>
                <a
                  href={`#stream-${s.channelId}`}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-primary" aria-hidden />
            Quick Nav
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href="#top" aria-label="Jump to top">
              Top
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="#stats" aria-label="Jump to statistics">
              Statistics
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="#live" aria-label="Jump to live grid">
              Live Grid
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href="#multiview" aria-label="Jump to multi-view">
              Multi-View
            </a>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
