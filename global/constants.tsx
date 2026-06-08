export const CategoryTypeExpense = "expense";

export const THEME_OPTIONS = ["light", "dark", "system"] as const;
export type ThemeId = (typeof THEME_OPTIONS)[number];
export const DEFAULT_THEME: ThemeId = "light";
export const THEME_IDS: ThemeId[] = [...THEME_OPTIONS];

export const THEME_COLOR_OPTIONS = [
  { id: "teal", label: "Teal", swatch: "#14b8a6" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "indigo", label: "Indigo", swatch: "#6366f1" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "amber", label: "Amber", swatch: "#f59e0b" },
  { id: "rose", label: "Rose", swatch: "#f43f5e" },
  { id: "slate", label: "Slate", swatch: "#64748b" },
  { id: "violet", label: "Violet", swatch: "#8b5cf6" },
  { id: "orange", label: "Orange", swatch: "#f97316" },
  { id: "crimson", label: "Crimson", swatch: "#e11d48" },
  { id: "forest", label: "Forest", swatch: "#15803d" },
] as const;

export type ThemeColorId = (typeof THEME_COLOR_OPTIONS)[number]["id"];

export const DEFAULT_THEME_COLOR: ThemeColorId = "teal";

export const THEME_COLOR_IDS: ThemeColorId[] = THEME_COLOR_OPTIONS.map(
  (option) => option.id,
);
