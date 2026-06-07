export const layoutOptions = [
  "1x1",
  "2x1",
  "2x2",
  "3x2",
  "3x3",
  "4x2",
  "all",
] as const;

export type LayoutOption = (typeof layoutOptions)[number];

export function parseLayoutOption(input: string | undefined): LayoutOption {
  const normalized = (input ?? "").trim().toLowerCase();
  if ((layoutOptions as readonly string[]).includes(normalized)) {
    return normalized as LayoutOption;
  }
  return "3x2";
}

export function getLayoutCapacity(layout: LayoutOption) {
  if (layout === "all") return Number.MAX_SAFE_INTEGER;
  const [colsRaw, rowsRaw] = layout.split("x");
  const cols = Number(colsRaw);
  const rows = Number(rowsRaw);
  if (!Number.isFinite(cols) || !Number.isFinite(rows)) return 6;
  return Math.max(1, cols * rows);
}

export function getLayoutGridClasses(layout: LayoutOption) {
  switch (layout) {
    case "1x1":
      return "grid-cols-1";
    case "2x1":
    case "2x2":
      return "grid-cols-1 sm:grid-cols-2";
    case "3x2":
    case "3x3":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    case "4x2":
    case "all":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }
}
