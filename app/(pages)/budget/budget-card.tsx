"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CalendarDays, MoreHorizontal } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Budget } from "./columns";

type BudgetCardProps = {
  budget: Budget;
  currency?: string;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toUTCString().slice(5, 16);
};

const formatPeriod = (period: string) => {
  if (!period) return "Unknown";
  return period.charAt(0).toUpperCase() + period.slice(1).toLowerCase();
};

const getThresholdColor = (percent: number) => {
  if (percent >= 90) return "#dc2626";
  if (percent >= 70) return "#f59e0b";
  return "#16a34a";
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
  const chartPercent = Math.min(percent, 100);
  const thresholdColor = getThresholdColor(percent);
  const remainingPercent = Math.max(0, 100 - chartPercent);
  const symbol = currency ? currencyMapper(currency) : "$";

  const chartData = [
    { name: "spent", value: chartPercent },
    { name: "remaining", value: remainingPercent },
  ];

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{budget.category.name}</CardTitle>
        <CardDescription className="">
          <Badge>{formatPeriod(budget.period)}</Badge>
        </CardDescription>

        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="mx-auto h-[180px] w-full ">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill={thresholdColor} />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="-mt-[104px] text-center text-xs font-semibold text-foreground">
              {percent > 100 ? "Over" : "Used"}
            </p>
            <p
              className="text-center text-sm font-bold"
              style={{ color: thresholdColor }}
            >
              {percent.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-6 text-sm w-full">
            <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground w-full">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
              </span>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 w-full">
                <span className="text-muted-foreground">Amount Spent</span>
                <span className="font-semibold">
                  {symbol}
                  {spent.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Amount Set</span>
                <span className="font-semibold">
                  {symbol}
                  {amountLimit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
