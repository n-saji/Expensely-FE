import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CreditCard,
  DollarSign,
  Dumbbell,
  Film,
  Flame,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Leaf,
  Music,
  PiggyBank,
  Plane,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

export const CATEGORY_ICON_REGISTRY = {
  DollarSign,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  PiggyBank,
  Briefcase,
  Wallet,
  CreditCard,
  Heart,
  Activity,
  Dumbbell,
  Plane,
  Gift,
  BookOpen,
  Film,
  Music,
  Smartphone,
  Wrench,
  ShieldCheck,
  Zap,
  Leaf,
  GraduationCap,
  Bus,
  Flame,
} as const;

export type CategoryIconKey = keyof typeof CATEGORY_ICON_REGISTRY;

export const DEFAULT_CATEGORY_ICON_KEY: CategoryIconKey = "DollarSign";
export const DEFAULT_CATEGORY_COLOR = "#808080";

const COLOR_HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const formatIconLabel = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, "$1 $2");

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_REGISTRY).map(
  (key) => ({
    value: key as CategoryIconKey,
    label: formatIconLabel(key),
  }),
);

export function normalizeCategoryColor(
  color?: string,
  fallback: string = DEFAULT_CATEGORY_COLOR,
) {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (!trimmed) return fallback;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!COLOR_HEX_REGEX.test(withHash)) return fallback;
  return withHash.toLowerCase();
}

export function resolveCategoryIconKey(icon?: string): CategoryIconKey {
  if (!icon) return DEFAULT_CATEGORY_ICON_KEY;
  const trimmed = icon.trim();
  if (trimmed in CATEGORY_ICON_REGISTRY) {
    return trimmed as CategoryIconKey;
  }
  return DEFAULT_CATEGORY_ICON_KEY;
}

export function getCategoryIcon(icon?: string): LucideIcon {
  return CATEGORY_ICON_REGISTRY[resolveCategoryIconKey(icon)];
}
