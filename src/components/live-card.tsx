import Image from "next/image";
import { ExternalLink, MonitorUp } from "lucide-react";

import type { LayoutOption } from "@/types/layout";
import type { LiveStream } from "@/types/live-stream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function buildDashboardHref(layout: LayoutOption, watchIds: string[]) {
  const params = new URLSearchParams();
  params.set("layout", layout);
  for (const id of watchIds) params.append("watch", id);
  const qs = params.toString();
  return qs.length ? `/?${qs}#multiview` : "/#multiview";
}

export function LiveCard({
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

  const isSelected = selectedVideoIds.includes(stream.videoId);
  const nextSelected = isSelected
    ? selectedVideoIds.filter((id) => id !== stream.videoId)
    : Array.from(new Set([...selectedVideoIds, stream.videoId]));
  const multiviewHref = buildDashboardHref(layout, nextSelected);

  return (
    <Card id={`stream-${stream.channelId}`} className="overflow-hidden">
      <div className="relative aspect-video w-full">
        <Image
          src={stream.thumbnailUrl}
          alt={`Live stream thumbnail for ${stream.streamerName}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 900px"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge variant="live">LIVE</Badge>
        </div>
      </div>

      <CardContent className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">{stream.streamerName}</h3>
        <p className="text-sm text-foreground" title={stream.title}>
          <span className="block truncate">{stream.title}</span>
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
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
        <Button
          asChild
          size="sm"
          className="w-full sm:w-auto"
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
