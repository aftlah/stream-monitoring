export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-1 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="font-semibold text-foreground">
          <span className="text-primary">RAGE</span>{" "}
          <span className="text-muted-foreground">{"//"}</span> v1.0
        </div>
        <div className="text-muted-foreground">Developed by aftlah © 2026</div>
      </div>
    </footer>
  );
}
