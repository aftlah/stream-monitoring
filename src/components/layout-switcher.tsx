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
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <LayoutGrid className="h-4 w-4 text-primary" aria-hidden />
        Layout
      </div>
      <div
        role="group"
        aria-label="Layout options"
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/50 p-1"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
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
            className={`text-xs ${
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
