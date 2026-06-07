import { ExternalLink, X } from "lucide-react";

import type { LayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
}: {
  stream: LiveStream;
  layout: LayoutOption;
  selectedVideoIds: string[];
}) {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(
    stream.videoId,
  )}`;
  const tiktokUrl = stream.tiktokUrl;

  const removeHref = buildDashboardHref(
    layout,
    selectedVideoIds.filter((id) => id !== stream.videoId),
  );

  const embedSrc = new URL(
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(stream.videoId)}`,
  );
  embedSrc.searchParams.set("autoplay", "1");
  embedSrc.searchParams.set("mute", "1");
  embedSrc.searchParams.set("playsinline", "1");
  embedSrc.searchParams.set("rel", "0");
  embedSrc.searchParams.set("modestbranding", "1");
  embedSrc.searchParams.set("controls", "1");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-primary">
              {stream.streamerName}
            </div>
            <Badge variant="live">LIVE</Badge>
          </div>
          <div className="truncate text-xs text-muted-foreground" title={stream.title}>
            {stream.title}
          </div>
        </div>
        <Button
          asChild
          variant="secondary"
          size="icon"
          aria-label={`Remove ${stream.streamerName} from multi-view`}
        >
          <a href={removeHref} target="_self">
            <X className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </div>

      <CardContent className="p-0">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedSrc.toString()}
            title={`YouTube player for ${stream.streamerName}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        {tiktokUrl ? (
          <Button
            asChild
            size="sm"
            variant="secondary"
            aria-label={`Open ${stream.streamerName} on TikTok`}
          >
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              TikTok
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        ) : null}
        <Button asChild size="sm" aria-label={`Open ${stream.streamerName} on YouTube`}>
          <a href={watchUrl} target="_blank" rel="noopener noreferrer">
            Open on YouTube
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
