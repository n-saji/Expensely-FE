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

// ========== Pie Chart: Category-wise Spending ==========
export default function PieChartComp({
  amountByCategory,
  currency = "USD",
  title,
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
  loading = false,
}: {
  amountByCategory?: ExpenseOverview["amountByCategory"];
  currency?: string;
  title?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
  loading?: boolean;
}) {
  const chartData = Object.entries(amountByCategory || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    }),
  );
  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const totalAmount = sortedData.reduce((sum, item) => sum + item.value, 0);
  const topItems = sortedData.slice(0, 5);

  const isDesktop = useMediaQuery("(min-width: 530px)");

  return (
    <Card className="w-full h-full min-h-[360px] md:min-h-[420px] flex flex-col overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3 ">
        <div>
          <CardTitle>{title || "Spending by Category"}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
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
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Year</SelectLabel>
                  {Array.from(
                    {
                      length: new Date().getFullYear() - (min_year || 2020) + 1,
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
      </CardHeader>
      <CardContent className="flex-1 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px] items-center">
        {sortedData.length === 0 ? (
          loading ? (
            <SpinnerUI />
          ) : (
            <NoDataUI />
          )
        ) : (
          <>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
              <div className="relative z-10">
                <ResponsiveContainer width="100%" height={height}>
                  {loading ? (
                    <SpinnerUI />
                  ) : (
                    <PieChart
                      margin={{
                        right: isDesktop ? 0 : 200,
                        top: isDesktop ? 0 : 10,
                      }}
                    >
                      <Pie
                        data={sortedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={isDesktop ? 110 : 95}
                        innerRadius={isDesktop ? 72 : 0}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {sortedData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        itemStyle={{ color: "#fff" }}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "12px",
                          border: "1px solid rgba(148,163,184,0.2)",
                          boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                        cursor={{ fill: "rgba(255, 255, 255, 0.12)" }}
                        formatter={(value: number) => [
                          `${currencyMapper(currency)}${value.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}`,
                        ]}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
                {isDesktop && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-2xl bg-background/80 px-4 py-2 text-center shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Total
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {currencyMapper(currency)}
                        {totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Top Categories
              </p>
              <div className="space-y-2">
                {topItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="truncate text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {totalAmount > 0
                        ? `${Math.round((item.value / totalAmount) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
    <CardTemplate
      title={title || "Top Contributors"}
      // description="Highlights your biggest spending items for the current period"
      className="w-full border-border/70 shadow-sm overflow-hidden"
    >
      <div className="mb-4 rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          This month
        </p>
        <p className="text-sm text-foreground">
          Biggest contributors by amount
        </p>
      </div>
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
                formatter={(value: number) =>
                  `${currencyMapper(currency)}${value.toFixed(2)}`
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
    </CardTemplate>
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
      title={title || "Spending Over Days"}
      // description="Tracks your expenses day by day for the current month"
      className="w-full h-full min-h-[360px] md:min-h-[420px] flex flex-col overflow-hidden border-border/70 shadow-sm"
    >
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <CardTitle>{title || "Spending Over Days"}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
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
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Month</SelectLabel>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem
                          key={month}
                          value={month.toString()}
                          disabled={
                            currentMonthYear === min_year && month < min_month
                          }
                        >
                          {new Date(0, month - 1).toLocaleString("default", {
                            month: "long",
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
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer height={height}>
              {loading ? (
                <SpinnerUI />
              ) : (
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
                    minTickGap={10}
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
                    formatter={(spent: number) =>
                      `${currencyMapper(currency)}${spent.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}`
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
              )}
            </ResponsiveContainer>
            <div className="mt-4 grid gap-2 sm:grid-cols-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Total
                </p>
                <p className="font-semibold text-foreground">
                  {currencyMapper(currency)}
                  {totalSpent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Daily Avg
                </p>
                <p className="font-semibold text-foreground">
                  {currencyMapper(currency)}
                  {avgSpent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Peak Day
                </p>
                <p className="font-semibold text-foreground">
                  Day {peakDay.day}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Last vs Prev
                </p>
                <TrendBadge trend={dayTrend} />
              </div>
            </div>
          </>
        ) : loading ? (
          <SpinnerUI />
        ) : (
          <NoDataUI />
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
  loading = false,
}: {
  amountByMonth?: ExpenseOverview["amountByMonth"];
  amountByMonthV2?: ExpenseOverview["monthlyCategoryExpense"];
  darkMode: boolean;
  currency?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
  loading: boolean;
}) {
  const [toggle, setToggle] = useState(true); // true for monthly, false for category
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [category, setCategory] = useState<{ id: string; name: string } | null>(
    null,
  );
  const categories = useSelector((state: RootState) => state.categoryExpense);
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
                      formatter={(value: number, name: string) => {
                        if (name === "amount")
                          return [
                            `${currencyMapper(currency)}${value.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}`,
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
                      formatter={(value: number) =>
                        `${currencyMapper(currency)}${value.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}`
                      }
                    />
                    {Object.keys(chartData[0])
                      .filter((key) => key !== "name")
                      .map((category, index) => {
                        if (category === "amount") return null;
                        return (
                          <Line
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
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
  currency = "USD",
  loading = false,
  setOverviewParams,
  overviewParams,
}: {
  amountByMonth?: ExpenseOverview["amountByMonth"];
  amountByMonthV2?: ExpenseOverview["monthlyCategoryExpense"];
  darkMode: boolean;
  currency?: string;
  setOverviewParams: React.Dispatch<
    React.SetStateAction<{ count?: number; type?: OverviewEnum }>
  >;
  overviewParams: { count?: number; type?: OverviewEnum };
  loading: boolean;
}) {
  const [toggle, setToggle] = useState(true); // true for monthly, false for category
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [category, setCategory] = useState<{ id: string; name: string } | null>(
    null,
  );
  const categories = useSelector((state: RootState) => state.categoryExpense);
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
    if (setOverviewParams) {
      switch (selectedTimeframe) {
        case 0:
          setOverviewParams({ count: 6, type: OverviewEnum.MONTH });
          break;
        case 1:
          setOverviewParams({ count: 1, type: OverviewEnum.YEAR });
          break;
        case 2:
          setOverviewParams({ count: 3, type: OverviewEnum.ALL_TIME });
          break;
        default:
          setOverviewParams({ count: 6, type: OverviewEnum.MONTH });
      }
    }
  }, [selectedTimeframe, setOverviewParams]);

  return (
    <Card className="w-full overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3 
      ">
        <CardTitle className="flex items-center justify-between w-fit gap-2">
          Expense Trends
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
            {overviewParams && (
              <Select
                onValueChange={(value) =>
                  setSelectedTimeframe(parseInt(value, 10))
                }
                value={selectedTimeframe.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Past 6 Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Choose Time Period</SelectLabel>
                    {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                      <SelectItem
                        key={index}
                        value={index.toString()}
                        onClick={() => setSelectedTimeframe(index)}
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
                ...categories.categories.map((category) => ({
                  label: category.name,
                  value: category.id,
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
            {overviewParams && (
              <Select
                onValueChange={(value) =>
                  setSelectedTimeframe(parseInt(value, 10))
                }
                value={selectedTimeframe.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Past 6 Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Choose Time Period</SelectLabel>
                    {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                      <SelectItem
                        key={index}
                        value={index.toString()}
                        onClick={() => setSelectedTimeframe(index)}
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
                      formatter={(value: number, name: string) => {
                        if (name === "amount")
                          return [
                            `${currencyMapper(currency)}${value.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}`,
                            "Amount",
                          ];
                        if (name === "trend") return [];
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#4ade80"
                      strokeWidth={2}
                      dot
                      activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                      isAnimationActive={true}
                      fill="#4ade80"
                      fillOpacity={0.12}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
                <div className="mt-4 grid gap-2 sm:grid-cols-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 
              text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </Label>
                  <p className="font-semibold text-foreground">
                    {currencyMapper(currency)}
                    {totalForPeriod.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Avg / Period
                  </Label>
                  <p className="font-semibold text-foreground">
                    {currencyMapper(currency)}
                    {avgForPeriod.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Peak
                  </Label>
                  <p className="font-semibold text-foreground">
                    {peakPeriod.name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Last vs Prev
                  </Label>
                  <TrendBadge trend={periodTrend} />
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
                      formatter={(value: number) =>
                        `${currencyMapper(currency)}${value.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}`
                      }
                    />
                    {Object.keys(chartData[0])
                      .filter((key) => key !== "name")
                      .map((category, index) => {
                        if (category === "amount") return null;
                        return (
                          <Line
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot
                            isAnimationActive={true}
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
                  <p className="font-semibold text-foreground">
                    {seriesCountV2}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Periods
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
                  <TrendBadge trend={categoryTrendV2} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
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
