"use client";
import { currencyMapper } from "@/utils/currencyMapper";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
  Area,
  // Legend,
} from "recharts";
import CardTemplate from "@/components/card";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import DropDown from "./drop-down";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ExpenseOverview, OverviewEnum } from "@/global/dto";
import { Spinner } from "./ui/spinner";
import useMediaQuery from "@/utils/useMediaQuery";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { normalizeCategoryColor } from "@/components/category-icon-registry";
import { formatAmountCompact } from "@/utils/amount_formatter";
// import useMediaQuery from "@/utils/useMediaQuery";

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#0088FE",
  "#FF4444",
  "#AA66CC",
  "#FF6699",
  "#FFBB33",
  "#FF8042",
  "#00C49F",
  "#FFBB28",
  "#0088FE",
];

const height = 280 as number;
const margin = { left: -15, right: 12 };

// ========== Props Interfaces ==========
export interface ExpensesChartCardProps {
  amountByCategory: Record<string, number>;
}

interface ExpensesTop5MonthlyProps {
  amountByItem: Record<string, number>;
}

type ChartRow = {
  name: string;
  [category: string]: number | string;
  amount: number | 0;
};

type CategoryMeta = {
  icon?: string;
  color?: string;
};

type CategoryMetaByName = Record<string, CategoryMeta>;

const SpinnerUI = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner className="text-muted-foreground h-6 w-6" />
    </div>
  );
};

const NoDataUI = () => {
  return (
    <div className={`flex items-center justify-center h-full w-full`}>
      <Label className="text-muted-foreground">No data available</Label>
    </div>
  );
};

type TrendDirection = "up" | "down" | "flat";
type TrendInfo = { direction: TrendDirection; percent: number | null };

const getTrend = (current: number, previous: number): TrendInfo => {
  if (previous === 0) {
    if (current === 0) return { direction: "flat", percent: 0 };
    return { direction: "up", percent: null };
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(change) < 0.5) {
    return { direction: "flat", percent: Math.abs(change) };
  }
  return {
    direction: change > 0 ? "up" : "down",
    percent: Math.abs(change),
  };
};

const TrendBadge = ({ trend }: { trend: TrendInfo }) => {
  const Icon =
    trend.direction === "up"
      ? ArrowUpRight
      : trend.direction === "down"
        ? ArrowDownRight
        : Minus;
  const tone =
    trend.direction === "up"
      ? "text-emerald-600"
      : trend.direction === "down"
        ? "text-rose-500"
        : "text-muted-foreground";
  const value = trend.percent === null ? "n/a" : `${trend.percent.toFixed(1)}%`;

  return (
    <div className={`inline-flex items-center gap-1 text-sm ${tone}`}>
      <Icon className="h-4 w-4" />
      <span className="font-semibold">{value}</span>
    </div>
  );
};

const getRowTotal = (row?: ChartRow) => {
  if (!row) return 0;
  return Object.entries(row)
    .filter(([key]) => key !== "name")
    .reduce((sum, [, value]) => sum + Number(value), 0);
};

const getCategoryColor = (
  categoryName: string,
  fallback: string,
  categoryMetaByName?: CategoryMetaByName,
) =>
  normalizeCategoryColor(categoryMetaByName?.[categoryName]?.color, fallback);

