import { ExternalLink } from "lucide-react";

import { Badge, LiveDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getTiktokHandle(tiktokUrl: string): string | null {
  try {
    const url = new URL(tiktokUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const at = parts.find((p) => p.startsWith("@"));
    if (!at) return null;
    const handle = at.trim();
    return handle.length > 1 ? handle : null;
  } catch {
    return null;
  }
}

function toTiktokLiveUrl(tiktokUrl: string): string {
  const handle = getTiktokHandle(tiktokUrl);
  if (!handle) return tiktokUrl;
  const clean = handle.slice(1).trim();
  if (clean.length === 0) return tiktokUrl;
  return `https://m.tiktok.com/@${encodeURIComponent(clean)}/live`;
}

export function TiktokLiveCard({
  name,
  tiktokUrl,
}: {
  name: string;
  tiktokUrl: string;
}) {
  const handle = getTiktokHandle(tiktokUrl);
  const openUrl = toTiktokLiveUrl(tiktokUrl);
  return (
    <Card className="group flex h-full flex-col overflow-hidden hover:border-primary/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.08)] animate-fade-in-up">
      {/* TikTok accent gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE]" aria-hidden />

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm font-bold">{name}</CardTitle>
            <CardDescription className="text-xs">
              TikTok Live{handle ? ` · ${handle}` : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="live" className="flex items-center gap-1">
              <LiveDot className="h-1.5 w-1.5" />
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Open to confirm status on TikTok.
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-end">
        <Button
          asChild
          size="sm"
          className="w-full sm:w-auto"
          aria-label={`Open ${name} on TikTok`}
        >
          <a href={openUrl} target="_blank" rel="noopener noreferrer">
            Open on TikTok
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
