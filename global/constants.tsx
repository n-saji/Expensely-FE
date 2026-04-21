export const CategoryTypeExpense = "expense";

export const THEME_COLOR_OPTIONS = [
  { id: "teal", label: "Teal", swatch: "#14b8a6" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "indigo", label: "Indigo", swatch: "#6366f1" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "amber", label: "Amber", swatch: "#f59e0b" },
  { id: "rose", label: "Rose", swatch: "#f43f5e" },
  { id: "slate", label: "Slate", swatch: "#64748b" },
] as const;

export type ThemeColorId = (typeof THEME_COLOR_OPTIONS)[number]["id"];

export const DEFAULT_THEME_COLOR: ThemeColorId = "teal";

export const THEME_COLOR_IDS: ThemeColorId[] = THEME_COLOR_OPTIONS.map(
  (option) => option.id,
);
