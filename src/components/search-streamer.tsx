"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchStreamer({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = "streamer-search";
  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search streamer
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        placeholder="Search streamer…"
      />
    </div>
  );
}
