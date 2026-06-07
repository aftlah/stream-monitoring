import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/10 text-primary shadow-[0_0_8px_rgba(234,179,8,0.1)]",
        live: "border-danger/40 bg-danger/10 text-danger shadow-[0_0_8px_rgba(239,68,68,0.15)]",
        secondary: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

/** Small pulsing dot for LIVE indicators */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex h-2 w-2 shrink-0", className)}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-danger animate-dot-pulse" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
    </span>
  );
}
