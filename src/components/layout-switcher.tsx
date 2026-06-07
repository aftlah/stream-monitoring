"use client";

import { LayoutGrid } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { layoutOptions, type LayoutOption } from "@/types/layout";

function labelForLayout(layout: LayoutOption) {
  return layout.toUpperCase();
}

export function LayoutSwitcher({ value }: { value: LayoutOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setLayout(nextLayout: LayoutOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", nextLayout);
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
      <div role="group" aria-label="Layout options" className="flex flex-wrap items-center gap-2">
        {layoutOptions.map((opt) => (
          <Button
            key={opt}
            type="button"
            variant={opt === value ? "default" : "secondary"}
            size="sm"
            onClick={() => setLayout(opt)}
            aria-label={`Switch layout to ${labelForLayout(opt)}`}
          >
            {labelForLayout(opt)}
          </Button>
        ))}
      </div>
    </section>
  );
}
