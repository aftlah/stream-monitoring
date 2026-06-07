export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm gold-glow-line gold-glow-line-top">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="text-primary">RAGE</span>
          <span className="text-muted-foreground">{"//"}</span>
          <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-muted-foreground">
            v1.0
          </span>
        </div>
        <div className="text-muted-foreground">
          Developed by <span className="text-foreground/80">aftlah</span> © 2026
        </div>
      </div>
    </footer>
  );
}
