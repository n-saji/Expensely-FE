export const CategoryTypeExpense = "expense";

export const THEME_OPTIONS = ["light", "dark", "system"] as const;
export type ThemeId = (typeof THEME_OPTIONS)[number];
export const DEFAULT_THEME: ThemeId = "light";
export const THEME_IDS: ThemeId[] = [...THEME_OPTIONS];

export const THEME_COLOR_OPTIONS = [
  {
    id: "supabase",
    label: "Supabase",
    swatch: "oklch(0.8348 0.1302 160.9080)",
  },
  { id: "twitter", label: "Twitter", swatch: "oklch(0.6723 0.1606 244.9955)" },
  {
    id: "bold-tech",
    label: "Bold Tech",
    swatch: "oklch(0.6056 0.2189 292.7172)",
  },
  { id: "nature", label: "Nature", swatch: "oklch(0.5234 0.1347 144.1672)" },
  {
    id: "amber-minimal",
    label: "Amber Minimal",
    swatch: "oklch(0.7686 0.1647 70.0804)",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    swatch: "oklch(0.6726 0.2904 341.4084)",
  },
  { id: "mono", label: "Mono", swatch: "oklch(0.5555 0 0)" },
  {
    id: "violet-bloom",
    label: "Violet Bloom",
    swatch: "oklch(0.5393 0.2713 286.7462)",
  },
  {
    id: "tangerine",
    label: "Tangerine",
    swatch: "oklch(0.6397 0.1720 36.4421)",
  },
  { id: "t3-chat", label: "T3 Chat", swatch: "oklch(0.5316 0.1409 355.1999)" },
  {
    id: "kodama-grove",
    label: "Kodama Grove",
    swatch: "oklch(0.6657 0.1050 118.9078)",
  },
  {
    id: "catppuccin",
    label: "Catppuccin",
    swatch: "oklch(0.5547 0.2503 297.0156)",
  },
  { id: "graphite", label: "Graphite", swatch: "oklch(0.4891 0 0)" },
  { id: "caffeine", label: "Caffeine", swatch: "oklch(0.4341 0.0392 41.9938)" },
  {
    id: "ocean-breeze",
    label: "Ocean Breeze",
    swatch: "oklch(0.7227 0.1920 149.5793)",
  },
  { id: "claude", label: "Claude", swatch: "oklch(0.6171 0.1375 39.0427)" },
] as const;

export type ThemeColorId = (typeof THEME_COLOR_OPTIONS)[number]["id"];

export const DEFAULT_THEME_COLOR: ThemeColorId = "supabase";

export const THEME_COLOR_IDS: ThemeColorId[] = THEME_COLOR_OPTIONS.map(
  (option) => option.id,
);

const LEGACY_THEME_COLOR_ALIASES: Record<string, ThemeColorId> = {
  teal: "supabase",
  blue: "twitter",
  indigo: "bold-tech",
  emerald: "nature",
  amber: "amber-minimal",
  rose: "cyberpunk",
  slate: "mono",
  violet: "violet-bloom",
  orange: "tangerine",
  crimson: "t3-chat",
  forest: "kodama-grove",
};

export function normalizeThemeColor(themeColor?: string | null): ThemeColorId {
  const normalizedThemeColor = themeColor?.trim().toLowerCase();
  if (!normalizedThemeColor) return DEFAULT_THEME_COLOR;

  const migratedThemeColor =
    LEGACY_THEME_COLOR_ALIASES[normalizedThemeColor] ?? normalizedThemeColor;

  return THEME_COLOR_IDS.includes(migratedThemeColor as ThemeColorId)
    ? (migratedThemeColor as ThemeColorId)
    : DEFAULT_THEME_COLOR;
}
