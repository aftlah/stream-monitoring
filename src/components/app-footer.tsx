export function AppFooter() {
  return (
    <footer className="mt-4 border-t border-border/80 bg-background/60 backdrop-blur-sm gold-glow-line gold-glow-line-top">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-7 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold tracking-[0.2em] text-primary">
            RAGE
          </span>
          <span className="text-border">/</span>
          <span className="rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground">
            v1.0
          </span>
        </div>
        <div className="text-xs text-muted-foreground sm:text-sm">
          Developed by{" "}
          <span className="font-medium text-foreground/85">aftlah</span> © 2026
        </div>
      </div>
    </footer>
  );
}
