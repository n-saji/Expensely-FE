/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { columns, TransactionRow } from "./columns";
import { DataTable } from "./data-table";
import { RootState } from "@/redux/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import {
  Category,
  ExpenseOverview,
  ExpenseOverviewV2,
  IncomeOverview,
  OverviewEnum,
} from "@/global/dto";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Edit,
  FilterX,
  MoreHorizontal,
  Search,
  Trash,
  X,
  Download,
  SlidersHorizontal,
  RotateCcw,
  Check,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Banknote,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import CategoryBadge from "@/components/category-badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  OnChangeFn,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";

import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import DropDown from "@/components/drop-down";
import { Label } from "@/components/ui/label";
import useMediaQuery from "@/utils/useMediaQuery";
import CurrencyDrawer from "@/components/currency-drawer";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import { currencyMapper } from "@/utils/currencyMapper";
import PieChartComp, {
  ExpensesOverDays,
  YearlyExpenseLineChartV2,
} from "@/components/ExpenseChartCard";

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const parseDateParam = (value: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDateParam = (date?: Date) => {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
};

const editTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  description: z.string().trim().min(1, "Please enter a description"),
  transactionDate: z.string().min(1, "Please select a date"),
  amount: z.coerce.number().positive({ message: "Please enter a valid amount" }),
  currency: z.string().min(1, "Please select a currency"),
  category: z.object({
    id: z.string().min(1, "Please select a category"),
    name: z.string(),
  }),
  type: z.enum(["EXPENSE", "INCOME"]),
  file: z.instanceof(File).optional(),
});

interface CategorySelectorWithTabsProps {
  value: string | null;
  onValueChange: (val: string | null) => void;
  categories: Category[];
  placeholder?: string;
  className?: string;
}

