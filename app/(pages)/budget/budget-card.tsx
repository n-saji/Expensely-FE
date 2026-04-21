"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currencyMapper } from "@/utils/currencyMapper";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  MoreHorizontal,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Budget } from "./columns";

type BudgetCardProps = {
  budget: Budget;
  currency?: string;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toUTCString().slice(5, 16);
};

const formatPeriod = (period: string) => {
  if (!period) return "Unknown";
  return period.charAt(0).toUpperCase() + period.slice(1).toLowerCase();
};

const getStatusConfig = (percent: number) => {
  if (percent >= 100)
    return {
      color: "#ef4444",
      bgColor: "rgba(239,68,68,0.1)",
      gradientFrom: "#ef4444",
      gradientTo: "#dc2626",
      label: "Over Budget",
      icon: AlertTriangle,
      iconColor: "#ef4444",
    };
  if (percent >= 75)
    return {
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.1)",
      gradientFrom: "#f59e0b",
      gradientTo: "#d97706",
      label: "Nearing Limit",
      icon: Zap,
      iconColor: "#f59e0b",
    };
  if (percent >= 50)
    return {
      color: "#3b82f6",
      bgColor: "rgba(59,130,246,0.1)",
      gradientFrom: "#3b82f6",
      gradientTo: "#2563eb",
      label: "On Track",
      icon: TrendingUp,
      iconColor: "#3b82f6",
    };
  return {
    color: "#22c55e",
    bgColor: "rgba(34,197,94,0.1)",
    gradientFrom: "#22c55e",
    gradientTo: "#16a34a",
    label: "Healthy",
    icon: CheckCircle2,
    iconColor: "#22c55e",
  };
};

export default function BudgetCard({
  budget,
  currency,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const amountLimit = Number(budget.amountLimit) || 0;
  const spent = Number(budget.spent) || 0;
  const rawPercent = amountLimit > 0 ? (spent / amountLimit) * 100 : 0;
  const percent = Number.isFinite(rawPercent) ? Math.max(rawPercent, 0) : 0;
  const clampedPercent = Math.min(percent, 100);
  const remaining = Math.max(0, amountLimit - spent);
  const symbol = currency ? currencyMapper(currency) : "$";
  const status = getStatusConfig(percent);
  const StatusIcon = status.icon;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div
      className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:border-border"
      style={{ minHeight: 260 }}
    >
      {/* Gradient accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${status.gradientFrom}, ${status.gradientTo})`,
        }}
      />

      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${status.color}, transparent 70%)`,
        }}
      />

      <div className="relative p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate leading-tight">
              {budget.category.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-medium"
              >
                {formatPeriod(budget.period)}
              </Badge>
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: status.color,
                  backgroundColor: status.bgColor,
                }}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <span className="sr-only">Open actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(budget)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between text-xs">
            <span className="text-muted-foreground">Spent</span>
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: status.color }}
            >
              {percent.toFixed(0)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-muted/60">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${clampedPercent}%`,
                background: `linear-gradient(90deg, ${status.gradientFrom}, ${status.gradientTo})`,
                boxShadow: `0 0 8px ${status.color}60`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {symbol}
              {fmt(spent)} used
            </span>
            <span>
              {symbol}
              {fmt(amountLimit)} limit
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div
            className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
            style={{ backgroundColor: status.bgColor }}
          >
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Remaining
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {symbol}
              {fmt(remaining)}
            </span>
          </div>
          <div className="rounded-xl px-3 py-2.5 bg-muted/40 flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Budget
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {symbol}
              {fmt(amountLimit)}
            </span>
          </div>
        </div>

        {/* Date Footer */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 pt-3 border-t border-border/40">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {formatDate(budget.startDate)} — {formatDate(budget.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
