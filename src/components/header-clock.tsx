"use client";

import { useEffect, useState } from "react";

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function HeaderClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    const timeoutId = window.setTimeout(update, 0);
    const id = window.setInterval(() => {
      update();
    }, 1000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(id);
    };
  }, []);

  if (time === null) {
    return (
      <div
        aria-label="Current time"
        className="font-mono text-xs tabular-nums text-muted-foreground"
      >
        --:--:--
      </div>
    );
  }

  return (
    <time
      aria-label="Current time"
      className="font-mono text-xs tabular-nums text-muted-foreground tracking-wider"
    >
      {time}
    </time>
  );
}
