import { ExternalLink, X, Youtube } from "lucide-react";

import type { LayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { Badge, LiveDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { YoutubeLiveEmbed } from "@/components/youtube-live-embed";

function buildDashboardHref(layout: LayoutOption, watchIds: string[]) {
  const params = new URLSearchParams();
  params.set("layout", layout);
  if (watchIds.length === 0) {
    params.set("mv", "0");
  } else {
    params.set("mv", "1");
    for (const id of watchIds) params.append("watch", id);
  }
  const qs = params.toString();
  return watchIds.length > 0 ? `/?${qs}#multiview` : `/?${qs}#live`;
}

export function LivePlayer({
  stream,
  layout,
  selectedVideoIds,
  loadIndex = 0,
}: {
  stream: LiveStream;
  layout: LayoutOption;
  selectedVideoIds: string[];
  loadIndex?: number;
}) {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(
    stream.videoId,
  )}`;
  const tiktokUrl = stream.tiktokUrl;

  const removeHref = buildDashboardHref(
    layout,
    selectedVideoIds.filter((id) => id !== stream.videoId),
  );

  return (
    <Card className="overflow-hidden hover:border-primary/25 hover:shadow-[0_0_28px_rgba(234,179,8,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-gradient-to-r from-background via-card to-background px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="h-8 w-1 shrink-0 rounded-full bg-primary/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]"
            aria-hidden
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-bold tracking-wide text-primary">
                {stream.streamerName}
              </div>
              <Badge variant="live" className="flex items-center gap-1">
                <LiveDot className="h-1.5 w-1.5" />
                LIVE
              </Badge>
            </div>
            <div className="truncate text-xs text-muted-foreground" title={stream.title}>
              {stream.title}
            </div>
          </div>
        </div>
        <Button
          asChild
          variant="secondary"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={`Remove ${stream.streamerName} from multi-view`}
        >
          <a href={removeHref} target="_self">
            <X className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </div>

      <CardContent className="p-0">
        <div className="relative aspect-video w-full bg-black">
          <YoutubeLiveEmbed
            videoId={stream.videoId}
            title={`YouTube player for ${stream.streamerName}`}
            startDelayMs={loadIndex * 450}
          />
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-border/80 bg-background/90 px-3 py-2">
        {tiktokUrl ? (
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="h-7 rounded-full px-3 text-[11px] text-muted-foreground hover:text-foreground"
            aria-label={`Open ${stream.streamerName} on TikTok`}
          >
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              TikTok
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </Button>
        ) : null}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${stream.streamerName} on YouTube`}
          className="group inline-flex h-7 items-center gap-1.5 rounded-full border border-primary/40 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_0_16px_rgba(234,179,8,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]"
        >
          <Youtube className="h-3.5 w-3.5" aria-hidden />
          Watch
          <ExternalLink
            className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </a>
      </CardFooter>
    </Card>
  );
}
