import Image from "next/image";
import Link from "next/link";
import { Signal } from "lucide-react";

import { HeaderClock } from "@/components/header-clock";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/70 backdrop-blur-md gold-glow-line gold-glow-line-bottom">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link
          href="/"
          aria-label="Go to dashboard"
          target="_self"
          className="group flex items-center gap-2.5 sm:gap-3.5"
        >
          <div className="relative flex h-9 w-9 items-center justify-center sm:h-12 sm:w-12">
            <span
              className="absolute inset-0 rounded-lg border border-primary/25 animate-pulse-ring sm:rounded-xl"
              aria-hidden
            />
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-card/60 sm:h-12 sm:w-12 sm:rounded-xl">
              <Image
                src="/logo_rage.png"
                alt="RAGE logo"
                fill
                sizes="48px"
                className="object-contain p-0.5 transition-transform duration-300 group-hover:scale-105 sm:p-1"
                priority
              />
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-bold tracking-[0.35em] text-primary sm:text-[11px]">
              RAGE
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-foreground sm:text-lg">
                LIVE MONITOR
              </span>
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-dot-pulse" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1.5 text-[11px] text-muted-foreground md:flex">
            <Signal className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span>Live discovery</span>
            <span className="text-border">·</span>
            <span>Command center</span>
          </div>
          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <div className="rounded-md border border-border/60 bg-card/40 px-2.5 py-1">
            <HeaderClock />
          </div>
        </div>
      </div>
    </header>
  );
}
