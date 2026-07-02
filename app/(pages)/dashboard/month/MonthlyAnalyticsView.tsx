"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import { currencyMapper } from "@/utils/currencyMapper";
import { formatAmountExact, formatAmountCompact } from "@/utils/amount_formatter";
import CategoryBadge from "@/components/category-badge";
import { ProgressBar } from "@/components/ProgressBar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  TrendingUpIcon,
  Activity,
  DollarSign,
  PieChartIcon,
  Info,
  CalendarDays,
  Percent,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MonthlyAnalyticsViewProps {
  monthParam: string; // "YYYY-MM"
  typeParam: "expense" | "income";
  isModal?: boolean;
}

export default function MonthlyAnalyticsView({
  monthParam,
  typeParam,
  isModal = false,
}: MonthlyAnalyticsViewProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const isDark = user?.theme === "dark";

  const [yearStr, monthStr] = monthParam.split("-");
  const year = parseInt(yearStr) || new Date().getFullYear();
  const monthNum = parseInt(monthStr) || (new Date().getMonth() + 1);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction filter & sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  // Transaction detail modal state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // SSR safety
  const [mounted, setMounted] = useState(false);

  const currencySymbol = currencyMapper(user?.currency || "USD");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/analytics/monthly", {
        params: {
          year,
          month: monthNum,
          type: typeParam,
        },
      });
      setAnalyticsData(res.data);
    } catch (err: any) {
      console.error("Error fetching monthly analytics:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (monthParam) {
      fetchAnalytics();
    }
  }, [monthParam, typeParam]);

  // Format month name
  const monthName = useMemo(() => {
    const d = new Date(year, monthNum - 1, 1);
    return d.toLocaleString("default", { month: "long" });
  }, [year, monthNum]);

  // Categories list for dropdown filter
  const categoryFiltersList = useMemo(() => {
    if (!analyticsData?.categoryAnalytics) return [];
    return analyticsData.categoryAnalytics.map((c: any) => ({
      id: c.categoryId,
      name: c.categoryName,
    }));
  }, [analyticsData]);

  // Category Map for mapping transactions to category icon & color
  const categoryMap = useMemo(() => {
    const map = new Map<string, { color: string; icon: string }>();
    if (analyticsData?.categoryAnalytics) {
      analyticsData.categoryAnalytics.forEach((cat: any) => {
        map.set(cat.categoryId, {
          color: cat.categoryColor,
          icon: cat.categoryIcon,
        });
      });
    }
    return map;
  }, [analyticsData]);

  // Filter & Sort Transactions
  const processedTransactions = useMemo(() => {
    if (!analyticsData?.recentTransactions) return [];
    
    let list = [...analyticsData.recentTransactions];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.categoryName?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategoryFilter !== "all") {
      list = list.filter((t) => t.categoryId === selectedCategoryFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.expenseDate || b.incomeDate || b.date || 0).getTime() - new Date(a.expenseDate || a.incomeDate || a.date || 0).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.expenseDate || a.incomeDate || a.date || 0).getTime() - new Date(b.expenseDate || b.incomeDate || b.date || 0).getTime();
      }
      if (sortBy === "amount_desc") {
        return (b.displayAmount ?? b.amount) - (a.displayAmount ?? a.amount);
      }
      if (sortBy === "amount_asc") {
        return (a.displayAmount ?? a.amount) - (b.displayAmount ?? b.amount);
      }
      return 0;
    });

    return list;
  }, [analyticsData, searchQuery, selectedCategoryFilter, sortBy]);

  // Open receipt helper
  const handleOpenReceipt = async (transactionId: string) => {
    try {
      const response = await api.get(`/expenses/get-download-url/eid/${transactionId}`);
      const downloadUrl = response.data?.url || response.data?.key;
      if (!downloadUrl) {
        toast.error("Receipt link not available");
        return;
      }
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error opening receipt:", err);
      toast.error("Failed to load receipt attachment");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4 py-12">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing financial data...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full text-center p-6 border border-border/40 rounded-2xl bg-card/25">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-semibold text-foreground">Could not load analytics</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">{error || "No data returned from the server."}</p>
        <Button onClick={fetchAnalytics} variant="outline" className="mt-6">
          Retry Request
        </Button>
      </div>
    );
  }

  const {
    summary = {},
    monthComparisons = {},
    categoryAnalytics = [],
    dailyAnalytics = {},
    budgetAnalytics = null,
    insights = {},
    incomeVsExpenseSummary = {},
  } = analyticsData;

  const totalAmount = summary.totalAmount ?? 0;
  const isExpense = typeParam === "expense";

  // Chart Formatting Tools
  const formatChartCurrency = (val: number) => {
    return `${formatAmountCompact(val)}`;
  };

  // Pie chart data mapping
  const pieData = categoryAnalytics.map((cat: any) => ({
    name: cat.categoryName,
    value: cat.totalAmount ?? 0,
    color: cat.categoryColor || "#cbd5e1",
    percentage: cat.percentageOfTotal ?? 0,
  }));

  // Daily totals line chart mapping
  const dailyData = (dailyAnalytics.dailyTotals || []).map((day: any) => {
    const dateObj = new Date(day.date);
    const label = dateObj.toLocaleDateString(undefined, { day: "numeric" });
    return {
      dateStr: day.date,
      name: label,
      amount: day.totalAmount ?? 0,
    };
  });

  // Historical data bar chart mapping
  const historicalData = (monthComparisons.historicalData || []).map((hist: any) => ({
    year: String(hist.year),
    amount: hist.totalAmount ?? 0,
    count: hist.transactionCount ?? 0,
  }));

  return (
    <div className="space-y-8 w-full pb-8">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Monthly Analytics
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
            {monthName} {year}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your monthly {isExpense ? "expenses" : "income"} and spending habits.
          </p>
        </div>

        {/* Header Comparisons & Stats */}
        <div className="grid grid-cols-2 gap-3 w-full md:flex md:w-auto md:gap-4">
          {/* MoM Card */}
          <div className="border border-border/40 bg-card/25 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-between w-full md:w-40 min-h-[70px]">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">MoM Change</span>
            <div className="flex items-center gap-1.5 mt-1">
              {monthComparisons.previousMonth?.percentageChange !== null ? (
                <>
                  {monthComparisons.previousMonth?.percentageChange >= 0 ? (
                    <TrendingUp className={`h-4 w-4 ${isExpense ? "text-rose-500" : "text-emerald-500"}`} />
                  ) : (
                    <TrendingDown className={`h-4 w-4 ${isExpense ? "text-emerald-500" : "text-rose-500"}`} />
                  )}
                  <span className={`text-sm font-semibold ${
                    monthComparisons.previousMonth?.percentageChange >= 0
                      ? isExpense ? "text-rose-500" : "text-emerald-500"
                      : isExpense ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {Math.abs(monthComparisons.previousMonth.percentageChange).toFixed(1)}%
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">No baseline</span>
              )}
            </div>
            {monthComparisons.previousMonth?.differenceAmount !== undefined && (
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {monthComparisons.previousMonth.differenceAmount >= 0 ? "+" : "-"}
                {currencySymbol}{Math.abs(monthComparisons.previousMonth.differenceAmount).toFixed(2)}
              </span>
            )}
          </div>

          {/* YoY Card */}
          <div className="border border-border/40 bg-card/25 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-between w-full md:w-40 min-h-[70px]">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">YoY Change</span>
            <div className="flex items-center gap-1.5 mt-1">
              {monthComparisons.sameMonthLastYear?.percentageChange !== null ? (
                <>
                  {monthComparisons.sameMonthLastYear?.percentageChange >= 0 ? (
                    <TrendingUp className={`h-4 w-4 ${isExpense ? "text-rose-500" : "text-emerald-500"}`} />
                  ) : (
                    <TrendingDown className={`h-4 w-4 ${isExpense ? "text-emerald-500" : "text-rose-500"}`} />
                  )}
                  <span className={`text-sm font-semibold ${
                    monthComparisons.sameMonthLastYear?.percentageChange >= 0
                      ? isExpense ? "text-rose-500" : "text-emerald-500"
                      : isExpense ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {Math.abs(monthComparisons.sameMonthLastYear.percentageChange).toFixed(1)}%
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">No baseline</span>
              )}
            </div>
            {monthComparisons.sameMonthLastYear?.differenceAmount !== undefined && (
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {monthComparisons.sameMonthLastYear.differenceAmount >= 0 ? "+" : "-"}
                {currencySymbol}{Math.abs(monthComparisons.sameMonthLastYear.differenceAmount).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CONSISTENT QUICK STATS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total {isExpense ? "Spent" : "Earned"}</span>
          <span className="text-xl font-bold text-foreground font-mono mt-1">
            {currencySymbol}{totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Transactions</span>
          <span className="text-xl font-bold text-foreground font-mono mt-1">
            {summary.totalTransactions ?? 0}
          </span>
        </div>

        <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Average Amount</span>
          <span className="text-xl font-bold text-foreground font-mono mt-1">
            {currencySymbol}{(summary.averageTransactionAmount ?? 0).toFixed(2)}
          </span>
        </div>

        <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Highest Transaction</span>
          <span className="text-xl font-bold text-foreground font-mono mt-1">
            {currencySymbol}{(summary.highestTransactionAmount ?? 0).toFixed(2)}
          </span>
        </div>

        <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Highest Day</span>
          <span className="text-xs font-semibold text-foreground mt-2 truncate">
            {summary.highestSpendingEarningDay
              ? new Date(summary.highestSpendingEarningDay).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
        </div>

        <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Average Per Day</span>
          <span className="text-xl font-bold text-foreground font-mono mt-1">
            {currencySymbol}{(summary.averageAmountPerDay ?? 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── CHARTS CONTAINER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending Trend (2/3 width) */}
        <Card className="lg:col-span-2 border-border/40 shadow-none bg-card/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Daily Trend</CardTitle>
            <CardDescription>Daily breakdown of {isExpense ? "spending" : "income"}</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {mounted && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isExpense ? "#f43f5e" : "#10b981"} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={isExpense ? "#f43f5e" : "#10b981"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? "#94a3b8" : "#64748b"}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? "#94a3b8" : "#64748b"}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatChartCurrency}
                    width={55}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${currencySymbol}${Number(val).toFixed(2)}`, "Total"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const originalDate = payload[0].payload.dateStr;
                        return new Date(originalDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: "8px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={isExpense ? "#f43f5e" : "#10b981"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category breakdown (1/3 width) */}
        <Card className="border-border/40 shadow-none bg-card/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex flex-col items-center justify-center relative">
            {mounted && pieData.length > 0 ? (
              <>
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: any) => [`${currencySymbol}${Number(val).toFixed(2)}`, "Total"]}
                        contentStyle={{
                          backgroundColor: isDark ? "#0f172a" : "#ffffff",
                          borderColor: isDark ? "#334155" : "#e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Minimal Legend */}
                <div className="w-full max-h-[80px] overflow-y-auto mt-2 grid grid-cols-2 gap-2 text-xs">
                  {pieData.slice(0, 4).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="truncate text-muted-foreground">{entry.name}</span>
                      <span className="font-semibold text-foreground font-mono">{entry.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                  {pieData.length > 4 && (
                    <div className="col-span-2 text-center text-[10px] text-muted-foreground font-medium">
                      + {pieData.length - 4} more categories
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No category breakdown
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── HISTORICAL CHART & BUDGET SECTION & MoM SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Historical Year Comparison */}
        <Card className="border-border/40 shadow-none bg-card/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Historical Comparison</CardTitle>
            <CardDescription>{monthName} performance over years</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            {mounted && historicalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="year" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} tickLine={false} />
                  <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatChartCurrency} width={55} />
                  <RechartsTooltip
                    formatter={(val: any) => [`${currencySymbol}${Number(val).toFixed(2)}`, "Total"]}
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill={isExpense ? "#fda4af" : "#a7f3d0"} radius={[4, 4, 0, 0]}>
                    {historicalData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={parseInt(entry.year) === year ? (isExpense ? "#f43f5e" : "#10b981") : (isExpense ? "#fca5a5" : "#6ee7b7")}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No historical comparison data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Section (Expense Only) */}
        {isExpense ? (
          <Card className="border-border/40 shadow-none bg-card/15">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Monthly Budget Status</CardTitle>
              <CardDescription>Budget utilization overview</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-[200px] py-2">
              {budgetAnalytics ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Utilization</span>
                    <span className={`text-lg font-bold font-mono ${budgetAnalytics.overBudget ? "text-rose-500 animate-pulse" : "text-emerald-500"}`}>
                      {budgetAnalytics.budgetUtilizationPercentage?.toFixed(1)}%
                    </span>
                  </div>

                  <ProgressBar
                    value={budgetAnalytics.amountSpent}
                    max={budgetAnalytics.budgetAmount}
                    variant={budgetAnalytics.overBudget ? "error" : "success"}
                    className="w-full"
                  />

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/30 pt-3">
                    <div>
                      <p className="text-muted-foreground">Limit</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {currencySymbol}{(budgetAnalytics.budgetAmount ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{budgetAnalytics.overBudget ? "Over Budget By" : "Remaining"}</p>
                      <p className={`font-semibold mt-0.5 ${budgetAnalytics.overBudget ? "text-rose-500" : "text-emerald-500"}`}>
                        {currencySymbol}{Math.abs(budgetAnalytics.remainingAmount ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {budgetAnalytics.overBudget && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-rose-500 bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/25">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Warning: Monthly limit exceeded!
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Info className="h-6 w-6 text-muted-foreground mb-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {year === new Date().getFullYear() && monthNum === (new Date().getMonth() + 1)
                      ? "No active budget set for this month"
                      : "Budget data is only available for the current month"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/40 shadow-none bg-card/15">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Income vs Expense Summary</CardTitle>
              <CardDescription>Consolidated statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex flex-col justify-between py-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Total Income</span>
                  <span className="font-semibold text-emerald-500 font-mono">
                    {currencySymbol}{(incomeVsExpenseSummary.totalIncome ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="font-semibold text-rose-500 font-mono">
                    {currencySymbol}{(incomeVsExpenseSummary.totalExpense ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border/30 pt-2 flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">Net Savings</span>
                  <span className={`font-mono ${(incomeVsExpenseSummary.netSavings ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatAmountCompact(incomeVsExpenseSummary.netSavings ?? 0)}
                  </span>
                </div>
              </div>

              {incomeVsExpenseSummary.savingsPercentage !== undefined && (
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Savings Rate</span>
                    <span>{incomeVsExpenseSummary.savingsPercentage}%</span>
                  </div>
                  <ProgressBar
                    value={Math.max(0, incomeVsExpenseSummary.savingsPercentage)}
                    max={100}
                    variant="success"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* MoM Performance summary card */}
        <Card className="border-border/40 shadow-none bg-card/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Net Savings Rate</CardTitle>
            <CardDescription>Income vs Expense Summary</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex flex-col justify-between py-2">
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Income:</span>
                <span className="font-semibold text-foreground font-mono">
                  {currencySymbol}{(incomeVsExpenseSummary.totalIncome ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Expense:</span>
                <span className="font-semibold text-foreground font-mono">
                  {currencySymbol}{(incomeVsExpenseSummary.totalExpense ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border/30 pt-3 flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Net Savings:</span>
                <span className={`font-mono ${(incomeVsExpenseSummary.netSavings ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatAmountCompact(incomeVsExpenseSummary.netSavings ?? 0)}
                </span>
              </div>

              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Savings percentage</span>
                  <span>{incomeVsExpenseSummary.savingsPercentage ?? 0}%</span>
                </div>
                <ProgressBar
                  value={Math.max(0, incomeVsExpenseSummary.savingsPercentage ?? 0)}
                  max={100}
                  variant={(incomeVsExpenseSummary.savingsPercentage ?? 0) > 20 ? "success" : "warning"}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── INSIGHTS SECTION ── */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Insights & Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="border border-border/40 bg-card/25 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Largest Category</span>
            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground truncate">{insights.largestCategoryName || "N/A"}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {insights.largestCategoryAmount ? `${currencySymbol}${insights.largestCategoryAmount.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          <div className="border border-border/40 bg-card/25 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Largest Transaction</span>
            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground truncate" title={insights.largestTransactionDescription}>
                {insights.largestTransactionDescription || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {insights.largestTransactionAmount ? `${currencySymbol}${insights.largestTransactionAmount.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          <div className="border border-border/40 bg-card/25 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Most Frequent Category</span>
            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground truncate">{insights.mostFrequentCategoryName || "N/A"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {insights.mostFrequentCategoryCount ? `${insights.mostFrequentCategoryCount} transactions` : "—"}
              </p>
            </div>
          </div>

          <div className="border border-border/40 bg-card/25 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">No-Spend Days</span>
            <div className="mt-3">
              <p className="text-sm font-semibold text-foreground">{insights.noSpendIncomeDaysCount ?? 0} Days</p>
              <p className="text-xs text-muted-foreground mt-0.5">Without any financial output</p>
            </div>
          </div>

          <div className="border border-border/40 bg-card/25 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Largest Increase</span>
            <div className="mt-3">
              {insights.biggestIncreaseCategory ? (
                <>
                  <p className="text-sm font-semibold text-rose-500 truncate">
                    {insights.biggestIncreaseCategory.categoryName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    +{currencySymbol}{insights.biggestIncreaseCategory.differenceAmount?.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-muted-foreground mt-1">None detected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY ANALYTICS DETAILED TABLE ── */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Category Analytics</h2>
        <Card className="border-border/40 shadow-none overflow-hidden bg-card/15">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Amount Spent</th>
                  <th className="px-6 py-3.5">Share</th>
                  <th className="px-6 py-3.5">Transactions Count</th>
                  <th className="px-6 py-3.5">Prev Month MoM</th>
                  <th className="px-6 py-3.5">Prev Year YoY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {categoryAnalytics.length > 0 ? (
                  categoryAnalytics.map((cat: any, idx: number) => {
                    const momComp = cat.previousMonthComparison || {};
                    const yoyComp = cat.sameMonthLastYearComparison || {};

                    return (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <CategoryBadge name={cat.categoryName} icon={cat.categoryIcon} color={cat.categoryColor} />
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">
                          {currencySymbol}{(cat.totalAmount ?? 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <span className="font-mono text-xs text-muted-foreground min-w-[32px]">{cat.percentageOfTotal?.toFixed(0)}%</span>
                            <div className="relative flex h-1.5 w-16 items-center rounded-full bg-muted/40">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: cat.categoryColor || "#10b981",
                                  width: `${cat.percentageOfTotal}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono">{cat.transactionCount ?? 0}</td>
                        <td className="px-6 py-4">
                          {momComp.percentageChange !== null && momComp.percentageChange !== undefined ? (
                            <div className="flex items-center gap-1">
                              {momComp.percentageChange >= 0 ? (
                                <ChevronUp className="h-3.5 w-3.5 text-rose-500" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              <span className={`font-mono text-xs font-semibold ${momComp.percentageChange >= 0 ? "text-rose-500" : "text-emerald-500"}`}>
                                {Math.abs(momComp.percentageChange).toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {yoyComp.percentageChange !== null && yoyComp.percentageChange !== undefined ? (
                            <div className="flex items-center gap-1">
                              {yoyComp.percentageChange >= 0 ? (
                                <ChevronUp className="h-3.5 w-3.5 text-rose-500" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              <span className={`font-mono text-xs font-semibold ${yoyComp.percentageChange >= 0 ? "text-rose-500" : "text-emerald-500"}`}>
                                {Math.abs(yoyComp.percentageChange).toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No categories analytic data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── TRANSACTION LISTING ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Transaction List</h2>
          <span className="text-xs text-muted-foreground font-medium">
            Showing {processedTransactions.length} of {summary.totalTransactions ?? 0} transactions
          </span>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 bg-muted/10 p-3.5 rounded-xl border border-border/40">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description or category..."
              className="pl-9 bg-background/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-48">
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryFiltersList.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Selector */}
          <div className="w-full sm:w-48">
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date: Newest First</SelectItem>
                <SelectItem value="date_asc">Date: Oldest First</SelectItem>
                <SelectItem value="amount_desc">Amount: Highest First</SelectItem>
                <SelectItem value="amount_asc">Amount: Lowest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table/List View */}
        <Card className="border-border/40 shadow-none overflow-hidden bg-card/15">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3.5">Transaction Date</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {processedTransactions.length > 0 ? (
                  processedTransactions.map((tx: any) => {
                    const amount = tx.displayAmount ?? tx.amount;
                    const dateFormatted = new Date(tx.expenseDate || tx.incomeDate || tx.date || 0).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const catMeta = categoryMap.get(tx.categoryId);

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setDetailModalOpen(true);
                        }}
                        className="hover:bg-muted/15 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">{dateFormatted}</td>
                        <td className="px-6 py-4 font-semibold max-w-[200px] truncate">{tx.description}</td>
                        <td className="px-6 py-4">
                          <CategoryBadge name={tx.categoryName} icon={catMeta?.icon} color={catMeta?.color} />
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-semibold">
                          <span className={isExpense ? "text-foreground" : "text-emerald-500"}>
                            {currencySymbol}{amount.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No transactions match current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {summary.totalTransactions > 0 && (
            <div className="border-t border-border/40 p-4 flex justify-center bg-muted/5">
              <Button
                variant="outline"
                onClick={() => {
                  const startDate = `${year}-${String(monthNum).padStart(2, "0")}-01`;
                  const lastDay = new Date(year, monthNum, 0).getDate();
                  const endDateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
                  router.push(
                    isExpense
                      ? `/expense?start_date=${startDate}&end_date=${endDateStr}`
                      : `/income?start_date=${startDate}&end_date=${endDateStr}`
                  );
                }}
                className="text-xs font-semibold gap-1.5 flex items-center hover:bg-muted/10 cursor-pointer"
              >
                View all {summary.totalTransactions} transactions in ledger
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ── TRANSACTION DETAIL DIALOG MODAL ── */}
      {selectedTransaction && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-md bg-background border border-border">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-foreground max-w-[220px] break-words">
                    {selectedTransaction.description}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {selectedTransaction.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold font-mono">
                    {currencySymbol}{(selectedTransaction.displayAmount ?? selectedTransaction.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currency: {selectedTransaction.displayCurrency || selectedTransaction.currency}
                  </p>
                </div>
              </div>

              {/* Data list */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Date</span>
                  <span className="font-medium text-foreground mt-1 block">
                    {new Date(selectedTransaction.expenseDate || selectedTransaction.incomeDate || selectedTransaction.date || 0).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Category</span>
                  <span className="mt-1 block">
                    <CategoryBadge
                      name={selectedTransaction.categoryName}
                      icon={categoryMap.get(selectedTransaction.categoryId)?.icon}
                      color={categoryMap.get(selectedTransaction.categoryId)?.color}
                    />
                  </span>
                </div>
              </div>

              {/* Receipt Attachment Section */}
              {isExpense && (
                <div className="border-t border-border/40 pt-4 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Receipt Attachment</span>
                  {selectedTransaction.receiptUrl ? (
                    <div className="flex items-center justify-between bg-muted/10 p-3 rounded-lg border border-border/40">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-foreground truncate max-w-[180px]">
                          {selectedTransaction.receiptUrl.split("/").pop() || "receipt_attachment"}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleOpenReceipt(selectedTransaction.id)}
                        variant="ghost"
                        size="sm"
                        className="text-emerald-500 hover:text-emerald-400 hover:bg-transparent"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No receipt attached to this transaction</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
