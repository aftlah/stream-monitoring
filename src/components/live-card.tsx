import Image from "next/image";
import { ExternalLink, MonitorUp } from "lucide-react";

import type { LayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { Badge, LiveDot } from "@/components/ui/badge";
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

export function LiveCard({
  stream,
  layout,
  selectedVideoIds,
  index = 0,
}: {
  stream: LiveStream;
  layout: LayoutOption;
  selectedVideoIds: string[];
  index?: number;
}) {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(
    stream.videoId,
  )}`;
  const tiktokUrl = stream.tiktokUrl;

  const isSelected = selectedVideoIds.includes(stream.videoId);
  const nextSelected = isSelected
    ? selectedVideoIds.filter((id) => id !== stream.videoId)
    : Array.from(new Set([...selectedVideoIds, stream.videoId]));
  const multiviewHref = buildDashboardHref(layout, nextSelected);

  // Stagger delay for entrance animation
  const delayClass = index < 8 ? `delay-${(index + 1) * 100}` : "";

  return (
    <Card
      id={`stream-${stream.channelId}`}
      className={`group overflow-hidden animate-fade-in-up ${delayClass} hover:border-primary/25 hover:shadow-[0_0_28px_rgba(234,179,8,0.08)]`}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={stream.thumbnailUrl}
          alt={`Live stream thumbnail for ${stream.streamerName}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 900px"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        >
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/25 to-transparent animate-scan-line" />
        </div>

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge variant="live" className="flex items-center gap-1.5">
            <LiveDot />
            LIVE
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-bold tracking-wide text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.35)]">
            {stream.streamerName}
          </h3>
        </div>
      </div>

      <CardContent className="space-y-2 pt-3">
        <p className="text-sm text-foreground/90" title={stream.title}>
          <span className="block truncate">{stream.title}</span>
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <Button
          asChild
          variant={isSelected ? "default" : "secondary"}
          size="sm"
          className="w-full sm:w-auto"
          aria-label={
            isSelected
              ? `Remove ${stream.streamerName} from multi-view`
              : `Add ${stream.streamerName} to multi-view`
          }
        >
          <a href={multiviewHref} target="_self">
            {isSelected ? "In Multi-View" : "Multi-View"}
            <MonitorUp className="h-4 w-4" aria-hidden />
          </a>
        </Button>
        {tiktokUrl ? (
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            aria-label={`Open ${stream.streamerName} on TikTok`}
          >
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              TikTok
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        ) : null}
        <Button
          asChild
          size="sm"
          variant="outline"
          className="w-full border-primary/35 text-primary hover:border-primary hover:bg-primary hover:text-black sm:w-auto"
          aria-label={`Watch ${stream.streamerName}`}
        >
          <a href={watchUrl} target="_blank" rel="noopener noreferrer">
            Watch
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
