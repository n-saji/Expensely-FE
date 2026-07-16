"use client";

import { useEffect, useState, useMemo } from "react";
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
  GripVertical,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

import { RootState } from "@/redux/store";
import { ExpenseOverview, IncomeOverview, OverviewEnum, ExpenseOverviewV2 } from "@/global/dto";
import api from "@/lib/api";
import PieChartComp, {
  IncomeExpenseComparisonChart,
  ExpensesOverDays,
  YearlyExpenseLineChartV2,
} from "@/components/ExpenseChartCard";
import RemindersDashboardWidget from "@/components/reminders-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { currencyMapper } from "@/utils/currencyMapper";

import NewUserOnboarding from "./_components/new-user-onboarding";
import {
  formatAmountExact,
  formatAmountCompact,
} from "@/utils/amount_formatter";
import { Button } from "@/components/ui/button";

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

let hasHydrated = false;

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector(
    (state: RootState) => state.categoryExpense.categories,
  );
  const categoryMetaByName = useMemo(() => {
    return Object.fromEntries(
      (categories || [])
        .filter((category) => category.name)
        .map((category) => [category.name as string, category]),
    );
  }, [categories]);

  const { open: sidebarOpen, isMobile } = useSidebar();
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

  // New chart states
  const [expenseOverviewV2, setExpenseOverviewV2] = useState<ExpenseOverviewV2 | null>(null);
  const [expenseOverviewV2Loading, setExpenseOverviewV2Loading] = useState<boolean>(true);
  const [expenseOverviewParams, setExpenseOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });

  const [incomeOverviewV2, setIncomeOverviewV2] = useState<ExpenseOverviewV2 | null>(null);
  const [incomeOverviewV2Loading, setIncomeOverviewV2Loading] = useState<boolean>(true);
  const [incomeOverviewParams, setIncomeOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });

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

  const fetchMonthlyOverview = async () => {
    try {
      setExpenseOverviewV2Loading(true);
      const [monthlyRes, categoryRes] = await Promise.all([
        api.get(
          `/expenses/monthly?count=${expenseOverviewParams.count}&type=${expenseOverviewParams.type}`,
        ),
        api.get(
          `/expenses/monthly/category?count=${expenseOverviewParams.count}&type=${expenseOverviewParams.type}`,
        ),
      ]);

      if (monthlyRes.status === 200 && categoryRes.status === 200) {
        setExpenseOverviewV2({
          amountByMonthV2: monthlyRes.data,
          monthlyCategoryExpenseV2: categoryRes.data,
        });
      }
    } catch (error) {
      console.error("Error loading monthly expense details", error);
    } finally {
      setExpenseOverviewV2Loading(false);
    }
  };

  const fetchMonthlyIncomeOverview = async () => {
    try {
      setIncomeOverviewV2Loading(true);
      const [monthlyRes, categoryRes] = await Promise.all([
        api.get(
          `/incomes/monthly?count=${incomeOverviewParams.count}&type=${incomeOverviewParams.type}`,
        ),
        api.get(
          `/incomes/monthly/category?count=${incomeOverviewParams.count}&type=${incomeOverviewParams.type}`,
        ),
      ]);

      if (monthlyRes.status === 200 && categoryRes.status === 200) {
        setIncomeOverviewV2({
          amountByMonthV2: monthlyRes.data,
          monthlyCategoryExpenseV2: categoryRes.data,
        });
      }
    } catch (error) {
      console.error("Error loading monthly income details", error);
    } finally {
      setIncomeOverviewV2Loading(false);
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
    fetchMonthlyOverview();
  }, [user.id, expenseOverviewParams]);

  useEffect(() => {
    fetchMonthlyIncomeOverview();
  }, [user.id, incomeOverviewParams]);

  useEffect(() => {
    const handler = () => {
      fetchOverview({ hasConstraint: true, type: "" });
      fetchMonthlyOverview();
    };
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      fetchIncomeOverview({ hasConstraint: true, type: "" });
      fetchMonthlyIncomeOverview();
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
      fetchMonthlyOverview(),
      fetchMonthlyIncomeOverview(),
    ]);
  };

  const handleFirstExpenseCreated = async () => {
    setNewUser(false);
    await refreshDashboardData();
  };

  const handleBudgetCreated = async () => {
    await Promise.all([
      fetchOverview({ hasConstraint: true, type: "" }),
      fetchMonthlyOverview(),
    ]);
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

  // --- LAYOUT ENGINE CONFIGURATION ---
  interface LayoutItem {
    id: string;
    w: number; // width span: 1, 2, or 3 columns
    visible: boolean;
  }

  const widgetMeta: Record<string, { title: string; icon: React.ReactNode }> = {
    stats: {
      title: "Hero Stats Summary",
      icon: <Banknote className="h-4 w-4 text-emerald-500" />,
    },
    chart: {
      title: "Income & Expense Chart",
      icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
    },
    reminders: {
      title: "Reminders Overview",
      icon: <CalendarClock className="h-4 w-4 text-rose-500" />,
    },
    budgets: {
      title: "Active Budgets Tracker",
      icon: <PiggyBank className="h-4 w-4 text-amber-500" />,
    },
    recurring: {
      title: "Upcoming Recurring Bills",
      icon: <Wallet className="h-4 w-4 text-indigo-500" />,
    },
    expense_trend: {
      title: "Expense Trend Chart",
      icon: <TrendingUp className="h-4 w-4 text-rose-500" />,
    },
    income_trend: {
      title: "Income Trend Chart",
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    },
    expense_pie: {
      title: "Expense Category Pie Chart",
      icon: <PieChartIcon className="h-4 w-4 text-amber-500" />,
    },
    income_pie: {
      title: "Income Category Pie Chart",
      icon: <PieChartIcon className="h-4 w-4 text-teal-500" />,
    },
    expense_over_days: {
      title: "Expense Over Days Line Chart",
      icon: <Activity className="h-4 w-4 text-orange-500" />,
    },
    income_over_days: {
      title: "Income Over Days Line Chart",
      icon: <Activity className="h-4 w-4 text-lime-500" />,
    },
  };

  const defaultLayout: LayoutItem[] = [
    { id: "stats", w: 3, visible: true },
    { id: "chart", w: 2, visible: true },
    { id: "reminders", w: 1, visible: true },
    { id: "budgets", w: 2, visible: true },
    { id: "recurring", w: 1, visible: true },
    { id: "expense_trend", w: 3, visible: false },
    { id: "income_trend", w: 3, visible: false },
    { id: "expense_pie", w: 2, visible: false },
    { id: "income_pie", w: 2, visible: false },
    { id: "expense_over_days", w: 2, visible: false },
    { id: "income_over_days", w: 2, visible: false },
  ];

  const colSpanClasses: Record<number, string> = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
  };

  const getSavedLayout = (userId: string): LayoutItem[] => {
    if (typeof window === "undefined") return defaultLayout;
    if (!userId) return defaultLayout;
    const saved = localStorage.getItem(`expensely_dashboard_layout_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LayoutItem[];
        const parsedMerged = parsed
          .filter((p) => defaultLayout.some((d) => d.id === p.id))
          .map((p) => {
            const defItem = defaultLayout.find((d) => d.id === p.id)!;
            return { ...defItem, ...p };
          });
        const missingItems = defaultLayout.filter(
          (d) => !parsed.some((p) => p.id === d.id)
        );
        return [...parsedMerged, ...missingItems];
      } catch {
        return defaultLayout;
      }
    }
    return defaultLayout;
  };

  const [isMounted, setIsMounted] = useState(() => hasHydrated);
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    if (hasHydrated && typeof window !== "undefined") {
      return getSavedLayout(user.id);
    }
    return [];
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [layoutBackup, setLayoutBackup] = useState<LayoutItem[] | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setLayout(getSavedLayout(user.id));
    setIsMounted(true);
    hasHydrated = true;
  }, [user.id]);

  const handleStartEditing = () => {
    setLayoutBackup(layout.map(item => ({ ...item })));
    setIsEditing(true);
    setIsDockMinimized(isMobile);
  };

  const handleCancelEditing = () => {
    if (layoutBackup) {
      setLayout(layoutBackup);
    }
    setIsEditing(false);
  };

  const handleSaveEditing = () => {
    localStorage.setItem(
      `expensely_dashboard_layout_${user.id}`,
      JSON.stringify(layout)
    );
    setIsEditing(false);
  };

  const handleResetLayout = () => {
    setLayout(defaultLayout.map(item => ({ ...item })));
  };

  const handleToggleVisibility = (id: string) => {
    setLayout(prev =>
      prev.map(item => (item.id === id ? { ...item, visible: !item.visible } : item))
    );
  };

  const handleResize = (id: string, delta: number) => {
    setLayout(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newW = Math.max(1, Math.min(3, item.w + delta));
          return { ...item, w: newW };
        }
        return item;
      })
    );
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = layout.findIndex(item => item.id === draggedId);
    const targetIndex = layout.findIndex(item => item.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const updated = [...layout];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      setLayout(updated);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // --- WIDGET RENDERERS ---
  const renderStatsWidget = (w: number) => {
    let gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    let incomeBorder = "border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-6 md:pl-8";
    let expenseBorder = "border-t lg:border-t-0 lg:border-l border-border/40 pt-6 lg:pt-0 lg:pl-6 md:pl-8";
    let topCategoryBorder = "border-t lg:border-t-0 lg:border-l border-border/40 pt-6 lg:pt-0 lg:pl-6 md:pl-8";

    if (w === 2) {
      gridCols = "grid-cols-1 sm:grid-cols-2";
      incomeBorder = "border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-6 md:pl-8";
      expenseBorder = "border-t border-border/40 pt-6";
      topCategoryBorder = "border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-6 md:pl-8";
    } else if (w === 1) {
      gridCols = "grid-cols-1";
      incomeBorder = "border-t border-border/40 pt-6";
      expenseBorder = "border-t border-border/40 pt-6";
      topCategoryBorder = "border-t border-border/40 pt-6";
    }

    return (
      <div className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md p-6 md:p-8">
        <div className={`grid gap-6 md:gap-8 ${gridCols}`}>
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

          <div className={`group flex flex-col justify-between space-y-3 ${incomeBorder}`}>
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

          <div className={`group flex flex-col justify-between space-y-3 ${expenseBorder}`}>
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

          <div className={`flex flex-col justify-between space-y-3 ${topCategoryBorder}`}>
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
      </div>
    );
  };

  const renderChartWidget = () => (
    <IncomeExpenseComparisonChart
      expenseByMonth={expenseMonthlyCompare}
      incomeByMonth={incomeMonthlyCompare}
      darkMode={user.theme === "dark"}
      currency={user.currency}
      loading={compareLoading}
      setOverviewParams={setCompareOverviewParams}
    />
  );

  const renderRemindersWidget = () => (
    <RemindersDashboardWidget />
  );

  const renderBudgetsWidget = () => (
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
  );

  const renderRecurringWidget = () => (
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
  );

  const renderExpenseTrendWidget = () => (
    <YearlyExpenseLineChartV2
      amountByMonth={expenseOverviewV2?.amountByMonthV2}
      amountByMonthV2={expenseOverviewV2?.monthlyCategoryExpenseV2}
      darkMode={user.theme === "dark"}
      title="Expense Trends"
      currency={user.currency}
      setOverviewParams={setExpenseOverviewParams}
      overviewParams={expenseOverviewParams}
      categoryMetaByName={categoryMetaByName}
      loading={expenseOverviewV2Loading || expenseOverviewV2 === null}
    />
  );

  const renderIncomeTrendWidget = () => (
    <YearlyExpenseLineChartV2
      amountByMonth={incomeOverviewV2?.amountByMonthV2}
      amountByMonthV2={incomeOverviewV2?.monthlyCategoryExpenseV2}
      darkMode={user.theme === "dark"}
      title="Income Trends"
      currency={user.currency}
      setOverviewParams={setIncomeOverviewParams}
      overviewParams={incomeOverviewParams}
      categoryMetaByName={categoryMetaByName}
      loading={incomeOverviewV2Loading || incomeOverviewV2 === null}
    />
  );

  const renderExpensePieWidget = (w: number) => {
    const minYear = overview?.earliestStartYear || new Date().getFullYear();
    return (
      <PieChartComp
        amountByCategory={overview?.amountByCategory}
        currency={user.currency}
        title="Spending by Category"
        setCurrentYearForYearly={setCurrentYearForYearly}
        currentYearForYearly={currentYearForYearly}
        min_year={minYear}
        categoryMetaByName={categoryMetaByName}
        loading={loadingYear || overview === null}
        layoutWidth={w}
      />
    );
  };

  const renderIncomePieWidget = (w: number) => {
    const minIncomeYear = incomeOverview?.earliestStartYear || new Date().getFullYear();
    return (
      <PieChartComp
        amountByCategory={incomeOverview?.amountByCategory}
        currency={user.currency}
        title="Income by Category"
        setCurrentYearForYearly={setIncomeCurrentYearForYearly}
        currentYearForYearly={incomeCurrentYearForYearly}
        min_year={minIncomeYear}
        categoryMetaByName={categoryMetaByName}
        loading={loadingIncomeYear || incomeOverview === null}
        layoutWidth={w}
      />
    );
  };

  const renderExpenseOverDaysWidget = () => {
    const minYear = overview?.earliestStartYear || new Date().getFullYear();
    const minMonth = overview?.earliestStartMonth || new Date().getMonth() + 1;
    return (
      <ExpensesOverDays
        overTheDaysThisMonth={overview?.overTheDaysThisMonth}
        darkMode={user.theme === "dark"}
        currency={user.currency}
        title="Spending Over Days"
        setCurrentMonth={setCurrentMonth}
        setCurrentMonthYear={setCurrentMonthYear}
        currentMonth={currentMonth}
        currentMonthYear={currentMonthYear}
        min_year={minYear}
        min_month={minMonth}
        loading={loadingMonth || overview === null}
      />
    );
  };

  const renderIncomeOverDaysWidget = () => {
    const minIncomeYear = incomeOverview?.earliestStartYear || new Date().getFullYear();
    const minIncomeMonth = incomeOverview?.earliestStartMonth || new Date().getMonth() + 1;
    return (
      <ExpensesOverDays
        overTheDaysThisMonth={incomeOverview?.overTheDaysThisMonth}
        darkMode={user.theme === "dark"}
        currency={user.currency}
        title="Income Over Days"
        setCurrentMonth={setIncomeCurrentMonth}
        setCurrentMonthYear={setIncomeCurrentMonthYear}
        currentMonth={incomeCurrentMonth}
        currentMonthYear={incomeCurrentMonthYear}
        min_year={minIncomeYear}
        min_month={minIncomeMonth}
        loading={loadingIncomeMonth || incomeOverview === null}
      />
    );
  };

  const renderWidget = (id: string, w: number) => {
    switch (id) {
      case "stats":
        return renderStatsWidget(w);
      case "chart":
        return renderChartWidget();
      case "reminders":
        return renderRemindersWidget();
      case "budgets":
        return renderBudgetsWidget();
      case "recurring":
        return renderRecurringWidget();
      case "expense_trend":
        return renderExpenseTrendWidget();
      case "income_trend":
        return renderIncomeTrendWidget();
      case "expense_pie":
        return renderExpensePieWidget(w);
      case "income_pie":
        return renderIncomePieWidget(w);
      case "expense_over_days":
        return renderExpenseOverDaysWidget();
      case "income_over_days":
        return renderIncomeOverDaysWidget();
      default:
        return null;
    }
  };

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

        <div className="flex items-center gap-3">
          {isMounted && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEditing}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-border/70 hover:border-border bg-background/60 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground shadow-xs transition-all cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              Customize Layout
            </Button>
          )}
          {/* <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live insights
          </div> */}
        </div>
      </div>

      {/* ── Edit Mode Toolbar ── */}
      {isMounted && isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] backdrop-blur-md shadow-xs"
        >
          <div className="flex items-center gap-3">
            
            <div>
              <p className="text-sm font-medium text-foreground">
                Customize Dashboard Layout
              </p>
              <p className="text-xs text-muted-foreground">
                Drag cards by their handles to reorder. Adjust widths using size controls.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLayout}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/80 bg-background/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEditing}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/80 bg-background/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEditing}
              className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer border-0"
            >
              <Check className="h-3.5 w-3.5" />
              Save Layout
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Widgets Grid ── */}
      {!isMounted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {defaultLayout.filter((item) => item.visible).map((item) => {
            const colSpanClass = colSpanClasses[item.w] || "lg:col-span-1";
            return (
              <div key={item.id} className={`${colSpanClass} h-[200px] bg-muted/20 animate-pulse rounded-2xl`} />
            );
          })}
        </div>
      ) : (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-max items-start ${isEditing ? "pb-36" : ""}`}>
          {layout
            .filter((item) => item.visible)
            .map((item, index) => {
              const colSpanClass = colSpanClasses[item.w] || "lg:col-span-1";

              return (
                <motion.div
                  key={item.id}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index * 0.1}
                  className={`
                    relative transition-all duration-200 rounded-2xl flex flex-col h-full
                    ${colSpanClass}
                    ${isEditing ? "border border-dashed border-emerald-500/40 p-1.5 bg-emerald-500/[0.01] shadow-xs select-none" : ""}
                    ${isEditing && draggedId === item.id ? "opacity-30 border-solid border-emerald-500 scale-[0.98]" : ""}
                  `}
                >
                  <div
                    draggable={isEditing}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className="flex flex-col h-full w-full"
                  >
                    {isEditing && (
                      <div className="flex items-center justify-between bg-card/90 backdrop-blur-xs border border-border/80 rounded-xl px-3 py-1.5 mb-2 text-xs shadow-xs z-10 select-none">
                        <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground font-medium py-1 pr-3">
                          <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                          <span className="font-semibold tracking-wide capitalize text-[11px] uppercase">
                            {item.id === "stats"
                              ? "Stats"
                              : item.id === "recurring"
                                ? "Recurring"
                                : item.id === "chart"
                                  ? "Comparison Chart"
                                  : item.id === "expense_trend"
                                    ? "Expense Trend"
                                    : item.id === "income_trend"
                                      ? "Income Trend"
                                      : item.id === "expense_pie"
                                        ? "Expense Categories"
                                        : item.id === "income_pie"
                                          ? "Income Categories"
                                          : item.id === "expense_over_days"
                                            ? "Expense over Days"
                                            : item.id === "income_over_days"
                                              ? "Income over Days"
                                              : item.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isMobile || item.w <= 1}
                            onClick={() => handleResize(item.id, -1)}
                            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Shrink Width"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                            {item.w}/3
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isMobile || item.w >= 3}
                            onClick={() => handleResize(item.id, 1)}
                            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Expand Width"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>

                          <div className="w-[1px] h-3.5 bg-border/80 mx-1" />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVisibility(item.id)}
                            className="h-7 w-7 p-0 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                            title="Hide Widget"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 w-full h-full relative">
                      {renderWidget(item.id, item.w)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* ── Inactive Widgets Dock (Fixed Overlay centered in content area) ── */}
      {isMounted && isEditing && (
        <div className={`fixed bottom-6 left-0 ${isMobile ? "lg:left-0" : sidebarOpen ? "lg:left-[16rem]" : "lg:left-[3rem]"} right-0 z-50 flex justify-center pointer-events-none transition-all duration-300`}>
          <div className="w-full max-w-6xl px-4 md:px-0 flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="flex flex-col items-center justify-center gap-2 max-w-[90%] md:max-w-xl pointer-events-auto"
            >
              {layout.filter((item) => !item.visible).length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDockMinimized(!isDockMinimized)}
                  className="w-8 h-8 rounded-full border border-border bg-card/95 hover:bg-muted text-muted-foreground hover:text-foreground shadow-md transition-all hover:scale-105 active:scale-95 z-50 cursor-pointer"
                  title={isDockMinimized ? "Expand Dock" : "Minimize Dock"}
                >
                  <motion.div
                    animate={{ rotate: isDockMinimized ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              )}
              <motion.div
                layout
                className={`flex items-center bg-card/75 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl max-w-full transition-all duration-300 ${
                  isDockMinimized
                    ? "flex-row overflow-x-auto w-full p-2.5 gap-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    : "flex-wrap justify-center gap-3 p-3"
                }`}
              >
                {layout.filter((item) => !item.visible).length === 0 ? (
                  <p className="text-xs text-muted-foreground px-4 py-2 italic font-sans">
                    Dock is empty. All widgets are active on your dashboard.
                  </p>
                ) : (
                  layout
                    .filter((item) => !item.visible)
                    .map((item) => {
                      const meta = widgetMeta[item.id] || { title: item.id, icon: null };
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleVisibility(item.id)}
                          className="flex items-center gap-2.5 px-3 py-2 bg-background/80 hover:bg-emerald-500/10 border border-border/70 hover:border-emerald-500/30 rounded-xl text-xs font-medium text-foreground hover:text-emerald-500 cursor-pointer shadow-xs transition-all select-none group whitespace-nowrap shrink-0"
                        >
                          {meta.icon}
                          <span className="font-medium">{meta.title}</span>
                          <Plus className="h-4 w-4 ml-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-0.5 rounded-full transition-all group-hover:scale-110" />
                        </motion.div>
                      );
                    })
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
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
