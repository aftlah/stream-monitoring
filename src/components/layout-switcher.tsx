"use client";

import { LayoutGrid, Eye, EyeOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { layoutOptions, type LayoutOption } from "@/types/layout";

function labelForLayout(layout: LayoutOption) {
  return layout === "all" ? "ALL" : layout.toUpperCase();
}

export function LayoutSwitcher({
  value,
  sidebarHidden,
}: {
  value: LayoutOption;
  sidebarHidden?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setLayout(nextLayout: LayoutOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", nextLayout);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleSidebar() {
    const params = new URLSearchParams(searchParams.toString());
    if (sidebarHidden) {
      params.delete("sb");
    } else {
      params.set("sb", "0");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section
      aria-label="Layout switcher"
      className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 px-2.5 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground sm:text-sm">
          <LayoutGrid className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" aria-hidden />
          Layout
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-7 gap-1.5 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground sm:hidden"
          aria-label={sidebarHidden ? "Show streamer list" : "Hide streamer list"}
        >
          {sidebarHidden ? (
            <>
              <Eye className="h-3.5 w-3.5 text-primary/70" />
              List
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              List
            </>
          )}
        </Button>
      </div>

      <div
        role="group"
        aria-label="Layout options"
        className="flex flex-wrap items-center gap-1 rounded-lg border border-border/80 bg-background/50 p-0.5 sm:p-1"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="hidden h-8 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
          aria-label={sidebarHidden ? "Show streamer list" : "Hide streamer list"}
        >
          {sidebarHidden ? (
            <>
              <Eye className="h-4 w-4 text-primary/70" />
              Show Streamer List
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Streamer List
            </>
          )}
        </Button>
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
        {layoutOptions.map((opt) => (
          <Button
            key={opt}
            type="button"
            variant={opt === value ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayout(opt)}
            aria-label={`Switch layout to ${labelForLayout(opt)}`}
            className={`h-7 min-w-0 px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs ${
              opt === value
                ? ""
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {labelForLayout(opt)}
          </Button>
        ))}
      </div>
    </section>
  );
}
