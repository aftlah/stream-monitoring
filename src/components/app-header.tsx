import Image from "next/image";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Go to dashboard" className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-transparent sm:h-14 sm:w-14">
            <Image
              src="/logo_rage.png"
              alt="RAGE logo"
              fill
              sizes="56px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-[0.28em] text-primary">
              RAGE
            </div>
            <div className="text-base font-semibold text-foreground">LIVE MONITOR</div>
          </div>
        </Link>
        <div className="hidden text-sm text-muted-foreground sm:block">
          Live channel discovery • Command-center view
        </div>
      </div>
    </header>
  );
}
