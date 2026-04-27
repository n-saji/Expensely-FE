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
import {
  ExpenseOverview,
  ExpenseOverviewV2,
  IncomeOverview,
  OverviewEnum,
} from "@/global/dto";
import api from "@/lib/api";
import CardComponent from "@/components/CardComponent";
import { IncomeExpenseComparisonChart } from "@/components/ExpenseChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ProgressBar } from "@/components/ProgressBar";
import { currencyMapper } from "@/utils/currencyMapper";

import NewUserOnboarding from "./_components/new-user-onboarding";

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

  const netSavings =
    incomeOverview?.total_balance ??
    (incomeOverview?.thisMonthTotalIncome ?? 0) -
      (overview?.thisMonthTotalExpense ?? 0);

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

      {/* ── 4 Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onClick={() =>
            router.push(
              `/expense?start_date=${selectedMonthStartDate}&end_date=${selectedMonthEndDate}`,
            )
          }
        >
          <CardComponent
            title={`${monthLabel} Expense`}
            icon={<Wallet className="h-4 w-4" />}
            accentColor="#ef4444"
            cardAction={
              overview && (
                <div
                  className={`flex items-center gap-1 rounded-md px-2 py-1 border ${
                    overview.thisMonthTotalExpense -
                      overview.lastMonthTotalExpense >
                    0
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {overview.thisMonthTotalExpense -
                    overview.lastMonthTotalExpense >
                  0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <p className="text-xs font-mono">
                    {overview.lastMonthTotalExpense === 0 ||
                    overview.lastMonthTotalExpense === null
                      ? "100%"
                      : `${Math.abs(((overview.thisMonthTotalExpense - overview.lastMonthTotalExpense) / overview.lastMonthTotalExpense) * 100).toFixed(1)}%`}
                  </p>
                </div>
              )
            }
            numberData={
              overview
                ? `${currency}${fmt(overview.thisMonthTotalExpense)}`
                : undefined
            }
            description={
              overview
                ? `${currency}${fmt(Math.abs(overview.thisMonthTotalExpense - overview.lastMonthTotalExpense))} ${overview.thisMonthTotalExpense - overview.lastMonthTotalExpense > 0 ? "more" : "less"} than last month`
                : undefined
            }
            loading={overview === null}
          />
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onClick={() =>
            router.push(
              `/income?start_date=${selectedIncomeMonthStartDate}&end_date=${selectedIncomeMonthEndDate}`,
            )
          }
        >
          <CardComponent
            title={`${monthLabel} Income`}
            icon={<Banknote className="h-4 w-4" />}
            accentColor="#22c55e"
            cardAction={
              incomeOverview && (
                <div
                  className={`flex items-center gap-1 rounded-md px-2 py-1 border ${
                    incomeOverview.thisMonthTotalIncome -
                      incomeOverview.lastMonthTotalIncome >
                    0
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-400"
                  }`}
                >
                  {incomeOverview.thisMonthTotalIncome -
                    incomeOverview.lastMonthTotalIncome >
                  0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <p className="text-xs font-mono">
                    {incomeOverview.lastMonthTotalIncome === 0 ||
                    incomeOverview.lastMonthTotalIncome === null
                      ? incomeOverview.thisMonthTotalIncome === 0
                        ? "0%"
                        : "100%"
                      : `${Math.abs(((incomeOverview.thisMonthTotalIncome - incomeOverview.lastMonthTotalIncome) / incomeOverview.lastMonthTotalIncome) * 100).toFixed(1)}%`}
                  </p>
                </div>
              )
            }
            numberData={
              incomeOverview
                ? `${currency}${fmt(incomeOverview.thisMonthTotalIncome)}`
                : undefined
            }
            description={
              incomeOverview
                ? `${currency}${fmt(Math.abs(incomeOverview.thisMonthTotalIncome - incomeOverview.lastMonthTotalIncome))} ${incomeOverview.thisMonthTotalIncome - incomeOverview.lastMonthTotalIncome > 0 ? "more" : "less"} than last month`
                : undefined
            }
            loading={incomeOverview === null}
          />
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <CardComponent
            title="Total Balance"
            icon={<PiggyBank className="h-4 w-4" />}
            accentColor={netSavings >= 0 ? "#22c55e" : "#ef4444"}
            numberData={
              overview && incomeOverview
                ? `${netSavings >= 0 ? "+" : "-"}${currency}${fmt(Math.abs(netSavings))}`
                : undefined
            }
            description={
              overview && incomeOverview
                ? netSavings >= 0
                  ? "Positive net balance till date"
                  : "Negative net balance till date"
                : undefined
            }
            loading={overview === null || incomeOverview === null}
            cardAction={
              overview &&
              incomeOverview && (
                <div
                  className={`flex items-center gap-1 rounded-md px-2 py-1 border ${
                    netSavings >= 0
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-400"
                  }`}
                >
                  {netSavings >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {/* <p className="text-xs font-mono">
                    {netSavings >= 0 ? "+" : "-"}
                  </p> */}
                </div>
              )
            }
          />
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <CardComponent
            title="Top Category"
            icon={<TrendingUp className="h-4 w-4" />}
            accentColor="#8b5cf6"
            numberData={topCategoryEntry ? topCategoryEntry[0] : "N/A"}
            description={
              topCategoryEntry
                ? `${currency}${fmt(topCategoryEntry[1])} spent this year`
                : "No expenses recorded yet"
            }
            loading={overview === null}
          />
        </motion.div>
      </div>

      {/* ── Income vs Expense Chart ── */}
      <motion.div
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
          <Card className="w-full h-full border-border/70 shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Budgets</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgetCount} active budget{budgetCount === 1 ? "" : "s"}
                  </p>
                </div>
                {budgetCount > 0 && (
                  <Link
                    href="/budget"
                    className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardHeader>
            {overview ? (
              <CardContent>
                {displayBudgets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No budgets found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayBudgets.map((budget) => {
                      const pct = Math.round(
                        (budget.amountSpent / budget.amountLimit) * 100,
                      );
                      const variant = budgetVariant(
                        budget.amountSpent,
                        budget.amountLimit,
                      );
                      const borderColor =
                        variant === "success"
                          ? "#22c55e"
                          : variant === "warning"
                            ? "#eab308"
                            : "#ef4444";
                      return (
                        <div
                          key={budget.id}
                          className="group relative rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-emerald-500/30 overflow-hidden"
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                            style={{ backgroundColor: borderColor }}
                          />
                          <div className="flex flex-wrap justify-between gap-2 items-center">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-foreground">
                                {budget.category.name}
                              </Label>
                              {budgetIcon(
                                budget.amountSpent,
                                budget.amountLimit,
                              )}
                            </div>
                            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {budget.period}
                            </div>
                          </div>
                          <div className="mt-3 rounded-full bg-muted/60 p-1">
                            <ProgressBar
                              value={budget.amountSpent}
                              max={budget.amountLimit}
                              variant={variant}
                              showAnimation={true}
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {currency}
                              {budget.amountSpent.toFixed(2)} / {currency}
                              {budget.amountLimit.toFixed(2)}
                            </span>
                            <span className="font-mono">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {budgets.length > 6 && (
                  <p className="mt-3 text-xs text-muted-foreground text-center">
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
          <Card className="w-full h-full border-border/70 shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    Upcoming
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recurring expenses
                  </p>
                </div>
                <Link
                  href="/recurring-expense"
                  className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {overview === null ? (
                <div className="flex h-[120px] items-center justify-center">
                  <Spinner className="text-muted-foreground h-6 w-6" />
                </div>
              ) : upcomingRecurring.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming recurring expenses.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingRecurring.map((expense, index) => (
                    <div
                      key={`${expense.id || expense.description}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 transition-all hover:border-border hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {expense.description}
                        </p>
                        <p
                          className="text-xs text-muted-foreground mt-0.5"
                          style={{ fontFeatureSettings: '"tnum"' }}
                        >
                          {currency}
                          {expense.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="h-12 w-12 shrink-0 rounded-lg border border-border/70 bg-background/80 flex flex-col items-center justify-center">
                        <p className="text-[10px] leading-none text-muted-foreground">
                          {getWeekdayShort(expense.nextOccurrence)}
                        </p>
                        <p className="mt-1 text-xs leading-none font-medium text-foreground">
                          {formatDayNumberMonth(expense.nextOccurrence)}
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