// ========== Pie Chart: Category-wise Spending ==========
export default function PieChartComp({
  amountByCategory,
  currency = "USD",
  title,
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
  categoryMetaByName,
  loading = false,
  layoutWidth,
}: {
  amountByCategory?: ExpenseOverview["amountByCategory"];
  currency?: string;
  title?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
  categoryMetaByName?: CategoryMetaByName;
  loading?: boolean;
  layoutWidth?: number;
}) {
  const chartData = Object.entries(amountByCategory || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    }),
  );
  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const pieData =
    sortedData.length === 1
      ? [
          ...sortedData,
          {
            name: "__placeholder__",
            value: 0.000001,
          },
        ]
      : sortedData;
  const totalAmount = sortedData.reduce((sum, item) => sum + item.value, 0);
  const topItems = sortedData.slice(0, 5);

  const isDesktop = useMediaQuery("(min-width: 530px)");

  return (
    <Card className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm flex flex-col justify-between">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <CardTitle className="text-lg font-medium text-foreground">{title || "Spending by Category"}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Highlights your most active categories
          </p>
        </div>
        <CardAction>
          {setCurrentYearForYearly && currentYearForYearly && min_year && (
            <Select
              value={currentYearForYearly.toString()}
              onValueChange={(value) =>
                setCurrentYearForYearly(parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-[100px] bg-background/50 border-border/40 text-xs">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border/40">
                <SelectGroup>
                  <SelectLabel className="text-xs">Select Year</SelectLabel>
                  {Array.from(
                    {
                      length: new Date().getFullYear() - (min_year || 2020) + 1,
                    },
                    (_, i) => (min_year || 2020) + i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-xs">
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </CardAction>
      </CardHeader>
      <CardContent
        className={`flex-1 ${
          !loading && sortedData.length === 0
            ? "flex items-center justify-center min-h-[260px]"
            : `grid gap-4 items-center ${
                layoutWidth === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px]"
              }`
        }`}
      >
        {!loading && sortedData.length === 0 ? (
          <NoDataUI />
        ) : (
          <>
            <div className="relative flex-1 min-h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={height}>
                {loading ? (
                  <SpinnerUI />
                ) : (
                  <PieChart
                    margin={{
                      right: 0,
                      top: 0,
                    }}
                  >
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={isDesktop ? 105 : 90}
                      innerRadius={isDesktop ? 68 : 55}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pieData.map((item, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            item.name === "__placeholder__"
                              ? "transparent"
                              : getCategoryColor(
                                  item.name,
                                  COLORS[index % COLORS.length],
                                  categoryMetaByName,
                                )
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={(props) => {
                        if (!props.active || !props.payload?.length) return null;
                        const item = props.payload[0];
                        if (!item || item.name === "__placeholder__") return null;
                        const name = item.name;
                        const val = item.value;
                        return (
                          <div
                            style={{
                              backgroundColor: "#0f172a",
                              borderRadius: "12px",
                              border: "1px solid rgba(148,163,184,0.2)",
                              boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                              padding: "8px 12px",
                            }}
                          >
                            <p
                              style={{
                                color: "#e2e8f0",
                                marginBottom: 4,
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {name}
                            </p>
                            <p
                              style={{
                                color: "#4ade80",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {currencyMapper(currency)}
                              {val
                                ? Number(val).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : "0.00"}
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
              {isDesktop && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                      Total
                    </p>
                    <p className="text-base md:text-lg font-semibold font-mono text-foreground h-7 flex items-center justify-center">
                      {loading ? (
                        <Spinner className="size-4 text-muted-foreground" />
                      ) : (
                        `${currencyMapper(currency)}${totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {layoutWidth !== 1 && (
              <div className="rounded-2xl border border-border/50 bg-background/40 p-4 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Top Categories
                </p>
                <div className="space-y-2.5">
                  {topItems.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: getCategoryColor(
                              item.name,
                              COLORS[index % COLORS.length],
                              categoryMetaByName,
                            ),
                          }}
                        />
                        <span className="truncate font-medium text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono text-muted-foreground shrink-0 h-5 flex items-center">
                        {loading ? (
                          <Spinner className="size-3.5 text-muted-foreground" />
                        ) : totalAmount > 0 ? (
                          `${Math.round((item.value / totalAmount) * 100)}%`
                        ) : (
                          "0%"
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
// ========== Bar Chart: Top 5 Items This Month ==========
export function ExpensesTop5Monthly({
  amountByItem,
  darkMode,
  currency = "USD",
  title,
}: ExpensesTop5MonthlyProps & { darkMode: boolean } & { currency?: string } & {
  title?: string;
}) {
  const chartData = Object.entries(amountByItem || {}).map(
    ([item, amount]) => ({
      name: item,
      value: amount,
    }),
  );
  const sortedTop = [...chartData].sort((a, b) => b.value - a.value);
  const topItem = sortedTop[0];
  const totalAmount = sortedTop.reduce((sum, item) => sum + item.value, 0);
  const avgItem = chartData.length > 0 ? totalAmount / chartData.length : 0;
  const topVsAvgTrend = getTrend(topItem?.value ?? 0, avgItem);

  return (
    <Card className="">
      <CardHeader>
        <div>
          <CardTitle>{title || "Top Contributors"}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Biggest contributors by amount
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={chartData} layout="horizontal" margin={margin}>
                <CartesianGrid
                  // strokeDasharray="3 3"
                  // stroke={darkMode ? "#999999" : "#ccc"}
                  stroke={darkMode ? "#5f6266" : "#ccc"}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                  tickFormatter={(value: string) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                  tickFormatter={(value: number) =>
                    `${currencyMapper(currency)}${value.toFixed(0)}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "1px solid rgba(148,163,184,0.2)",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                  // itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                  formatter={(value) =>
                    `${currencyMapper(currency)}${
                      value
                        ? value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : 0
                    }`
                  }
                />
                <Bar
                  dataKey="value"
                  fill="#4ade80"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid gap-2 sm:grid-cols-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Total
                </p>
                <p className="font-semibold text-foreground">
                  {currencyMapper(currency)}
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Top Item
                </p>
                <p className="font-semibold text-foreground">
                  {topItem ? topItem.name : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Share
                </p>
                <p className="font-semibold text-foreground">
                  {topItem && totalAmount > 0
                    ? `${Math.round((topItem.value / totalAmount) * 100)}%`
                    : "0%"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Top vs Avg
                </p>
                <TrendBadge trend={topVsAvgTrend} />
              </div>
            </div>
          </>
        ) : (
          <NoDataUI />
        )}
      </CardContent>
    </Card>
  );
}

// ========== Line Chart: Expenses Over Days This Month ==========
export function ExpensesOverDays({
  overTheDaysThisMonth,
  darkMode,
  currency = "USD",
  title,
  setCurrentMonth,
  setCurrentMonthYear,
  currentMonth,
  currentMonthYear,
  min_year,
  min_month,
  loading = false,
  layoutWidth,
}: {
  overTheDaysThisMonth?: ExpenseOverview["overTheDaysThisMonth"];
  darkMode: boolean;
  currency?: string;
  title?: string;
  setCurrentMonth: (month: number) => void;
  setCurrentMonthYear: (monthYear: number) => void;
  currentMonth: number;
  currentMonthYear: number;
  min_year: number;
  min_month: number;
  loading: boolean;
  layoutWidth?: number;
}) {
  // Transform to recharts-friendly format
  const chartData = Object.entries(overTheDaysThisMonth || {}).map(
    ([day, amount]) => ({
      day,
      value: amount,
    }),
  );
  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);
  const avgSpent = chartData.length > 0 ? totalSpent / chartData.length : 0;
  const peakDay = chartData.reduce(
    (best, current) => (current.value > best.value ? current : best),
    { day: "-", value: 0 },
  );
  const orderedDays = [...chartData].sort(
    (a, b) => Number(a.day) - Number(b.day),
  );
  const lastDay = orderedDays[orderedDays.length - 1];
  const previousDay = orderedDays[orderedDays.length - 2];
  const dayTrend = getTrend(lastDay?.value ?? 0, previousDay?.value ?? 0);

  return (
    <Card
      className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm flex flex-col justify-between"
    >
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <CardTitle className="text-lg font-medium text-foreground">{title || "Spending Over Days"}</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Day-by-day spending pulse
          </p>
        </div>
        <CardAction>
          <div className="flex gap-2">
            {currentMonth && setCurrentMonth && min_month && (
              <Select
                value={currentMonth.toString()}
                onValueChange={(value) => setCurrentMonth(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[100px] bg-background/50 border-border/40 text-xs">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/40">
                  <SelectGroup>
                    <SelectLabel className="text-xs">Select Month</SelectLabel>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem
                          key={month}
                          value={month.toString()}
                          disabled={
                            currentMonthYear === min_year && month < min_month
                          }
                          className="text-xs"
                        >
                          {new Date(0, month - 1).toLocaleString("default", {
                            month: "short",
                          })}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {currentMonthYear && setCurrentMonthYear && min_year && (
              <Select
                value={currentMonthYear.toString()}
                onValueChange={(value) =>
                  setCurrentMonthYear(parseInt(value, 10))
                }
              >
                <SelectTrigger className="w-[100px] bg-background/50 border-border/40 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/40">
                  <SelectGroup>
                    <SelectLabel className="text-xs">Select Year</SelectLabel>
                    {Array.from(
                      {
                        length:
                          new Date().getFullYear() - (min_year || 2020) + 1,
                      },
                      (_, i) => (min_year || 2020) + i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {!loading && chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[260px]">
            <NoDataUI />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex-1 min-h-[180px] w-full flex items-center justify-center">
              {loading ? (
                <SpinnerUI />
              ) : (
                <ResponsiveContainer width="100%" height={height}>
                  <ComposedChart data={orderedDays}>
                    <defs>
                      <linearGradient id="daysFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="70%"
                          stopColor="#34d399"
                          stopOpacity={0.05}
                        />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke={darkMode ? "#5f6266" : "#ccc"}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      interval={"preserveStartEnd"}
                      minTickGap={layoutWidth === 1 ? 20 : 10}
                      tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                      tickFormatter={(value: string) =>
                        `${value}${(() => {
                          if (value === "1") return "st";
                          if (value === "2") return "nd";
                          if (value === "3") return "rd";
                          return "th";
                        })()}`
                      }
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                      tickFormatter={(value: number) =>
                        `${currencyMapper(currency)}${value.toFixed(0)}`
                      }
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "1px solid rgba(148,163,184,0.2)",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                      cursor={{
                        stroke: darkMode ? "#0D0D0D" : "#DBDBDB",
                        strokeWidth: 1,
                        fill: "rgba(255, 255, 255, 0.1)",
                      }}
                      formatter={(spent) =>
                        `${currencyMapper(currency)}${
                          spent
                            ? spent.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : 0
                        }`
                      }
                      labelFormatter={(key) => {
                        return `${key}${(() => {
                          if (key === "1") return "st";
                          if (key === "2") return "nd";
                          if (key === "3") return "rd";
                          return "th";
                        })()}`;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#34d399"
                      strokeWidth={3}
                      fill="url(#daysFill)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <div
              className={`mt-4 grid gap-2.5 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm ${
                layoutWidth === 1
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-4"
              }`}
            >
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                  Total
                </p>
                <p className="font-semibold text-foreground truncate h-6 flex items-center">
                  {loading ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    `${currencyMapper(currency)}${totalSpent.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                  Daily Avg
                </p>
                <p className="font-semibold text-foreground truncate h-6 flex items-center">
                  {loading ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    `${currencyMapper(currency)}${avgSpent.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                  Peak Day
                </p>
                <p className="font-semibold text-foreground truncate h-6 flex items-center">
                  {loading ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    `Day ${peakDay.day}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                  Last vs Prev
                </p>
                <div className="h-6 flex items-center">
                  {loading ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    <TrendBadge trend={dayTrend} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Line Chart: Yearly Expense Category|Total Trend ==========
export function YearlyExpenseLineChart({
  amountByMonth,
  amountByMonthV2,
  darkMode,
  currency = "USD",
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
  categoryMetaByName,
  loading = false,
}: {
  amountByMonth?: ExpenseOverview["amountByMonth"];
  amountByMonthV2?: ExpenseOverview["monthlyCategoryExpense"];
  darkMode: boolean;
  currency?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
  categoryMetaByName?: CategoryMetaByName;
  loading: boolean;
}) {
  const [toggle, setToggle] = useState(true); // true for monthly, false for category
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [category, setCategory] = useState<{ id: string; name: string } | null>(
    null,
  );
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const categoryMeta =
    categoryMetaByName ||
    Object.fromEntries(
      categories.categories
        .filter((item) => item.name)
        .map((item) => [item.name as string, item]),
    );
  const totalForYear = chartData.reduce(
    (sum, item) => sum + (item.amount as number),
    0,
  );
  const avgForYear = chartData.length > 0 ? totalForYear / chartData.length : 0;
  const peakMonth = chartData.reduce(
    (best, current) =>
      (current.amount as number) > (best.amount as number) ? current : best,
    { name: "-", amount: 0 },
  );
  const seriesCount =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((key) => key !== "name").length
      : 0;
  const lastMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const monthTrend = getTrend(
    Number(lastMonth?.amount ?? 0),
    Number(previousMonth?.amount ?? 0),
  );
  const lastCategoryRow = chartData[chartData.length - 1];
  const previousCategoryRow = chartData[chartData.length - 2];
  const categoryTrend = getTrend(
    getRowTotal(lastCategoryRow),
    getRowTotal(previousCategoryRow),
  );

  useEffect(() => {
    if (category?.name) {
      amountByMonthV2 = Object.fromEntries(
        Object.entries(amountByMonthV2 || {}).map(([month, categories]) => [
          month,
          {
            [category.name]: categories[category.name] || 0,
          },
        ]),
      );
    }
    setChartData(
      toggle
        ? Object.entries(amountByMonth || {}).map(([category, amount]) => ({
            name: category,
            amount: amount,
          }))
        : Object.entries(amountByMonthV2 || {}).map(([month, categories]) => ({
            name: month,
            ...categories,
            amount: 0,
          })),
    );
  }, [toggle, amountByMonth, amountByMonthV2]);

  useEffect(() => {
    if (!toggle) {
      if (category?.name) {
        amountByMonthV2 = Object.fromEntries(
          Object.entries(amountByMonthV2 || {}).map(([month, categories]) => [
            month,
            {
              [category.name]: categories[category.name] || 0,
            },
          ]),
        );
      }
      setChartData(
        Object.entries(amountByMonthV2 || {}).map(([month, categories]) => ({
          name: month,
          ...categories,
          amount: 0,
        })),
      );
    }
  }, [category, amountByMonthV2]);

  return (
    <Card className="w-full overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
        <CardTitle className="flex items-center justify-between w-fit gap-2">
          Yearly Expense Trends
          <Tabs defaultValue="monthly">
            <TabsList>
              <TabsTrigger value="monthly" onClick={() => setToggle(true)}>
                Monthly
              </TabsTrigger>
              <TabsTrigger value="category" onClick={() => setToggle(false)}>
                Category
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
        {toggle ? (
          <CardAction>
            {setCurrentYearForYearly && currentYearForYearly && min_year && (
              <Select
                value={currentYearForYearly.toString()}
                onValueChange={(value) =>
                  setCurrentYearForYearly(parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Year</SelectLabel>
                    {Array.from(
                      {
                        length:
                          new Date().getFullYear() - (min_year || 2020) + 1,
                      },
                      (_, i) => (min_year || 2020) + i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </CardAction>
        ) : (
          <CardAction className="flex gap-2">
            <DropDown
              options={[
                { label: "All Categories", value: "all" },
                ...categories.categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                  icon: category.icon,
                  color: category.color,
                })),
              ]}
              selectedOption={category ? category.id : ""}
              onSelect={(option) => {
                const selectedCategory = categories.categories.find(
                  (category) => category.id === option,
                );
                setCategory(selectedCategory || null);
              }}
            />
            {setCurrentYearForYearly && currentYearForYearly && min_year && (
              <Select
                value={currentYearForYearly.toString()}
                onValueChange={(value) =>
                  setCurrentYearForYearly(parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Year</SelectLabel>
                    {Array.from(
                      {
                        length:
                          new Date().getFullYear() - (min_year || 2020) + 1,
                      },
                      (_, i) => (min_year || 2020) + i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </CardAction>
        )}
      </CardHeader>
      {toggle ? (
        <CardContent>
          {chartData.length === 0 ? (
            loading ? (
              <SpinnerUI />
            ) : (
              <NoDataUI />
            )
          ) : (
            <>
              <ResponsiveContainer height={220}>
                {loading ? (
                  <SpinnerUI />
                ) : (
                  <ComposedChart data={chartData}>
                    <CartesianGrid
                      stroke={darkMode ? "#242424" : "#DBDBDB"}
                      vertical={false}
                      strokeDasharray="1"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                      tickFormatter={(name: string) =>
                        name.length > 3 ? `${name.slice(0, 3)}` : name
                      }
                      interval={"preserveStartEnd"}
                      minTickGap={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "1px solid rgba(148,163,184,0.2)",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                      cursor={{
                        stroke: darkMode ? "#525252" : "#DBDBDB",
                      }}
                      formatter={(value, name) => {
                        if (name === "amount")
                          return [
                            `${currencyMapper(currency)}${
                              value
                                ? value.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : 0
                            }`,
                            "Amount",
                          ];
                        if (name === "trend") return [];
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#4ade80"
                      strokeWidth={2}
                      dot
                      activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
              <div className="mt-4 grid gap-2 sm:grid-cols-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </p>
                  <p className="font-semibold text-foreground">
                    {currencyMapper(currency)}
                    {totalForYear.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Avg / Month
                  </p>
                  <p className="font-semibold text-foreground">
                    {currencyMapper(currency)}
                    {avgForYear.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Peak Month
                  </p>
                  <p className="font-semibold text-foreground">
                    {peakMonth.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Last vs Prev
                  </p>
                  <TrendBadge trend={monthTrend} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      ) : (
        <CardContent>
          {chartData.length === 0 ? (
            loading ? (
              <SpinnerUI />
            ) : (
              <NoDataUI />
            )
          ) : (
            <>
              <ResponsiveContainer height={220}>
                {loading ? (
                  <SpinnerUI />
                ) : (
                  <ComposedChart data={chartData}>
                    <CartesianGrid
                      stroke={darkMode ? "#242424" : "#DBDBDB"}
                      vertical={false}
                      strokeDasharray="1"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                      tickFormatter={(name: string) =>
                        name.length > 3 ? `${name.slice(0, 3)}` : name
                      }
                      interval={"preserveStartEnd"}
                      minTickGap={10}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "1px solid rgba(148,163,184,0.2)",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                        fontSize: 14,
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                      cursor={{
                        stroke: darkMode ? "#525252" : "#DBDBDB",
                      }}
                      formatter={(value) => {
                        const rawValue = Array.isArray(value) ? value[1] - value[0] : value;
                        return `${currencyMapper(currency)}${
                          rawValue
                            ? rawValue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : 0
                        }`;
                      }}
                    />
                    {Object.keys(chartData[0])
                      .filter((key) => key !== "name")
                      .map((category, index) => {
                        if (category === "amount") return null;
                        const seriesColor = getCategoryColor(
                          category,
                          COLORS[index % COLORS.length],
                          categoryMeta,
                        );
                        return (
                          <Area
                            key={category}
                            type="basis"
                            dataKey={category}
                            stackId="1"
                            stroke={seriesColor}
                            strokeWidth={2}
                            fill={seriesColor}
                            fillOpacity={0.25}
                            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                            dot
                          />
                        );
                      })}
                    {/* <Legend /> */}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
              <div className="mt-4 grid gap-2 sm:grid-cols-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Series
                  </p>
                  <p className="font-semibold text-foreground">{seriesCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Months
                  </p>
                  <p className="font-semibold text-foreground">
                    {chartData.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Latest
                  </p>
                  <p className="font-semibold text-foreground">
                    {chartData[chartData.length - 1]?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Trend
                  </p>
                  <TrendBadge trend={categoryTrend} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ========== Line Chart: Yearly Expense Category|Total Trend ==========
export function YearlyExpenseLineChartV2({
  amountByMonth,
  amountByMonthV2,
  darkMode,
  title,
  currency = "USD",
  categoryMetaByName,
  loading = false,
  setOverviewParams,
  overviewParams,
  layoutWidth,
}: {
  amountByMonth?: ExpenseOverview["amountByMonth"];
  amountByMonthV2?: ExpenseOverview["monthlyCategoryExpense"];
  darkMode: boolean;
  title?: string;
  currency?: string;
  categoryMetaByName?: CategoryMetaByName;
  setOverviewParams: React.Dispatch<
    React.SetStateAction<{ count?: number; type?: OverviewEnum }>
  >;
  overviewParams: { count?: number; type?: OverviewEnum };
  loading: boolean;
  layoutWidth?: number;
}) {
  const [toggle, setToggle] = useState(true); // true for monthly, false for category
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [category, setCategory] = useState<{ id: string; name: string } | null>(
    null,
  );
  const availableCategoryNames = Array.from(
    new Set(
      Object.values(amountByMonthV2 || {}).flatMap((categories) =>
        Object.keys(categories || {}),
      ),
    ),
  ).filter(Boolean);

  useEffect(() => {
    if (category?.name && !availableCategoryNames.includes(category.name)) {
      setCategory(null);
    }
  }, [availableCategoryNames, category]);
  useEffect(() => {
    if (category?.name) {
      amountByMonthV2 = Object.fromEntries(
        Object.entries(amountByMonthV2 || {}).map(([month, categories]) => [
          month,
          {
            [category.name]: categories[category.name] || 0,
          },
        ]),
      );
    }
    setChartData(
      toggle
        ? Object.entries(amountByMonth || {}).map(([category, amount]) => ({
            name: category,
            amount: amount,
          }))
        : Object.entries(amountByMonthV2 || {}).map(([month, categories]) => ({
            name: month,
            ...categories,
            amount: 0,
          })),
    );
  }, [toggle, amountByMonth, amountByMonthV2]);

  useEffect(() => {
    if (!toggle) {
      if (category?.name) {
        amountByMonthV2 = Object.fromEntries(
          Object.entries(amountByMonthV2 || {}).map(([month, categories]) => [
            month,
            {
              [category.name]: categories[category.name] || 0,
            },
          ]),
        );
      }
      setChartData(
        Object.entries(amountByMonthV2 || {}).map(([month, categories]) => ({
          name: month,
          ...categories,
          amount: 0,
        })),
      );
    }
  }, [category, amountByMonthV2]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(0);
  const setOverviewParamsIfChanged = (nextParams: {
    count?: number;
    type?: OverviewEnum;
  }) => {
    if (!setOverviewParams) {
      return;
    }

    setOverviewParams((prev) => {
      const sameCount =
        (prev.count ?? undefined) === (nextParams.count ?? undefined);
      const sameType =
        (prev.type ?? undefined) === (nextParams.type ?? undefined);
      return sameCount && sameType ? prev : nextParams;
    });
  };
  const typesMapper = {
    0: "Last 6 Months",
    1: "Last 12 Months",
    2: "All Time",
  };
  const totalForPeriod = chartData.reduce(
    (sum, item) => sum + (item.amount as number),
    0,
  );
  const avgForPeriod =
    chartData.length > 0 ? totalForPeriod / chartData.length : 0;
  const peakPeriod = chartData.reduce(
    (best, current) =>
      (current.amount as number) > (best.amount as number) ? current : best,
    { name: "-", amount: 0 },
  );
  const seriesCountV2 =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((key) => key !== "name").length - 1
      : 0;
  const lastPeriod = chartData[chartData.length - 1];
  const previousPeriod = chartData[chartData.length - 2];
  const periodTrend = getTrend(
    Number(lastPeriod?.amount ?? 0),
    Number(previousPeriod?.amount ?? 0),
  );
  const lastCategoryRowV2 = chartData[chartData.length - 1];
  const previousCategoryRowV2 = chartData[chartData.length - 2];
  const categoryTrendV2 = getTrend(
    getRowTotal(lastCategoryRowV2),
    getRowTotal(previousCategoryRowV2),
  );
  useEffect(() => {
    switch (selectedTimeframe) {
      case 0:
        setOverviewParamsIfChanged({ count: 6, type: OverviewEnum.MONTH });
        break;
      case 1:
        setOverviewParamsIfChanged({ count: 1, type: OverviewEnum.YEAR });
        break;
      case 2:
        setOverviewParamsIfChanged({ count: 3, type: OverviewEnum.ALL_TIME });
        break;
      default:
        setOverviewParamsIfChanged({ count: 6, type: OverviewEnum.MONTH });
    }
  }, [selectedTimeframe, setOverviewParams]);

  return (
    <Card className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm flex flex-col justify-between">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <CardTitle className="flex flex-wrap items-center justify-between w-fit gap-3 text-lg font-medium text-foreground">
          <span>{title || "Expense Trends"}</span>
          <Tabs defaultValue="monthly">
            <TabsList className="bg-background/50 border border-border/40">
              <TabsTrigger value="monthly" onClick={() => setToggle(true)} className="text-xs">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="category" onClick={() => setToggle(false)} className="text-xs">
                Category
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
        {toggle ? (
          <CardAction>
            {overviewParams && (
              <Select
                onValueChange={(value) =>
                  setSelectedTimeframe(parseInt(value, 10))
                }
                value={selectedTimeframe.toString()}
              >
                <SelectTrigger className="w-[130px] bg-background/50 border-border/40 text-xs">
                  <SelectValue placeholder="Past 6 Months" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/40">
                  <SelectGroup>
                    <SelectLabel className="text-xs">Choose Time Period</SelectLabel>
                    {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                      <SelectItem
                        key={index}
                        value={index.toString()}
                        onClick={() => setSelectedTimeframe(index)}
                        className="text-xs"
                      >
                        {typesMapper[index as keyof typeof typesMapper]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </CardAction>
        ) : (
          <CardAction className="flex gap-2">
            <DropDown
              options={[
                { label: "All Categories", value: "all" },
                ...availableCategoryNames.map((categoryName) => ({
                  label: categoryName,
                  value: categoryName,
                  icon: categoryMetaByName?.[categoryName]?.icon,
                  color: categoryMetaByName?.[categoryName]?.color,
                })),
              ]}
              selectedOption={category ? category.id : ""}
              onSelect={(option) => {
                if (option === "all") {
                  setCategory(null);
                  return;
                }

                setCategory({ id: option, name: option });
              }}
            />
            {overviewParams && (
              <Select
                onValueChange={(value) =>
                  setSelectedTimeframe(parseInt(value, 10))
                }
                value={selectedTimeframe.toString()}
              >
                <SelectTrigger className="w-[130px] bg-background/50 border-border/40 text-xs">
                  <SelectValue placeholder="Past 6 Months" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/40">
                  <SelectGroup>
                    <SelectLabel className="text-xs">Choose Time Period</SelectLabel>
                    {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                      <SelectItem
                        key={index}
                        value={index.toString()}
                        onClick={() => setSelectedTimeframe(index)}
                        className="text-xs"
                      >
                        {typesMapper[index as keyof typeof typesMapper]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </CardAction>
        )}
      </CardHeader>
      {toggle ? (
        <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
          {!loading && chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[260px]">
              <NoDataUI />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex-1 min-h-[180px] w-full flex items-center justify-center">
                {loading ? (
                  <SpinnerUI />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart
                      data={
                        chartData.length === 1
                          ? [
                              {
                                name: "",
                                amount: chartData[0].amount,
                                __ghost: true,
                              },
                              ...chartData,
                              {
                                name: " ",
                                amount: chartData[0].amount,
                                __ghost: true,
                              },
                            ]
                          : chartData
                      }
                      margin={{
                        left: 0,
                        right: 10,
                        top: 10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        stroke={darkMode ? "#242424" : "#DBDBDB"}
                        vertical={false}
                        strokeDasharray="1"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                        interval={"preserveStartEnd"}
                        minTickGap={layoutWidth === 1 ? 25 : 15}
                      />
                      <Tooltip
                        cursor={{ stroke: darkMode ? "#525252" : "#DBDBDB" }}
                        content={(props) => {
                          if (!props.active || !props.payload?.length)
                            return null;
                          if (props.payload[0]?.payload?.__ghost) return null;
                          const val = props.payload[0]?.value;
                          return (
                            <div
                              style={{
                                backgroundColor: "#0f172a",
                                borderRadius: "12px",
                                border: "1px solid rgba(148,163,184,0.2)",
                                boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                                padding: "8px 12px",
                              }}
                            >
                              <p
                                style={{
                                  color: "#e2e8f0",
                                  marginBottom: 4,
                                  fontSize: 12,
                                }}
                              >
                                {props.label}
                              </p>
                              <p
                                style={{
                                  color: "#4ade80",
                                  fontWeight: 600,
                                  fontSize: 14,
                                }}
                              >
                                {currencyMapper(currency)}
                                {val
                                  ? Number(val).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : "0.00"}
                              </p>
                            </div>
                          );
                        }}
                      />

                      <Area
                        type="bump"
                        dataKey="amount"
                        stroke="#4ade80"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                        isAnimationActive={true}
                        fill="#4ade80"
                        fillOpacity={0.12}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div
                className={`mt-4 grid gap-2.5 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm ${
                  layoutWidth === 1
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                <div>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Total
                  </Label>
                  <p className="font-semibold text-foreground truncate h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      `${currencyMapper(currency)}${totalForPeriod.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Avg / Period
                  </Label>
                  <p className="font-semibold text-foreground truncate h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      `${currencyMapper(currency)}${avgForPeriod.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Peak
                  </Label>
                  <p className="font-semibold text-foreground truncate h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      peakPeriod.name
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Last vs Prev
                  </Label>
                  <div className="h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      <TrendBadge trend={periodTrend} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
          {!loading && chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[260px]">
              <NoDataUI />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex-1 min-h-[180px] w-full flex items-center justify-center">
                {loading ? (
                  <SpinnerUI />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart
                      data={
                        chartData.length === 1
                          ? [
                              {
                                name: "",
                                amount: chartData[0].amount,
                                __ghost: true,
                                ...Object.fromEntries(
                                  Object.keys(chartData[0])
                                    .filter((k) => k !== "name" && k !== "amount")
                                    .map((k) => [k, (chartData[0] as any)[k]]),
                                ),
                              },
                              ...chartData,
                              {
                                name: " ",
                                amount: chartData[0].amount,
                                __ghost: true,
                                ...Object.fromEntries(
                                  Object.keys(chartData[0])
                                    .filter((k) => k !== "name" && k !== "amount")
                                    .map((k) => [k, (chartData[0] as any)[k]]),
                                ),
                              },
                            ]
                          : chartData
                      }
                      margin={{
                        left: 0,
                        right: 10,
                        top: 10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        stroke={darkMode ? "#242424" : "#DBDBDB"}
                        vertical={false}
                        strokeDasharray="1"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                        interval={"preserveStartEnd"}
                        minTickGap={layoutWidth === 1 ? 25 : 15}
                      />

                      <Tooltip
                        cursor={{ stroke: darkMode ? "#525252" : "#DBDBDB" }}
                        content={(props) => {
                          if (!props.active || !props.payload?.length)
                            return null;
                          if (props.payload[0]?.payload?.__ghost) return null;
                          return (
                            <div
                              style={{
                                backgroundColor: "#0f172a",
                                borderRadius: "12px",
                                border: "1px solid rgba(148,163,184,0.2)",
                                boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                                padding: "8px 12px",
                                fontSize: 14,
                              }}
                            >
                              <p
                                style={{
                                  color: "#e2e8f0",
                                  marginBottom: 4,
                                  fontSize: 12,
                                }}
                              >
                                {props.label}
                              </p>
                              {props.payload
                                .filter((p) => !p.payload?.__ghost)
                                .map((p, i) => {
                                  const rawVal = p.dataKey && p.payload && p.payload[p.dataKey as string] !== undefined 
                                    ? p.payload[p.dataKey as string] 
                                    : (Array.isArray(p.value) ? p.value[1] - p.value[0] : p.value);
                                  return (
                                    <p
                                      key={i}
                                      style={{
                                        color: p.color ?? "#fff",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {p.name}: {currencyMapper(currency)}
                                      {rawVal !== undefined && rawVal !== null
                                        ? Number(rawVal).toLocaleString(
                                            undefined,
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            },
                                          )
                                        : "0.00"}
                                    </p>
                                  );
                                })}
                            </div>
                          );
                        }}
                      />
                      {Object.keys(chartData[0])
                        .filter((key) => key !== "name")
                        .map((category, index) => {
                          if (category === "amount") return null;
                          const seriesColor = getCategoryColor(
                            category,
                            COLORS[index % COLORS.length],
                            categoryMetaByName,
                          );
                          return (
                            <Area
                              key={category}
                              type="monotone"
                              dataKey={category}
                              stackId="1"
                              stroke={seriesColor}
                              strokeWidth={2}
                              fill={seriesColor}
                              fillOpacity={0.25}
                              dot={false}
                              activeDot={(props: any) => {
                                if (props?.payload?.__ghost)
                                  return <g key={props.key} />;
                                return (
                                  <circle
                                    key={props.key}
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={4}
                                    fill={seriesColor}
                                    stroke="#fff"
                                    strokeWidth={1.5}
                                  />
                                );
                              }}
                              isAnimationActive={true}
                            />
                          );
                        })}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div
                className={`mt-4 grid gap-2.5 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 ${
                  layoutWidth === 1
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Series
                  </p>
                  <p className="font-semibold text-foreground truncate h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      seriesCountV2
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Periods
                  </p>
                  <p className="font-semibold text-foreground truncate h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      chartData.length
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Latest
                  </p>
                  <p className="font-semibold text-foreground truncate h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      chartData[chartData.length - 1]?.name || "-"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block truncate">
                    Trend
                  </p>
                  <div className="h-6 flex items-center">
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      <TrendBadge trend={categoryTrendV2} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function IncomeExpenseComparisonChart({
  expenseByMonth,
  incomeByMonth,
  darkMode,
  currency = "USD",
  loading,
  setOverviewParams,
}: {
  expenseByMonth?: Record<string, number>;
  incomeByMonth?: Record<string, number>;
  darkMode: boolean;
  currency?: string;
  loading: boolean;
  setOverviewParams: React.Dispatch<
    React.SetStateAction<{ count?: number; type?: OverviewEnum }>
  >;
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(0);

  const setOverviewParamsIfChanged = (nextParams: {
    count?: number;
    type?: OverviewEnum;
  }) => {
    setOverviewParams((prev) => {
      const sameCount =
        (prev.count ?? undefined) === (nextParams.count ?? undefined);
      const sameType =
        (prev.type ?? undefined) === (nextParams.type ?? undefined);
      return sameCount && sameType ? prev : nextParams;
    });
  };

  useEffect(() => {
    switch (selectedTimeframe) {
      case 0:
        setOverviewParamsIfChanged({ count: 6, type: OverviewEnum.MONTH });
        break;
      case 1:
        setOverviewParamsIfChanged({ count: 12, type: OverviewEnum.MONTH });
        break;
      case 2:
        setOverviewParamsIfChanged({ type: OverviewEnum.ALL_TIME });
        break;
      default:
        setOverviewParamsIfChanged({ count: 6, type: OverviewEnum.MONTH });
    }
  }, [selectedTimeframe, setOverviewParams]);

  const allMonths = [
    ...new Set([
      ...Object.keys(expenseByMonth || {}),
      ...Object.keys(incomeByMonth || {}),
    ]),
  ];

  const chartData = allMonths.map((month) => ({
    name: month,
    expense: expenseByMonth?.[month] || 0,
    income: incomeByMonth?.[month] || 0,
  }));

  const totalExpense = chartData.reduce((sum, row) => sum + row.expense, 0);
  const totalIncome = chartData.reduce((sum, row) => sum + row.income, 0);
  const net = totalIncome - totalExpense;
  const latest = chartData[chartData.length - 1];
  const previous = chartData[chartData.length - 2];
  const trend = getTrend(latest?.income ?? 0, previous?.income ?? 0);

  const isSinglePoint = chartData.length === 1;
  const displayData = isSinglePoint
    ? [
        {
          name: "",
          income: chartData[0].income,
          expense: chartData[0].expense,
          __ghost: true,
        },
        { ...chartData[0], __ghost: false },
        {
          name: "",
          income: chartData[0].income,
          expense: chartData[0].expense,
          __ghost: true,
        },
      ]
    : chartData;

  const makeDot = (color: string) => (props: any) => {
    if (props.payload.__ghost) return null;
    return (
      <circle
        key={`dot-${props.cx}-${props.cy}`}
        cx={props.cx}
        cy={props.cy}
        r={5}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  return (
    <Card className="w-full overflow-hidden border-border/40 shadow-none bg-card/30 backdrop-blur-sm">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <CardTitle className="text-lg font-medium text-foreground">Income vs Expense</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly flow comparison</p>
        </div>
        <CardAction>
          <Select
            value={selectedTimeframe.toString()}
            onValueChange={(value) => setSelectedTimeframe(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[140px] bg-background/50 border-border/40 text-xs">
              <SelectValue placeholder="Last 6 Months" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/40">
              <SelectGroup>
                <SelectLabel className="text-xs">Choose Time Period</SelectLabel>
                <SelectItem value="0" className="text-xs">Last 6 Months</SelectItem>
                <SelectItem value="1" className="text-xs">Last 12 Months</SelectItem>
                <SelectItem value="2" className="text-xs">All Years</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!loading && chartData.length === 0 ? (
          <div className="flex items-center justify-center min-h-[240px]">
            <NoDataUI />
          </div>
        ) : (
          <>
            <ResponsiveContainer height={240}>
              {loading ? (
                <SpinnerUI />
              ) : (
                <ComposedChart data={displayData} margin={{ left: -15, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    vertical={false}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground font-mono"
                    interval={"preserveStartEnd"}
                    minTickGap={30}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground font-mono"
                    tickFormatter={(value) =>
                      `${formatAmountCompact(value, currency)}`
                    }
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "rgba(15,23,42,0.85)",
                      borderRadius: "12px",
                      border: "1px solid rgba(148,163,184,0.15)",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.45)",
                      backdropFilter: "blur(8px)",
                    }}
                    labelStyle={{ color: "#e2e8f0", fontWeight: 500 }}
                    cursor={{ stroke: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
                    filterNull
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      if (!label) return null;
                      return (
                        <div className="bg-slate-900/90 text-slate-100 rounded-lg border border-slate-800 p-3 shadow-xl backdrop-blur-sm min-w-[150px]">
                          <p className="text-xs font-mono font-medium text-slate-400 mb-2">{label}</p>
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex justify-between items-center gap-4 text-xs py-0.5">
                              <span className="capitalize" style={{ color: entry.color }}>
                                {entry.name}:
                              </span>
                              <span className="font-mono font-semibold">
                                {currencyMapper(currency)}
                                {Number(entry.value).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  
                  <Area
                    type="bump"
                    name="income"
                    dataKey="income"
                    activeDot={isSinglePoint ? makeDot("#10b981") : { r: 4, strokeWidth: 1 }}
                    dot={false}
                    stroke="#10b981"
                    strokeWidth={2}
                    isAnimationActive={true}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="bump"
                    name="expense"
                    dataKey="expense"
                    activeDot={isSinglePoint ? makeDot("#ef4444") : { r: 4, strokeWidth: 1 }}
                    dot={false}
                    stroke="#ef4444"
                    strokeWidth={2}
                    isAnimationActive={true}
                    fill="url(#expenseGrad)"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-border/30">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Income
                </p>
                <p className="text-lg font-medium font-mono text-emerald-500 h-7 flex items-center">
                  {loading ? (
                    <Spinner className="size-4 text-muted-foreground" />
                  ) : (
                    `${currencyMapper(currency)}${totalIncome.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Expense
                </p>
                <p className="text-lg font-medium font-mono text-rose-500 h-7 flex items-center">
                  {loading ? (
                    <Spinner className="size-4 text-muted-foreground" />
                  ) : (
                    `${currencyMapper(currency)}${totalExpense.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Net Flow
                </p>
                <p className={`text-lg font-medium font-mono h-7 flex items-center ${net >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {loading ? (
                    <Spinner className="size-4 text-muted-foreground" />
                  ) : (
                    `${currencyMapper(currency)}${net.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Income Trend
                </p>
                <div className="h-7 flex items-center">
                  {loading ? (
                    <Spinner className="size-4 text-muted-foreground" />
                  ) : (
                    <TrendBadge trend={trend} />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Depricated code

// // ========== Line Chart: Yearly Spending ==========
// export function ExpensesMonthlyLineChartCard({
//   amountByMonth,
//   darkMode,
//   currency = "USD",
//   title,
//   setCurrentYearForYearly,
//   currentYearForYearly,
//   min_year,
// }: ExpensesMonthlyChartProps & { darkMode: boolean } & { currency?: string } & {
//   title?: string;
//   setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
//   currentYearForYearly?: number;
//   min_year?: number;
// }) {
//   const chartData = Object.entries(amountByMonth || {}).map(
//     ([month, amount]) => ({
//       name: month,
//       amount: amount,
//       trend: amount,
//     })
//   );

//   return (
//     <Card
//       // description="Insights into your spending patterns"
//       className="w-full"
//     >
//       <CardHeader>
//         <CardTitle>{title || "Expense Summary"}</CardTitle>
//         <CardAction>
//           {setCurrentYearForYearly && currentYearForYearly && min_year && (
//             <Select
//               value={currentYearForYearly.toString()}
//               onValueChange={(value) =>
//                 setCurrentYearForYearly(parseInt(value, 10))
//               }
//             >
//               <SelectTrigger className="w-[100px]">
//                 <SelectValue placeholder="Year" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   <SelectLabel>Select Year</SelectLabel>
//                   {Array.from(
//                     {
//                       length: new Date().getFullYear() - (min_year || 2020) + 1,
//                     },
//                     (_, i) => (min_year || 2020) + i
//                   ).map((year) => (
//                     <SelectItem key={year} value={year.toString()}>
//                       {year}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           )}
//         </CardAction>
//       </CardHeader>
//       <CardContent>
//         {chartData.length === 0 ? (
//           <div
//             className={`flex items-center justify-center h-[${height.toString()}px] w-full`}
//           >
//             <Label className="text-muted-foreground">No data available</Label>
//           </div>
//         ) : (
//           <ResponsiveContainer height={220}>
//             <ComposedChart data={chartData}>
//               <CartesianGrid
//                 stroke={darkMode ? "#242424" : "#DBDBDB"}
//                 vertical={false}
//               />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(name: string) =>
//                   name.length > 3 ? `${name.slice(0, 3)}` : name
//                 }
//                 interval={"preserveStartEnd"}
//                 minTickGap={10}
//               />
//               {/* <YAxis
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(value: number) =>
//                   `${currencyMapper(currency)}${value.toFixed(0)}`
//                 }
//               /> */}
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "black",
//                   borderRadius: "8px",
//                 }}
//                 labelStyle={{ color: "#fff" }}
//                 cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
//                 formatter={(value: number, name: string) => {
//                   if (name === "amount")
//                     return [
//                       `${currencyMapper(currency)}${value.toLocaleString(
//                         undefined,
//                         {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         }
//                       )}`,
//                       "Amount",
//                     ];
//                   if (name === "trend") return [];
//                 }}
//               />
//               {/* <Bar
//               dataKey="amount"
//               fill="#4ade80"
//               radius={[4, 4, 0, 0]}
//               barSize={50}
//             /> */}
//               <Line
//                 type="monotone"
//                 dataKey="amount"
//                 stroke="#4ade80"
//                 strokeWidth={2}
//                 dot
//                 activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // ========== Line Chart: Yearly Expense Category Trend ==========
// export function ExpensesMonthlyLineCategoryChartCard({
//   amountByMonthV2,
//   darkMode,
//   currency = "USD",
//   title,
//   setCurrentYearForYearly,
//   currentYearForYearly,
//   min_year,
// }: ExpensesMonthlyCategoryChartProps & { darkMode: boolean } & {
//   currency?: string;
// } & { title?: string } & {
//   setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
//   currentYearForYearly?: number;
//   min_year?: number;
// }) {
//   const [category, setCategory] = useState<{ id: string; name: string } | null>(
//     null
//   );
//   const categories = useSelector((state: RootState) => state.categoryExpense);
//   const [chartData, setChartData] = useState<ChartRow[]>([]);

//   useEffect(() => {
//     if (category?.name) {
//       amountByMonthV2 = Object.fromEntries(
//         Object.entries(amountByMonthV2).map(([month, categories]) => [
//           month,
//           {
//             [category.name]: categories[category.name] || 0,
//           },
//         ])
//       );
//     }
//     setChartData(
//       Object.entries(amountByMonthV2).map(([month, categories]) => ({
//         name: month,
//         ...categories,
//         amount: 0,
//       }))
//     );
//   }, [category, amountByMonthV2]);

//   return (
//     <Card
//       // description="Visual breakdown of expenses by category over the year"
//       className="w-full"
//     >
//       <CardHeader className="flex flex-wrap justify-between items-center gap-3">
//         <CardTitle>{title || "Monthly Spending Trends"}</CardTitle>
//         <CardAction className="flex gap-2">
//           {setCurrentYearForYearly && currentYearForYearly && min_year && (
//             <Select
//               value={currentYearForYearly.toString()}
//               onValueChange={(value) =>
//                 setCurrentYearForYearly(parseInt(value, 10))
//               }
//             >
//               <SelectTrigger className="w-[100px]">
//                 <SelectValue placeholder="Year" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   <SelectLabel>Select Year</SelectLabel>
//                   {Array.from(
//                     {
//                       length: new Date().getFullYear() - (min_year || 2020) + 1,
//                     },
//                     (_, i) => (min_year || 2020) + i
//                   ).map((year) => (
//                     <SelectItem key={year} value={year.toString()}>
//                       {year}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           )}
//           <DropDown
//             options={[
//               { label: "All Categories", value: "all" },
//               ...categories.categories.map((category) => ({
//                 label: category.name,
//                 value: category.id,
//               })),
//             ]}
//             selectedOption={category ? category.id : ""}
//             onSelect={(option) => {
//               const selectedCategory = categories.categories.find(
//                 (category) => category.id === option
//               );
//               setCategory(selectedCategory || null);
//             }}
//           />
//         </CardAction>
//       </CardHeader>
//       <CardContent>
//         {chartData.length === 0 ? (
//           <div
//             className={`flex items-center content-center justify-center h-[${height.toString()}px] w-full`}
//           >
//             <Label className="text-muted-foreground">No data available</Label>
//           </div>
//         ) : (
//           <ResponsiveContainer width="100%" height={height}>
//             <ComposedChart data={chartData} margin={margin}>
//               <CartesianGrid
//                 strokeDasharray="1"
//                 stroke={darkMode ? "#5f6266" : "#ccc"}
//                 // strokeLinejoin="round"
//                 // horizontal={false}
//                 vertical={false}
//                 height={1}
//               />

//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(name: string) => name.slice(0, 1)}
//               />
//               <YAxis
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(value: number) =>
//                   `${currencyMapper(currency)}${value.toFixed(0)}`
//                 }
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "black",
//                   borderRadius: "8px",
//                   fontSize: 14,
//                 }}
//                 labelStyle={{ color: "#fff" }}
//                 cursor={{ fill: "bg-background" }}
//                 formatter={(value: number) =>
//                   `${currencyMapper(currency)}${value.toLocaleString(
//                     undefined,
//                     {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     }
//                   )}`
//                 }
//               />
//               {Object.keys(chartData[0])
//                 .filter((key) => key !== "name")
//                 .map((category, index) => (
//                   <Line
//                     key={category}
//                     type="monotone"
//                     dataKey={category}
//                     stroke={COLORS[index % COLORS.length]}
//                     strokeWidth={2}
//                     dot
//                   />
//                 ))}
//               {/* <Legend /> */}
//             </ComposedChart>
//           </ResponsiveContainer>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
