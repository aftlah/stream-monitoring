"use client";

import { useEffect, useState } from "react";

function buildEmbedSrc(videoId: string): string {
  const url = new URL(
    `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
  );
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("mute", "1");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  url.searchParams.set("modestbranding", "1");
  url.searchParams.set("controls", "1");
  return url.toString();
}

export function YoutubeLiveEmbed({
  videoId,
  title,
  startDelayMs = 0,
}: {
  videoId: string;
  title: string;
  /** Stagger multi-view loads so tiles don't all buffer at once. */
  startDelayMs?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(null);
    const timer = window.setTimeout(() => {
      setSrc(buildEmbedSrc(videoId));
    }, Math.max(0, startDelayMs));
    return () => window.clearTimeout(timer);
  }, [startDelayMs, videoId]);

  if (!src) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-black"
        aria-label={`Loading ${title}`}
      >
        <div
          className="h-7 w-7 rounded-full border-2 border-primary/25 border-t-primary animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <iframe
      className="absolute inset-0 h-full w-full"
      src={src}
      title={title}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