const CategorySelectorWithTabs = ({
  value,
  onValueChange,
  categories,
  placeholder = "All Categories",
  className = "",
}: CategorySelectorWithTabsProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  const selectedCategory = categories.find((c) => c.id === value);

  // Sync tab with selected category
  useEffect(() => {
    if (selectedCategory) {
      const type = selectedCategory.type?.toLowerCase();
      if (type === "expense") {
        setActiveTab("expense");
      } else if (type === "income" || type === "investment") {
        setActiveTab("income");
      }
    }
  }, [value, selectedCategory]);

  const filteredCategories = categories.filter((c) => {
    const type = c.type?.toLowerCase();
    if (activeTab === "expense") {
      return type === "expense";
    } else {
      return type === "income" || type === "investment";
    }
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 font-normal rounded-full border border-border/70 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${className}`}
        >
          {selectedCategory ? (
            <CategoryBadge
              name={selectedCategory.name}
              icon={selectedCategory.icon}
              color={selectedCategory.color}
            />
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2 bg-card/95 backdrop-blur-md border border-border/60 rounded-xl shadow-md space-y-2" align="start">
        {/* All Categories Option (Supersedes everything) */}
        <button
          type="button"
          onClick={() => {
            onValueChange(null);
            setOpen(false);
          }}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all hover:bg-muted/80 text-left font-medium ${
            !value || value === "all-categories"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center justify-center rounded-full h-5 w-5 bg-muted-foreground/10 text-muted-foreground text-[10px] font-bold">
            ALL
          </span>
          All Categories
        </button>

        <div className="border-t border-border/30 my-1" />

        {/* Expense/Income Tabs */}
        <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/10">
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "expense"
                ? "bg-background text-foreground shadow-xs border border-border/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "income"
                ? "bg-background text-foreground shadow-xs border border-border/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Income
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="max-h-[200px] overflow-y-auto space-y-0.5 pr-1">
          {filteredCategories.length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center">
              No categories found
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isSelected = value === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onValueChange(cat.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all hover:bg-muted/80 text-left ${
                    isSelected
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function TransactionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [transactionsList, setTransactionsList] = useState<any>({
    transactions: [],
    totalPages: 0,
    totalElements: 0,
    pageNumber: 1,
  });
  const [datas, setDatas] = useState<TransactionRow[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionRow[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filters from Query Params
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);

  const categoryFilter = searchParams.get("category_id") || "";
  const pageNumber = parsePositiveInt(searchParams.get("page"), 1);
  const pageSize = parsePositiveInt(searchParams.get("limit"), 10);

  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateParam(searchParams.get("start_date"));
    const to = parseDateParam(searchParams.get("end_date"));
    if (!from && !to) return undefined;
    return { from, to };
  }, [searchParams]);

  // Overview stats states (Expense)
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [overviewV2, setOverviewV2] = useState<ExpenseOverviewV2 | null>(null);
  const [overviewV2Loading, setOverviewV2Loading] = useState<boolean>(true);
  const [minYear, setMinYear] = useState<number>(new Date().getFullYear());
  const [minMonth, setMinMonth] = useState<number>(new Date().getMonth() + 1);
  const [loadingYear, setLoadingYear] = useState<boolean>(false);
  const [loadingMonth, setLoadingMonth] = useState<boolean>(false);
  const [currentYearForYearly, setCurrentYearForYearly] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentMonthYear, setCurrentMonthYear] = useState<number>(new Date().getFullYear());
  const [overviewParams, setOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 5,
    type: OverviewEnum.MONTH,
  });

  // Overview stats states (Income)
  const [incomeOverview, setIncomeOverview] = useState<IncomeOverview | null>(null);
  const [incomeOverviewV2, setIncomeOverviewV2] = useState<ExpenseOverviewV2 | null>(null);
  const [incomeOverviewV2Loading, setIncomeOverviewV2Loading] = useState<boolean>(true);
  const [incomeMinYear, setIncomeMinYear] = useState<number>(new Date().getFullYear());
  const [incomeMinMonth, setIncomeMinMonth] = useState<number>(new Date().getMonth() + 1);
  const [incomeLoadingYear, setIncomeLoadingYear] = useState<boolean>(false);
  const [incomeLoadingMonth, setIncomeLoadingMonth] = useState<boolean>(false);
  const [incomeCurrentYearForYearly, setIncomeCurrentYearForYearly] = useState<number>(new Date().getFullYear());
  const [incomeCurrentMonth, setIncomeCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [incomeCurrentMonthYear, setIncomeCurrentMonthYear] = useState<number>(new Date().getFullYear());
  const [incomeOverviewParams, setIncomeOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 5,
    type: OverviewEnum.MONTH,
  });

  // Modals state
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionRow | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionRow | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [calenderOpen, setCalenderOpen] = useState(false);

  // CSV Export Dialog states
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportCategory, setExportCategory] = useState("all-categories");
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>(undefined);
  const [exportSearch, setExportSearch] = useState("");

  // Attachment editing states
  const [attachmentEditMode, setAttachmentEditMode] = useState(false);
  const [attachmentActionLoading, setAttachmentActionLoading] = useState(false);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const skipInitialDebouncedFetchRef = useRef(true);

  // --- LAYOUT ENGINE CONFIGURATION ---
  interface LayoutItem {
    id: string;
    w: number; // width span: 1, 2, or 3 columns
    visible: boolean;
  }

  const widgetMeta: Record<string, { title: string; icon: React.ReactNode }> = {
    stats_bar: {
      title: "Hero Stats Summary",
      icon: <Banknote className="h-4 w-4 text-emerald-500" />,
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
      title: "Spending by Category",
      icon: <PieChartIcon className="h-4 w-4 text-amber-500" />,
    },
    income_pie: {
      title: "Income by Category",
      icon: <PieChartIcon className="h-4 w-4 text-teal-500" />,
    },
    expense_over_days: {
      title: "Spending Over Days",
      icon: <Activity className="h-4 w-4 text-orange-500" />,
    },
    income_over_days: {
      title: "Income Over Days",
      icon: <Activity className="h-4 w-4 text-lime-500" />,
    },
  };

  const defaultLayout: LayoutItem[] = [
    { id: "stats_bar", w: 3, visible: true },
    { id: "expense_trend", w: 3, visible: true },
    { id: "income_trend", w: 3, visible: true },
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
    const saved = localStorage.getItem(`expensely_transaction_layout_${userId}`);
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

  const defaultSelectedStats = [
    "this_month_expense",
    "this_year_expense",
    "this_month_income",
    "net_savings",
  ];

  const { open: sidebarOpen, isMobile } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [selectedStats, setSelectedStats] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [layoutBackup, setLayoutBackup] = useState<LayoutItem[] | null>(null);
  const [selectedStatsBackup, setSelectedStatsBackup] = useState<string[] | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (user.id) {
      setLayout(getSavedLayout(user.id));
      const savedStats = localStorage.getItem(`expensely_transaction_selected_stats_${user.id}`);
      if (savedStats) {
        try {
          setSelectedStats(JSON.parse(savedStats));
        } catch {
          setSelectedStats(defaultSelectedStats);
        }
      } else {
        setSelectedStats(defaultSelectedStats);
      }
      setIsMounted(true);
    }
  }, [user.id]);

  const handleStartEditing = () => {
    setLayoutBackup(layout.map(item => ({ ...item })));
    setSelectedStatsBackup([...selectedStats]);
    setIsEditing(true);
    setIsDockMinimized(isMobile);
  };

  const handleCancelEditing = () => {
    if (layoutBackup) {
      setLayout(layoutBackup);
    }
    if (selectedStatsBackup) {
      setSelectedStats(selectedStatsBackup);
    }
    setIsEditing(false);
  };

  const handleSaveEditing = () => {
    localStorage.setItem(
      `expensely_transaction_layout_${user.id}`,
      JSON.stringify(layout)
    );
    localStorage.setItem(
      `expensely_transaction_selected_stats_${user.id}`,
      JSON.stringify(selectedStats)
    );
    setIsEditing(false);
  };

  const handleResetLayout = () => {
    setLayout(defaultLayout.map(item => ({ ...item })));
    setSelectedStats(defaultSelectedStats);
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

  const cardVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.4, ease: "easeOut" },
    }),
  };

  const availableStatsList = [
    { id: "this_month_expense", label: "This Month Expense" },
    { id: "this_year_expense", label: "This Year Expense" },
    { id: "top_spend_month", label: "Top Spend Month" },
    { id: "this_month_income", label: "This Month Income" },
    { id: "this_year_income", label: "This Year Income" },
    { id: "top_income_month", label: "Top Income Month" },
    { id: "net_savings", label: "Net Savings (Month)" },
    { id: "net_balance", label: "Net Balance" },
  ];

  const renderStatCell = (id: string) => {
    const fmt = (n: number) =>
      n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const currency = currencyMapper(user.currency || "USD");

    switch (id) {
      case "this_month_expense": {
        const monthChange =
          overview && overview.lastMonthTotalExpense !== 0
            ? (
                ((overview.thisMonthTotalExpense - overview.lastMonthTotalExpense) /
                  overview.lastMonthTotalExpense) *
                100
              ).toFixed(1)
            : overview && overview.thisMonthTotalExpense === 0
              ? "0"
              : "100";
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              This Month's Expense
            </span>
            <div>
              {overview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground font-mono tracking-tight">
                  {currency}{fmt(overview.thisMonthTotalExpense)}
                </div>
              )}
              {overview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <span className={Number(monthChange) >= 0 ? "text-rose-500" : "text-emerald-500"}>
                    {Number(monthChange) >= 0 ? "▲" : "▼"} {Math.abs(Number(monthChange))}%
                  </span>
                  <span className="truncate">vs last month</span>
                </p>
              )}
            </div>
          </div>
        );
      }
      case "this_year_expense": {
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              This Year's Expense
            </span>
            <div>
              {overview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground font-mono tracking-tight">
                  {currency}{fmt(overview.totalAmount)}
                </div>
              )}
              {overview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  Avg. {currency}{fmt(overview.averageMonthlyExpense ?? 0)} / month
                </p>
              )}
            </div>
          </div>
        );
      }
      case "top_spend_month": {
        const topExpenseItem = (() => {
          if (!overview || !overview.topFiveMostExpensiveItemThisMonth) return null;
          const entries = Object.entries(overview.topFiveMostExpensiveItemThisMonth);
          if (entries.length === 0) return null;
          const sorted = entries.sort(([, a], [, b]) => b - a);
          return { name: sorted[0][0], value: sorted[0][1] };
        })();
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Top Spend This Month
            </span>
            <div>
              {overview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground truncate max-w-[200px]" title={topExpenseItem ? topExpenseItem.name : "N/A"}>
                  {topExpenseItem ? topExpenseItem.name : "N/A"}
                </div>
              )}
              {overview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  {topExpenseItem
                    ? `${currency}${fmt(topExpenseItem.value)} spent`
                    : "No expenses recorded."}
                </p>
              )}
            </div>
          </div>
        );
      }
      case "this_month_income": {
        const incomeMonthChange =
          incomeOverview && incomeOverview.lastMonthTotalIncome !== 0
            ? (
                ((incomeOverview.thisMonthTotalIncome - incomeOverview.lastMonthTotalIncome) /
                  incomeOverview.lastMonthTotalIncome) *
                100
              ).toFixed(1)
            : incomeOverview && incomeOverview.thisMonthTotalIncome === 0
              ? "0"
              : "100";
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              This Month's Income
            </span>
            <div>
              {incomeOverview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground font-mono tracking-tight">
                  {currency}{fmt(incomeOverview.thisMonthTotalIncome)}
                </div>
              )}
              {incomeOverview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <span className={Number(incomeMonthChange) >= 0 ? "text-emerald-500" : "text-rose-500"}>
                    {Number(incomeMonthChange) >= 0 ? "▲" : "▼"} {Math.abs(Number(incomeMonthChange))}%
                  </span>
                  <span className="truncate">vs last month</span>
                </p>
              )}
            </div>
          </div>
        );
      }
      case "this_year_income": {
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              This Year's Income
            </span>
            <div>
              {incomeOverview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground font-mono tracking-tight">
                  {currency}{fmt(incomeOverview.totalAmount)}
                </div>
              )}
              {incomeOverview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  Avg. {currency}{fmt(incomeOverview.averageMonthlyIncome ?? 0)} / month
                </p>
              )}
            </div>
          </div>
        );
      }
      case "top_income_month": {
        const topIncomeItem = (() => {
          if (!incomeOverview || !incomeOverview.topFiveMostIncomeItemThisMonth) return null;
          const entries = Object.entries(incomeOverview.topFiveMostIncomeItemThisMonth);
          if (entries.length === 0) return null;
          const sorted = entries.sort(([, a], [, b]) => b - a);
          return { name: sorted[0][0], value: sorted[0][1] };
        })();
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Top Income This Month
            </span>
            <div>
              {incomeOverview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl md:text-3xl font-light text-foreground truncate max-w-[200px]" title={topIncomeItem ? topIncomeItem.name : "N/A"}>
                  {topIncomeItem ? topIncomeItem.name : "N/A"}
                </div>
              )}
              {incomeOverview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  {topIncomeItem
                    ? `${currency}${fmt(topIncomeItem.value)} earned`
                    : "No income recorded."}
                </p>
              )}
            </div>
          </div>
        );
      }
      case "net_savings": {
        const expense = overview?.thisMonthTotalExpense ?? 0;
        const income = incomeOverview?.thisMonthTotalIncome ?? 0;
        const savings = income - expense;
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Net Savings (Month)
            </span>
            <div>
              {overview === null || incomeOverview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className={`text-2xl md:text-3xl font-light font-mono tracking-tight ${savings >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {savings < 0 ? "-" : ""}{currency}{fmt(Math.abs(savings))}
                </div>
              )}
              {overview !== null && incomeOverview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  {savings >= 0 ? "Positive cash savings" : "Net deficit this month"}
                </p>
              )}
            </div>
          </div>
        );
      }
      case "net_balance": {
        const balance = incomeOverview?.total_balance ?? 0;
        return (
          <div className="flex flex-col justify-between space-y-3 h-full">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              Net Balance
            </span>
            <div>
              {incomeOverview === null ? (
                <div className="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
              ) : (
                <div className={`text-2xl md:text-3xl font-light font-mono tracking-tight ${balance >= 0 ? "text-foreground" : "text-rose-500"}`}>
                  {balance < 0 ? "-" : ""}{currency}{fmt(Math.abs(balance))}
                </div>
              )}
              {incomeOverview !== null && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">
                  Total available assets
                </p>
              )}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderStatsBarWidget = (w: number) => {
    const cols = selectedStats.length;
    let gridCols = "grid-cols-1";
    if (cols === 4) gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    else if (cols === 3) gridCols = "grid-cols-1 sm:grid-cols-3";
    else if (cols === 2) gridCols = "grid-cols-1 sm:grid-cols-2";

    return (
      <div className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md p-6 md:p-8 w-full">
        {isEditing && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Stats to Display (Max 4, Active: {selectedStats.length}/4)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableStatsList.map((st) => {
                const active = selectedStats.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (active) {
                        setSelectedStats(selectedStats.filter(id => id !== st.id));
                      } else {
                        if (selectedStats.length >= 4) {
                          toast.error("You can select up to 4 stats only");
                        } else {
                          setSelectedStats([...selectedStats, st.id]);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      active
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                        : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {cols === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No stats selected. Enter customize mode to configure.
          </div>
        ) : (
          <div className={`grid gap-6 md:gap-8 ${gridCols}`}>
            {selectedStats.map((statId, idx) => {
              const borderClass = idx === 0
                ? ""
                : `border-t border-border/40 pt-6 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6 md:pl-8 ${
                    cols === 4 ? "lg:pl-8" : ""
                  }`;
              return (
                <div key={statId} className={borderClass}>
                  {renderStatCell(statId)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderWidget = (id: string, w: number) => {
    switch (id) {
      case "stats_bar":
        return renderStatsBarWidget(w);
      case "expense_trend": {
        const categoryMetaByName = Object.fromEntries(
          categories.categories
            .filter((category) => category.name)
            .map((category) => [category.name as string, category]),
        );
        return (
          <YearlyExpenseLineChartV2
            amountByMonth={overviewV2?.amountByMonthV2}
            amountByMonthV2={overviewV2?.monthlyCategoryExpenseV2}
            darkMode={user.theme === "dark"}
            title="Expense Trends"
            currency={user.currency}
            setOverviewParams={setOverviewParams}
            overviewParams={overviewParams}
            categoryMetaByName={categoryMetaByName}
            loading={overviewV2Loading || overviewV2 === null}
          />
        );
      }
      case "income_trend": {
        const categoryMetaByName = Object.fromEntries(
          categories.categories
            .filter((category) => category.name)
            .map((category) => [category.name as string, category]),
        );
        return (
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
      }
      case "expense_pie": {
        const categoryMetaByName = Object.fromEntries(
          categories.categories
            .filter((category) => category.name)
            .map((category) => [category.name as string, category]),
        );
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
      }
      case "income_pie": {
        const categoryMetaByName = Object.fromEntries(
          categories.categories
            .filter((category) => category.name)
            .map((category) => [category.name as string, category]),
        );
        return (
          <PieChartComp
            amountByCategory={incomeOverview?.amountByCategory}
            currency={user.currency}
            title="Income by Category"
            setCurrentYearForYearly={setIncomeCurrentYearForYearly}
            currentYearForYearly={incomeCurrentYearForYearly}
            min_year={incomeMinYear}
            categoryMetaByName={categoryMetaByName}
            loading={incomeLoadingYear || incomeOverview === null}
            layoutWidth={w}
          />
        );
      }
      case "expense_over_days": {
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
      }
      case "income_over_days": {
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
            min_year={incomeMinYear}
            min_month={incomeMinMonth}
            loading={incomeLoadingMonth || incomeOverview === null}
          />
        );
      }
      default:
        return null;
    }
  };

  // Form setup
  const form = useForm<z.infer<typeof editTransactionSchema>>({
    resolver: zodResolver(editTransactionSchema) as any,
    defaultValues: {
      id: "",
      userId: user.id,
      description: "",
      transactionDate: "",
      amount: 0,
      currency: "USD",
      category: {
        id: "",
        name: "",
      },
      type: "EXPENSE",
    },
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Sync selected rows
  useEffect(() => {
    const selected = Object.keys(rowSelection)
      .map((id) => datas.find((item) => item.id === id))
      .filter((item): item is TransactionRow => !!item);
    setSelectedTransactions(selected);
  }, [rowSelection, datas]);

  const updateQueryParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val === null || val === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, val);
        }
      });
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Sync searchInput when URL query changes (e.g. from Clear button or external navigation)
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Debounce search query parameter updates
  useEffect(() => {
    if (searchInput === query) return;
    const delayDebounceFn = setTimeout(() => {
      updateQueryParams({ q: searchInput, page: "1" });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, query, updateQueryParams]);

  const onPageChange = (nextIndex: number) => {
    updateQueryParams({ page: (nextIndex + 1).toString() });
  };

  const setPageSize = (size: number) => {
    updateQueryParams({ limit: size.toString(), page: "1" });
  };

  // Helper map row
  const mapTransactionToRow = (t: any): TransactionRow => ({
    id: t.id,
    amount: t.amount,
    displayAmount: t.displayAmount,
    description: t.description,
    transactionDate: t.transactionDate,
    categoryId: t.categoryId,
    categoryName: t.categoryName,
    currency: t.currency,
    displayCurrency: t.displayCurrency,
    receiptUrl: t.receiptUrl,
    type: t.type,
  });

  // Fetch unified transactions list
  async function fetchTransactions({
    userId,
    fromDate,
    toDate,
    category,
    order = "desc",
    page = 1,
    limit = pageSize,
    q = query,
    sortBy,
    sortOrder,
  }: {
    userId: string;
    fromDate?: string;
    toDate?: string;
    category?: string;
    order?: string;
    page?: number;
    limit?: number;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("start_date", fromDate + " 00:00:00");
    if (toDate) queryParams.append("end_date", toDate + " 23:59:59");
    if (category) queryParams.append("category_id", category);
    if (order) queryParams.append("order", order);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (q) queryParams.append("q", q);
    if (sortBy) {
      queryParams.append("sort_by", sortBy);
      queryParams.append("sort_order", sortOrder || "desc");
    }

    const res = await api.get(
      `/transactions/user/${userId}/fetch-with-conditions?${queryParams.toString()}`,
    );

    if (res.status !== 200) {
      throw new Error(res.data || "Failed to fetch transactions");
    }
    return res.data;
  }

  // Fetch expense stats overview
  const fetchExpenseOverviewData = async () => {
    try {
      const queryParams = new URLSearchParams();
      const res = await api.get(
        `/expenses/user/${user.id}/overview?${queryParams.toString()}`,
      );
      if (res.status === 200) {
        setOverview(res.data);
        setMinYear(res.data.earliestStartYear || new Date().getFullYear());
        setMinMonth(res.data.earliestStartMonth || new Date().getMonth() + 1);
      }
    } catch (e) {
      console.error("Error loading expense overview", e);
    }
  };

  const fetchMonthlyOverview = async () => {
    try {
      setOverviewV2Loading(true);
      const [monthlyRes, categoryRes] = await Promise.all([
        api.get(
          `/expenses/monthly?count=${overviewParams.count}&type=${overviewParams.type}`,
        ),
        api.get(
          `/expenses/monthly/category?count=${overviewParams.count}&type=${overviewParams.type}`,
        ),
      ]);

      if (monthlyRes.status === 200 && categoryRes.status === 200) {
        setOverviewV2({
          amountByMonthV2: monthlyRes.data,
          monthlyCategoryExpenseV2: categoryRes.data,
        });
      }
    } catch (error) {
      console.error("Error loading monthly expense details", error);
    } finally {
      setOverviewV2Loading(false);
    }
  };

  // Fetch income stats overview
  const fetchIncomeOverviewData = async () => {
    try {
      const queryParams = new URLSearchParams();
      const res = await api.get(
        `/incomes/overview?${queryParams.toString()}`,
      );
      if (res.status === 200) {
        setIncomeOverview(res.data);
        setIncomeMinYear(res.data.earliestStartYear || new Date().getFullYear());
        setIncomeMinMonth(res.data.earliestStartMonth || new Date().getMonth() + 1);
      }
    } catch (e) {
      console.error("Error loading income overview", e);
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

  // Trigger loading list
  const loadList = async () => {
    try {
      setTableLoading(true);
      const data = await fetchTransactions({
        userId: user.id,
        fromDate: dateRange?.from
          ? dateRange.from.toISOString().slice(0, 10)
          : "",
        toDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : "",
        category: categoryFilter,
        order: "desc",
        page: pageNumber,
        limit: pageSize,
        q: query,
      });

      setTransactionsList(data);
      setDatas(data.transactions.map(mapTransactionToRow));
    } catch (error) {
      console.error("Error loading transaction list", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      void loadList();
      void fetchExpenseOverviewData();
      void fetchIncomeOverviewData();
    }
  }, [
    user.id,
    dateRange,
    categoryFilter,
    pageNumber,
    pageSize,
    query,
    refreshTrigger,
  ]);

  useEffect(() => {
    if (user.id) {
      void fetchMonthlyOverview();
    }
  }, [user.id, overviewParams]);

  useEffect(() => {
    if (user.id) {
      void fetchMonthlyIncomeOverview();
    }
  }, [user.id, incomeOverviewParams]);

  // Debounced sorting
  useEffect(() => {
    if (skipInitialDebouncedFetchRef.current) {
      skipInitialDebouncedFetchRef.current = false;
      return;
    }
    const sortField = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";
    setTableLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await fetchTransactions({
          userId: user.id,
          fromDate: dateRange?.from
            ? dateRange.from.toISOString().slice(0, 10)
            : "",
          toDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : "",
          category: categoryFilter,
          order: "desc",
          page: pageNumber,
          limit: pageSize,
          q: query,
          ...(sortField ? { sortBy: sortField, sortOrder } : {}),
        });

        setTransactionsList(data);
        setDatas(data.transactions.map(mapTransactionToRow));
      } catch (error) {
        console.error("Error fetching sorted transactions", error);
      } finally {
        setTableLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [sorting]);

  // Handle Event listeners
  useEffect(() => {
    const handleAdd = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("transaction-added", handleAdd);
    return () => {
      window.removeEventListener("transaction-added", handleAdd);
    };
  }, []);

  // Upload/Edit attachments helpers
  async function handleAttachmentUpload(transactionId: string, file?: File) {
    if (!file) return null;

    const presignResponse = await api.get(
      `/transactions/get-presigned-url?fileName=${file.name}&transactionId=${transactionId}&contentType=${file.type}`,
    );

    const uploadResponse = await fetch(presignResponse.data.url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload attachment");
    }

    const key = presignResponse.data.key;
    await api.put(`/transactions/update-transaction-attachment-url/eid/${transactionId}`, {
      url: key,
    });

    return key as string;
  }

  const handleAttachmentDelete = async (
    transactionId: string,
    skipToast?: boolean,
  ) => {
    try {
      setAttachmentActionLoading(true);
      const response = await api.delete(
        `/transactions/delete-attachment/eid/${transactionId}`,
      );

      if (response.status !== 200) {
        throw new Error("Failed to delete attachment");
      }

      setDatas((prev) =>
        prev.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                receiptUrl: null,
              }
            : t,
        ),
      );

      setTransactionToEdit((prev) =>
        prev
          ? {
              ...prev,
              receiptUrl: null,
            }
          : prev,
      );

      setAttachmentEditMode(true);
      setAttachmentInputKey((prev) => prev + 1);
      form.setValue("file", undefined);
      if (!skipToast) {
        toast.success("Attachment deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment");
    } finally {
      setAttachmentActionLoading(false);
    }
  };

  // Submit edit changes
  async function onSubmitUpdate(data: z.infer<typeof editTransactionSchema>) {
    let updatedDate = data.transactionDate;
    try {
      setLoading(true);
      const { file, ...payload } = data;
      const oldT = datas.find((item) => item.id === data.id);

      if (oldT?.transactionDate.slice(0, 10) !== data.transactionDate.slice(0, 10)) {
        const now = new Date();
        updatedDate =
          data.transactionDate +
          "T" +
          now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) +
          ".000Z";
      } else {
        updatedDate =
          data.transactionDate.slice(0, 10) + oldT?.transactionDate.slice(10);
      }

      const response = await api.put(`/transactions/update/${data.id}`, {
        ...payload,
        transactionDate: updatedDate,
      });
      if (response.status !== 200) throw new Error("Failed to update transaction");

      let updatedReceiptUrl: string | null = null;
      if (data.type === "EXPENSE" && file) {
        try {
          updatedReceiptUrl = await handleAttachmentUpload(data.id, file);
        } catch (error) {
          console.error("Error uploading attachment:", error);
          toast.error("Transaction updated but failed to upload attachment");
        }
      }

      setDatas((prev) =>
        prev.map((t) =>
          t.id === data.id
            ? {
                ...t,
                description: data.description,
                amount: data.amount,
                transactionDate: updatedDate,
                categoryId: data.category.id,
                categoryName: data.category.name,
                currency: data.currency,
                receiptUrl: updatedReceiptUrl ?? t.receiptUrl,
              }
            : t,
        ),
      );

      toast.success("Transaction updated successfully");
      setOpenEditDialog(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error("Failed to update transaction", { description: String(err) });
    } finally {
      setOpenEditDialog(false);
      setLoading(false);
    }
  }

  // Delete transaction logic
  const handleDelete = async (t: TransactionRow | null) => {
    if (!t) return;

    try {
      setLoading(true);
      if (t.type === "EXPENSE" && t.receiptUrl) {
        await handleAttachmentDelete(t.id, true);
      }
      const res = await api.delete(`/transactions/${t.id}`);

      if (res.status !== 200) {
        throw new Error(res.data || "Failed to delete transaction");
      }

      setTransactionToDelete(null);
      toast.success(`Deleted ${t.description}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error("Failed to delete transaction", { description: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) {
      toast.error("No transactions selected for delete");
      return;
    }
    try {
      setLoading(true);
      const payload = selectedTransactions.map((item) => ({
        id: item.id,
        type: item.type,
      }));
      const res = await api.post(`/transactions/user/${user.id}/bulk-delete`, payload);
      if (res.status !== 200) throw new Error("Bulk delete failed");
      toast.success("Selected transactions deleted successfully");
      setRowSelection({});
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to bulk delete transactions");
    } finally {
      setLoading(false);
    }
  };

  // CSV download trigger with custom filter options
  const downloadCsvHandler = async (options?: {
    category?: string;
    dateRange?: DateRange;
    search?: string;
  }) => {
    try {
      const targetCategory = options ? options.category : categoryFilter;
      const targetDateRange = options ? options.dateRange : dateRange;
      const targetSearch = options ? options.search : query;

      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";
      const fromDate = targetDateRange?.from
        ? targetDateRange.from.toISOString().slice(0, 10)
        : "";
      const toDate = targetDateRange?.to
        ? targetDateRange.to.toISOString().slice(0, 10)
        : "";

      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append("start_date", fromDate + " 00:00:00");
      if (toDate) queryParams.append("end_date", toDate + " 23:59:59");
      if (targetCategory && targetCategory !== "all-categories") {
        queryParams.append("category_id", targetCategory);
      }
      if (targetSearch) queryParams.append("q", targetSearch);
      if (sortField) {
        queryParams.append("sort_by", sortField);
        queryParams.append("sort_order", sortOrder);
      }

      const response = await api.get(
        `/transactions/user/${user.id}/export?${queryParams.toString()}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  // Fetch receipt PDF helper
  async function openReceiptInNewTab(transactionId: string) {
    try {
      const response = await api.get(
        `/transactions/get-download-url/eid/${transactionId}`,
      );
      if (response.data && response.data.key) {
        window.open(response.data.key, "_blank");
      } else {
        toast.error("Failed to open receipt URL");
      }
    } catch (error) {
      toast.error("Error retrieving download URL");
    }
  }

  // Override columns mapping dynamically to inject row actions
  const columnsWithActions = useMemo(() => {
    return columns(user.currency, categories.categories).map((col) => {
      if (col.id === "actions") {
        return {
          ...col,
          cell: ({ row }: any) => {
            const item = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setTransactionToEdit(item);
                      setAttachmentEditMode(false);
                      setOpenEditDialog(true);
                      form.reset({
                        id: item.id,
                        userId: user.id,
                        description: item.description,
                        transactionDate: item.transactionDate,
                        amount: item.amount,
                        currency: item.currency,
                        category: {
                          id: item.categoryId,
                          name: item.categoryName,
                        },
                        type: item.type,
                        file: undefined,
                      });
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  {item.type === "EXPENSE" && item.receiptUrl && (
                    <DropdownMenuItem
                      onClick={() => {
                        void openReceiptInNewTab(item.id);
                      }}
                    >
                      View Receipt
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setTransactionToDelete(item)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        };
      }
      return col;
    });
  }, [user?.currency, categories.categories]);

  const filteredCategoriesForEdit = categories.categories.filter(
    (cat) => cat.type?.toLowerCase() === transactionToEdit?.type?.toLowerCase(),
  );

  return (
    <div className="space-y-6 w-full h-full">
      {/* Top Banner section */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Ledger
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Review, query, and manage your combined expenses and incomes.
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
          <div>
            <p className="text-sm font-medium text-foreground">
              Customize Transactions Layout
            </p>
            <p className="text-xs text-muted-foreground">
              Drag cards by their handles to reorder. Adjust widths using size controls.
            </p>
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

      {/* Dynamic widgets grid */}
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
                            {widgetMeta[item.id]?.title || item.id}
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
              className="flex flex-col gap-2 p-4 rounded-3xl border border-border/80 bg-background/90 backdrop-blur-xl shadow-xl pointer-events-auto max-w-full"
            >
              <div className="flex items-center justify-between gap-8 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Inactive Widgets
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-muted text-muted-foreground rounded-full">
                    {layout.filter((item) => !item.visible).length}
                  </span>
                </div>
                <button
                  onClick={() => setIsDockMinimized(!isDockMinimized)}
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium cursor-pointer"
                >
                  {isDockMinimized ? "Expand" : "Collapse"}
                </button>
              </div>

              {!isDockMinimized && (
                <div className="flex flex-wrap items-center gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {layout.filter((item) => !item.visible).length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 px-1">
                      All widgets are active.
                    </p>
                  ) : (
                    layout
                      .filter((item) => !item.visible)
                      .map((item) => {
                        const meta = widgetMeta[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleToggleVisibility(item.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-border/70 bg-card hover:bg-muted text-xs text-foreground shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          >
                            {meta?.icon}
                            <span className="font-medium text-[11px] uppercase tracking-wide">
                              {meta?.title || item.id}
                            </span>
                          </button>
                        );
                      })
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Ledger Table controls & filtering */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 text-foreground bg-muted/15 border-border/40 focus-visible:ring-1 focus-visible:ring-emerald-500/20 rounded-full h-9 shadow-xs"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  updateQueryParams({ q: null, page: "1" });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CategorySelectorWithTabs
              value={categoryFilter}
              onValueChange={(val) =>
                updateQueryParams({
                  category_id: val,
                  page: "1",
                })
              }
              categories={categories.categories}
              className="w-[180px]"
            />

            {/* Date boundaries filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 font-normal rounded-full border border-border/70 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground shadow-xs transition-all cursor-pointer">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {formatDateParam(dateRange.from)} - {formatDateParam(dateRange.to)}
                      </>
                    ) : (
                      formatDateParam(dateRange.from)
                    )
                  ) : (
                    <span>Pick dates</span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    updateQueryParams({
                      start_date: range?.from ? range.from.toISOString().slice(0, 10) : null,
                      end_date: range?.to ? range.to.toISOString().slice(0, 10) : null,
                      page: "1",
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Options Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border border-border/70 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground shadow-xs transition-all cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-md border border-border/60 rounded-xl shadow-md p-1">
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-medium uppercase tracking-wider">
                  Options
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setExportCategory(categoryFilter || "all-categories");
                    setExportDateRange(dateRange);
                    setExportSearch(searchInput || "");
                    setOpenExportDialog(true);
                  }}
                  className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-muted/80 cursor-pointer text-foreground hover:text-foreground transition-all"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                  Download CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(query || categoryFilter || dateRange) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  updateQueryParams({
                    q: null,
                    category_id: null,
                    start_date: null,
                    end_date: null,
                    page: "1",
                  });
                }}
                className="h-9 px-3 rounded-full text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}

            {selectedTransactions.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-9 rounded-full">
                <Trash className="mr-2 h-4 w-4" />
                Delete Selected ({selectedTransactions.length})
              </Button>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <DataTable
          columns={columnsWithActions}
          data={datas}
          totalPages={transactionsList.totalPages}
          pageIndex={pageNumber - 1}
          onPageChange={onPageChange}
          loading={tableLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          pageSize={pageSize}
          setPageSize={setPageSize}
          categories={categories.categories}
          userCurrency={user.currency}
        />
      </div>

      {/* Edit Dialog modal */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category.id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const cat = categories.categories.find((c) => c.id === val);
                        if (cat) form.setValue("category.name", cat.name || "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategoriesForEdit.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount & Currency */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <CurrencyDrawer
                          value={field.value}
                          onChange={(curr) => field.onChange(curr)}
                          userCurrency={user.currency}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="Amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date */}
              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover open={calenderOpen} onOpenChange={setCalenderOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between text-muted-foreground">
                            {field.value ? field.value.slice(0, 10) : "Select date"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            defaultMonth={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              setCalenderOpen(false);
                              if (date) field.onChange(date.toISOString().slice(0, 10));
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* S3 Attachment (only if type is EXPENSE) */}
              {transactionToEdit?.type === "EXPENSE" && (
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachment</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl className="flex-1">
                          {transactionToEdit?.receiptUrl && !attachmentEditMode ? (
                            <Input
                              type="text"
                              value={`attachment-${transactionToEdit.id.slice(0, 6)}.pdf`}
                              readOnly
                              disabled
                            />
                          ) : (
                            <Input
                              key={attachmentInputKey}
                              type="file"
                              accept=".jpg, .jpeg, .png, .pdf"
                              onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                          )}
                        </FormControl>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!transactionToEdit?.receiptUrl || attachmentActionLoading}
                          onClick={() => {
                            setAttachmentEditMode(true);
                            setAttachmentInputKey((prev) => prev + 1);
                            field.onChange(undefined);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!transactionToEdit?.receiptUrl || attachmentActionLoading}
                          onClick={() => handleAttachmentDelete(transactionToEdit.id)}
                        >
                          {attachmentActionLoading ? (
                            <Spinner />
                          ) : (
                            <Trash className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="mt-4 max-sm:flex-row w-full justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner /> : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction{" "}
              <strong>{transactionToDelete?.description}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/95"
              onClick={async () => {
                await handleDelete(transactionToDelete);
              }}
              disabled={loading}
            >
              {loading ? <Spinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Export Options Dialog */}
      <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
        <DialogContent className="max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="export-search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Query / Description</Label>
              <Input
                id="export-search"
                placeholder="Search description..."
                value={exportSearch}
                onChange={(e) => setExportSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
              <CategorySelectorWithTabs
                value={exportCategory === "all-categories" ? null : exportCategory}
                onValueChange={(val) => setExportCategory(val || "all-categories")}
                categories={categories.categories}
                className="w-full"
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-9 font-normal border border-border/70 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground shadow-xs transition-all cursor-pointer">
                    {exportDateRange?.from ? (
                      exportDateRange.to ? (
                        <>
                          {formatDateParam(exportDateRange.from)} - {formatDateParam(exportDateRange.to)}
                        </>
                      ) : (
                        formatDateParam(exportDateRange.from)
                      )
                    ) : (
                      <span>Pick dates</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={exportDateRange?.from}
                    selected={exportDateRange}
                    onSelect={(range) => setExportDateRange(range)}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="mt-4 max-sm:flex-row w-full justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await downloadCsvHandler({
                    category: exportCategory,
                    dateRange: exportDateRange,
                    search: exportSearch,
                  });
                  setOpenExportDialog(false);
                } catch (error) {
                  toast.error("Failed to export CSV");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? <Spinner /> : "Export CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
