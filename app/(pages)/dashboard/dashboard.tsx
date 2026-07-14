"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  FileWarning,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
  Banknote,
} from "lucide-react";

import { RootState } from "@/redux/store";
import { ExpenseOverview, IncomeOverview, OverviewEnum } from "@/global/dto";
import api from "@/lib/api";
import { IncomeExpenseComparisonChart } from "@/components/ExpenseChartCard";
import RemindersDashboardWidget from "@/components/reminders-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { currencyMapper } from "@/utils/currencyMapper";

import NewUserOnboarding from "./_components/new-user-onboarding";
import {
  formatAmountExact,
  formatAmountCompact,
} from "@/utils/amount_formatter";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [loadingYear, setLoadingYear] = useState<boolean>(true);
  const [loadingMonth, setLoadingMonth] = useState<boolean>(true);
  const [newUser, setNewUser] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().getFullYear(),
  );
  const [currentYearForYearly, setCurrentYearForYearly] = useState(
    new Date().getFullYear(),
  );

  const [incomeOverview, setIncomeOverview] = useState<IncomeOverview | null>(
    null,
  );
  const [loadingIncomeYear, setLoadingIncomeYear] = useState<boolean>(true);
  const [loadingIncomeMonth, setLoadingIncomeMonth] = useState<boolean>(true);
  const [incomeCurrentMonth, setIncomeCurrentMonth] = useState(
    new Date().getMonth() + 1,
  );
  const [incomeCurrentMonthYear, setIncomeCurrentMonthYear] = useState(
    new Date().getFullYear(),
  );
  const [incomeCurrentYearForYearly, setIncomeCurrentYearForYearly] = useState(
    new Date().getFullYear(),
  );

  const [compareOverviewParams, setCompareOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });

  const [expenseMonthlyCompare, setExpenseMonthlyCompare] = useState<
    Record<string, number>
  >({});
  const [incomeMonthlyCompare, setIncomeMonthlyCompare] = useState<
    Record<string, number>
  >({});
  const [compareLoading, setCompareLoading] = useState<boolean>(true);

  const fetchOverview = async ({
    monthYear = currentMonthYear,
    month = currentMonth,
    yearly = currentYearForYearly,
    hasConstraint = false,
    type = "",
  }: {
    monthYear?: number;
    month?: number;
    yearly?: number;
    hasConstraint: boolean;
    type?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (hasConstraint) {
        const includeMonth = type === "month" || type === "";
        const includeYear = type === "year" || type === "";

        if (includeMonth && month !== undefined && monthYear !== undefined) {
          queryParams.append("req_month", month.toString());
          queryParams.append("req_month_year", monthYear.toString());
        }

        if (includeYear && yearly !== undefined) {
          queryParams.append("req_year", yearly.toString());
        }
      }

      if (type === "") {
        setLoadingMonth(true);
        setLoadingYear(true);
      }
      if (type === "month") setLoadingMonth(true);
      if (type === "year") setLoadingYear(true);

      const res = await api.get(
        `/expenses/user/${user.id}/overview?${queryParams.toString()}`,
      );

      if (res.status !== 200) throw new Error("Network response was not ok");

      const data = res.data as ExpenseOverview;
      setNewUser(data.earliestStartYear === null);
      setOverview(data);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      if (type === "") {
        setLoadingMonth(false);
        setLoadingYear(false);
      }
      if (type === "month") setLoadingMonth(false);
      if (type === "year") setLoadingYear(false);
    }
  };

  const fetchIncomeOverview = async ({
    startDate,
    endDate,
    yearly = incomeCurrentYearForYearly,
    monthYear = incomeCurrentMonthYear,
    month = incomeCurrentMonth,
    hasConstraint = false,
    type = "",
  }: {
    startDate?: string;
    endDate?: string;
    yearly?: number;
    monthYear?: number;
    month?: number;
    hasConstraint: boolean;
    type?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);

      if (hasConstraint) {
        const includeMonth = type === "month" || type === "";
        const includeYear = type === "year" || type === "";

        if (includeMonth && month !== undefined && monthYear !== undefined) {
          queryParams.append("req_month", month.toString());
          queryParams.append("req_month_year", monthYear.toString());
        }

        if (includeYear && yearly !== undefined)
          queryParams.append("req_year", yearly.toString());
      }

      if (type === "") {
        setLoadingIncomeMonth(true);
        setLoadingIncomeYear(true);
      }
      if (type === "month") setLoadingIncomeMonth(true);
      if (type === "year") setLoadingIncomeYear(true);

      const res = await api.get(`/incomes/overview?${queryParams.toString()}`);
      if (res.status !== 200) throw new Error("Network response was not ok");

      setIncomeOverview(res.data as IncomeOverview);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      if (type === "") {
        setLoadingIncomeMonth(false);
        setLoadingIncomeYear(false);
      }
      if (type === "month") setLoadingIncomeMonth(false);
      if (type === "year") setLoadingIncomeYear(false);
    }
  };

  const fetchIncomeExpenseCompareOverview = async () => {
    try {
      setCompareLoading(true);

      const expenseParams = new URLSearchParams();
      const incomeParams = new URLSearchParams();

      if (compareOverviewParams.type) {
        expenseParams.append("type", compareOverviewParams.type);
        incomeParams.append("type", compareOverviewParams.type);
      }

      if (compareOverviewParams.count !== undefined) {
        expenseParams.append("count", compareOverviewParams.count.toString());
        incomeParams.append("count", compareOverviewParams.count.toString());
      }

      const [expenseRes, incomeRes] = await Promise.all([
        api.get(`/expenses/monthly?${expenseParams.toString()}`),
        api.get(`/incomes/monthly?${incomeParams.toString()}`),
      ]);

      if (expenseRes.status !== 200 || incomeRes.status !== 200) {
        throw new Error("Network response was not ok");
      }

      setExpenseMonthlyCompare(expenseRes.data || {});
      setIncomeMonthlyCompare(incomeRes.data || {});
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setCompareLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview({
      hasConstraint: true,
      month: currentMonth,
      monthYear: currentMonthYear,
      type: "month",
    });
  }, [currentMonth, currentMonthYear]);

  useEffect(() => {
    fetchOverview({
      hasConstraint: true,
      yearly: currentYearForYearly,
      type: "year",
    });
  }, [currentYearForYearly]);

  useEffect(() => {
    fetchIncomeOverview({
      hasConstraint: true,
      month: incomeCurrentMonth,
      monthYear: incomeCurrentMonthYear,
      type: "month",
    });
  }, [incomeCurrentMonth, incomeCurrentMonthYear]);

  useEffect(() => {
    fetchIncomeOverview({
      hasConstraint: true,
      yearly: incomeCurrentYearForYearly,
      type: "year",
    });
  }, [incomeCurrentYearForYearly]);

  useEffect(() => {
    const handler = () => {
      fetchOverview({ hasConstraint: true, type: "" });
    };
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      fetchIncomeOverview({ hasConstraint: true, type: "" });
    };
    window.addEventListener("income-added", handler);
    return () => window.removeEventListener("income-added", handler);
  }, []);

  useEffect(() => {
    fetchIncomeExpenseCompareOverview();
  }, [compareOverviewParams]);

  const refreshDashboardData = async () => {
    await Promise.all([
      fetchOverview({ hasConstraint: true, type: "" }),
      fetchIncomeOverview({ hasConstraint: true, type: "" }),
      fetchIncomeExpenseCompareOverview(),
    ]);
  };

  const handleFirstExpenseCreated = async () => {
    setNewUser(false);
    await refreshDashboardData();
  };

  const handleBudgetCreated = async () => {
    await fetchOverview({ hasConstraint: true, type: "" });
  };

  const budgetCount = overview
    ? Object.values(overview.budgetServiceMap).length
    : 0;

  if (newUser) {
    return (
      <NewUserOnboarding
        userId={user.id}
        onFirstExpenseCreated={handleFirstExpenseCreated}
        onBudgetCreated={handleBudgetCreated}
      />
    );
  }

  const monthLabel = new Date(
    currentMonthYear,
    Math.max(currentMonth - 1, 0),
  ).toLocaleString("default", { month: "long" });
  const selectedMonthStartDate = formatDateOnly(
    new Date(currentMonthYear, currentMonth - 1, 1),
  );
  const selectedMonthEndDate = formatDateOnly(
    new Date(currentMonthYear, currentMonth, 0),
  );
  const selectedIncomeMonthStartDate = formatDateOnly(
    new Date(incomeCurrentMonthYear, incomeCurrentMonth - 1, 1),
  );
  const selectedIncomeMonthEndDate = formatDateOnly(
    new Date(incomeCurrentMonthYear, incomeCurrentMonth, 0),
  );
  const todayLabel = new Date().toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const currency = currencyMapper(user?.currency || "USD");
  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const trimTrailingZero = (value: string) =>
    value.endsWith(".0") ? value.slice(0, -2) : value;

  const formatCompactValue = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${trimTrailingZero((value / 1_000_000_000).toFixed(1))}B`;
    }
    if (value >= 1_000_000) {
      return `${trimTrailingZero((value / 1_000_000).toFixed(1))}M`;
    }
    if (value >= 1_0000) {
      return `${trimTrailingZero((value / 1_000).toFixed(1))}K`;
    }
    return fmt(value);
  };

  const formatCompactCurrency = (value: number) => {
    const abs = Math.abs(value);
    const full = `${currency}${fmt(abs)}`;
    const short = `${currency}${formatCompactValue(abs)}`;
    return {
      full,
      short,
    };
  };

  const netSavings =
    incomeOverview?.total_balance ??
    (incomeOverview?.thisMonthTotalIncome ?? 0) -
      (overview?.thisMonthTotalExpense ?? 0);

  const monthExpenseDisplay = overview
    ? formatCompactCurrency(overview.thisMonthTotalExpense)
    : null;
  const monthIncomeDisplay = incomeOverview
    ? formatCompactCurrency(incomeOverview.thisMonthTotalIncome)
    : null;
  const totalBalanceDisplay =
    overview && incomeOverview ? formatCompactCurrency(netSavings) : null;
  const totalBalanceSign = netSavings >= 0 ? "" : "-";

  const topCategoryEntry = overview
    ? Object.entries(overview.amountByCategory).sort(([, a], [, b]) => b - a)[0]
    : null;

  const upcomingRecurring = (overview?.upcomingRecurringExpenses || []).slice(
    0,
    3,
  );
  const budgets = overview ? Object.values(overview.budgetServiceMap) : [];
  const displayBudgets = budgets.slice(0, 6);

  return (
    <div className="relative flex flex-col w-full gap-8 h-full px-4 md:px-0">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            {getGreeting()}, {user.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {todayLabel} · Tracking {monthLabel} {currentMonthYear}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live insights
        </div>
      </div>

      {/* ── Consolidated Hero Stats Panel ── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md p-6 md:p-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Net Balance (Primary focal point) */}
          <div className="flex flex-col justify-between space-y-3">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Net Balance
            </span>
            <div>
              {overview === null || incomeOverview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-3xl md:text-4xl font-light text-foreground font-mono tracking-tight">
                  {totalBalanceDisplay
                    ? `${totalBalanceSign}${totalBalanceDisplay.full}`
                    : "—"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {overview === null || incomeOverview === null
                  ? "..."
                  : netSavings >= 0
                    ? "Positive cash position"
                    : "Negative cash position"}
              </p>
            </div>
          </div>

          {/* Monthly Income (Interactive) */}
          <div className="group flex flex-col justify-between space-y-3 border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-6 md:pl-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                Monthly Income
              </span>
              {incomeOverview && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                    incomeOverview.thisMonthTotalIncome -
                      incomeOverview.lastMonthTotalIncome >
                    0
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {incomeOverview.thisMonthTotalIncome -
                    incomeOverview.lastMonthTotalIncome >=
                  0
                    ? "+"
                    : "-"}
                  {incomeOverview.lastMonthTotalIncome === 0 ||
                  incomeOverview.lastMonthTotalIncome === null
                    ? "100%"
                    : `${Math.abs(((incomeOverview.thisMonthTotalIncome - incomeOverview.lastMonthTotalIncome) / incomeOverview.lastMonthTotalIncome) * 100).toFixed(0)}%`}
                </span>
              )}
            </div>
            <div>
              {incomeOverview === null ? (
                <div className="h-8 w-28 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground font-mono tracking-tight">
                  {monthIncomeDisplay ? monthIncomeDisplay.full : "—"}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/dashboard/month/${incomeCurrentMonthYear}-${String(incomeCurrentMonth).padStart(2, "0")}?type=income`,
                  );
                }}
                className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline transition-colors mt-1.5 flex items-center gap-1 cursor-pointer font-medium"
              >
                View analytics <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Monthly Expense (Interactive) */}
          <div className="group flex flex-col justify-between space-y-3 border-t lg:border-t-0 lg:border-l border-border/40 pt-6 lg:pt-0 lg:pl-6 md:pl-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                Monthly Expense
              </span>
              {overview && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                    overview.thisMonthTotalExpense -
                      overview.lastMonthTotalExpense >
                    0
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {overview.thisMonthTotalExpense -
                    overview.lastMonthTotalExpense >
                  0
                    ? "+"
                    : "-"}
                  {overview.lastMonthTotalExpense === 0 ||
                  overview.lastMonthTotalExpense === null
                    ? "100%"
                    : `${Math.abs(((overview.thisMonthTotalExpense - overview.lastMonthTotalExpense) / overview.lastMonthTotalExpense) * 100).toFixed(0)}%`}
                </span>
              )}
            </div>
            <div>
              {overview === null ? (
                <div className="h-8 w-28 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground font-mono tracking-tight">
                  {monthExpenseDisplay ? monthExpenseDisplay.full : "—"}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/dashboard/month/${currentMonthYear}-${String(currentMonth).padStart(2, "0")}?type=expense`,
                  );
                }}
                className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline transition-colors mt-1.5 flex items-center gap-1 cursor-pointer font-medium"
              >
                View analytics <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Top Category */}
          <div className="flex flex-col justify-between space-y-3 border-t lg:border-t-0 lg:border-l border-border/40 pt-6 lg:pt-0 lg:pl-6 md:pl-8">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Top Category
            </span>
            <div>
              {overview === null ? (
                <div className="h-8 w-28 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground truncate max-w-[200px]">
                  {topCategoryEntry ? topCategoryEntry[0] : "None"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {overview === null
                  ? "..."
                  : topCategoryEntry
                    ? `${currency}${fmt(topCategoryEntry[1])} this year`
                    : "No spending this year"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Income vs Expense Chart & Reminders Widget ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in slide-in-from-top-4 duration-300">
        <motion.div
          className="lg:col-span-2 flex flex-col h-full"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <IncomeExpenseComparisonChart
            expenseByMonth={expenseMonthlyCompare}
            incomeByMonth={incomeMonthlyCompare}
            darkMode={user.theme === "dark"}
            currency={user.currency}
            loading={compareLoading}
            setOverviewParams={setCompareOverviewParams}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1 flex flex-col h-full"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={4.2}
        >
          <RemindersDashboardWidget />
        </motion.div>
      </div>

      {/* ── Budget + Recurring Side-by-Side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Section — 2/3 */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={5}
          className="lg:col-span-2"
        >
          <Card className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-medium text-foreground">
                    Budgets
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {budgetCount} active budget{budgetCount === 1 ? "" : "s"}
                  </p>
                </div>
                {budgetCount > 0 && (
                  <Link
                    href="/budget"
                    className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                  >
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </CardHeader>
            {overview ? (
              <CardContent>
                {displayBudgets.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No budgets found.
                  </p>
                ) : (
                  <div className="divide-y divide-border/30">
                    {displayBudgets.map((budget) => {
                      const pct = Math.round(
                        (budget.amountSpent / budget.amountLimit) * 100,
                      );
                      const variant = budgetVariant(
                        budget.amountSpent,
                        budget.amountLimit,
                      );
                      const progressColor =
                        variant === "success"
                          ? "bg-emerald-500"
                          : variant === "warning"
                            ? "bg-amber-500"
                            : "bg-rose-500";

                      const budgetCurrency = currencyMapper(
                        budget.currency || user.currency || "USD",
                      );

                      return (
                        <div
                          key={budget.id}
                          className="w-full py-4 first:pt-0 last:pb-0 grid grid-cols-[1fr_140px] items-center gap-6 group"
                        >
                          <div className="min-w-0 w-full space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground group-hover:text-emerald-500 transition-colors">
                                {budget.category.name}
                              </span>
                              {budgetIcon(
                                budget.amountSpent,
                                budget.amountLimit,
                              )}
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                                {budget.period}
                              </span>
                            </div>

                            {/* Minimal thin progress bar */}
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-foreground font-mono">
                              {budgetCurrency}
                              {budget.amountSpent.toFixed(0)}{" "}
                              <span className="text-muted-foreground text-xs font-light font-sans">
                                / {budgetCurrency}
                                {budget.amountLimit.toFixed(0)}
                              </span>
                            </p>
                            <span className="text-xs font-mono text-muted-foreground mt-0.5 block">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {budgets.length > 6 && (
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    +{budgets.length - 6} more budget
                    {budgets.length - 6 === 1 ? "" : "s"}
                  </p>
                )}
              </CardContent>
            ) : (
              <CardContent className="min-h-[140px] flex items-center justify-center">
                <Spinner className="text-muted-foreground h-6 w-6" />
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Recurring Expenses — 1/3 */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <Card className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                    <CalendarClock className="h-4.5 w-4.5 text-muted-foreground" />
                    Upcoming
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recurring expenses
                  </p>
                </div>
                <Link
                  href="/recurring-expense"
                  className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                >
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {overview === null ? (
                <div className="flex h-[120px] items-center justify-center">
                  <Spinner className="text-muted-foreground h-6 w-6" />
                </div>
              ) : upcomingRecurring.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No upcoming recurring expenses.
                </p>
              ) : (
                <div className="divide-y divide-border/30">
                  {upcomingRecurring.map((expense, index) => (
                    <div
                      key={`${expense.id || expense.description}-${index}`}
                      className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-emerald-500 transition-colors">
                          {expense.description}
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-0.5 font-mono"
                          style={{ fontFeatureSettings: '"tnum"' }}
                        >
                          {currencyMapper(expense.currency)}
                          {expense.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-foreground font-mono">
                          {formatDayNumberMonth(expense.nextOccurrence)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 font-mono">
                          {getWeekdayShort(expense.nextOccurrence)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function budgetVariant(amountSpent: number, amountLimit: number) {
  const usagePercentage = (amountSpent / amountLimit) * 100;

  if (usagePercentage <= 70) {
    return "success";
  } else if (usagePercentage > 70 && usagePercentage <= 100) {
    return "warning";
  } else {
    return "error";
  }
}

function budgetIcon(amountSpent: number, amountLimit: number) {
  const usagePercentage = (amountSpent / amountLimit) * 100;
  if (usagePercentage <= 70) {
    return <></>;
  } else if (usagePercentage > 70 && usagePercentage <= 100) {
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  } else {
    return <FileWarning className="h-4 w-4 text-red-500" />;
  }
}

function parseLocalDate(dateValue: string) {
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyRegex.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateValue);
}

function getWeekdayShort(dateValue: string) {
  const date = parseLocalDate(dateValue);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDayNumberMonth(dateValue: string) {
  const date = parseLocalDate(dateValue);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
