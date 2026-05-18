import { cn } from "@/lib/utils";
import {
  getCategoryIcon,
  normalizeCategoryColor,
  DEFAULT_CATEGORY_COLOR,
} from "@/components/category-icon-registry";

type CategoryBadgeProps = {
  name?: string;
  icon?: string;
  color?: string;
  size?: "sm" | "md";
  showName?: boolean;
  className?: string;
};

export const toRgba = (hex: string, alpha: number) => {
  const normalized = normalizeCategoryColor(hex, DEFAULT_CATEGORY_COLOR);
  const raw = normalized.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CategoryBadge({
  name,
  icon,
  color,
  size = "sm",
  showName = true,
  className,
}: CategoryBadgeProps) {
  const Icon = getCategoryIcon(icon);
  const resolvedColor = normalizeCategoryColor(color, DEFAULT_CATEGORY_COLOR);
  const label = name?.trim() || "Unknown";

  const iconWrap = size === "md" ? "h-7 w-7" : "h-6 w-6";
  const iconSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 min-w-0",
        textSize,
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          iconWrap,
        )}
        style={{
          color: resolvedColor,
          backgroundColor: toRgba(resolvedColor, 0.16),
        }}
      >
        <Icon className={iconSize} />
      </span>
      {showName ? <span className="truncate">{label}</span> : null}
    </span>
  );
}
