import Image from "next/image";
import Link from "next/link";
import { Signal } from "lucide-react";

import { HeaderClock } from "@/components/header-clock";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm gold-glow-line gold-glow-line-bottom">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="Go to dashboard"
          target="_self"
          className="group flex items-center gap-3"
        >
          {/* Logo with pulse ring */}
          <div className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
            {/* Pulse ring behind logo */}
            <span className="absolute inset-0 rounded-lg border border-primary/20 animate-pulse-ring" aria-hidden />
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-transparent sm:h-14 sm:w-14">
              <Image
                src="/logo_rage.png"
                alt="RAGE logo"
                fill
                sizes="56px"
                className="object-contain p-0.5 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-[0.28em] text-primary">
              RAGE
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-foreground">LIVE MONITOR</span>
              {/* Live status dot */}
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-dot-pulse" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          </div>
        </Link>

        {/* Right side: status + clock */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Signal className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span>Live channel discovery</span>
            <span className="text-border">•</span>
            <span>Command-center view</span>
          </div>
          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <HeaderClock />
        </div>
      </div>
    </header>
  );
}
