/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import {
  Category,
  ExpenseOverviewV2,
  IncomeOverview,
  OverviewEnum,
  UpdateIncomeReq,
} from "@/global/dto";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { columns, IncomeRow } from "./columns";
import { DataTable } from "./data-table";
import { DateRange } from "react-day-picker";
import {
  OnChangeFn,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Download,
  FilterX,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";
import DropDown from "@/components/drop-down";
import { Label } from "@/components/ui/label";
import useMediaQuery from "@/utils/useMediaQuery";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IncomeInsightCards,
  IncomeInsightCharts,
} from "../dashboard/_components/income-insights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface IncomeListProps {
  incomes: IncomeRow[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
}

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

function formatDateTimeParam(date: Date, endOfDay = false) {
  const target = new Date(date);
  if (endOfDay) {
    target.setHours(23, 59, 59, 0);
  } else {
    target.setHours(0, 0, 0, 0);
  }

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  const hh = String(target.getHours()).padStart(2, "0");
  const min = String(target.getMinutes()).padStart(2, "0");
  const ss = String(target.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function toDateOnly(dateValue: string) {
  return dateValue.slice(0, 10);
}

function formatDateForApi(date: string) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${date}T${hh}:${mm}:${ss}`;
}

export default function IncomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.user);
  const isMountedRef = useRef(false);
  const skipInitialDebouncedFetchRef = useRef(true);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addIncomeSaving, setAddIncomeSaving] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [editDatePickerOpen, setEditDatePickerOpen] = useState(false);
  const [addDatePickerOpen, setAddDatePickerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [addIncomeSheetOpen, setAddIncomeSheetOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [datas, setDatas] = useState<IncomeRow[]>([]);
  const [incomesList, setIncomesList] = useState<IncomeListProps>({
    incomes: [],
    totalPages: 0,
    totalElements: 0,
    pageNumber: 1,
  });
  const [incomeOverview, setIncomeOverview] = useState<IncomeOverview | null>(
    null,
  );
  const [incomeOverviewV2, setIncomeOverviewV2] =
    useState<ExpenseOverviewV2 | null>(null);
  const [incomeOverviewV2Loading, setIncomeOverviewV2Loading] =
    useState<boolean>(true);
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
  const [incomeOverviewParams, setIncomeOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });

  const [selectedDelete, setSelectedDelete] = useState<IncomeRow | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<IncomeRow | null>(null);
  const [selectedIncomes, setSelectedIncomes] = useState<IncomeRow[]>([]);
  const [editForm, setEditForm] = useState({
    amount: "",
    description: "",
    incomeDate: new Date().toISOString().slice(0, 10),
    categoryId: "",
  });
  const [addForm, setAddForm] = useState({
    amount: "",
    description: "",
    incomeDate: new Date().toISOString().slice(0, 10),
    categoryId: "",
  });

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState(
    () => searchParams.get("category") ?? "all",
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = parseDateParam(searchParams.get("start_date"));
    const to = parseDateParam(searchParams.get("end_date"));

    if (!from && !to) return undefined;

    const normalizedFrom = from ?? to;
    if (!normalizedFrom) return undefined;

    return {
      from: normalizedFrom,
      ...(to ? { to } : {}),
    };
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageNumber, setPageNumber] = useState(() =>
    parsePositiveInt(searchParams.get("page"), 1),
  );
  const [pageSize, setPageSize] = useState(() =>
    parsePositiveInt(searchParams.get("limit"), 10),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((old) =>
      typeof updater === "function" ? updater(old) : updater,
    );
  };

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await api.get(`/categories/user?type=income`);
      if (res.status !== 200) {
        throw new Error("Failed to fetch income categories");
      }
      setCategories(res.data || []);
    } catch (error) {
      toast.error("Failed to load income categories", {
        description: String(error),
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [user.id]);

  const fetchIncomes = useCallback(
    async ({
      startDate,
      endDate,
      category,
      order = "desc",
      page = pageNumber,
      limit = pageSize,
      q = query,
      sortBy,
      sortOrder,
    }: {
      startDate: string;
      endDate: string;
      category: string;
      order?: "asc" | "desc";
      page?: number;
      limit?: number;
      q?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<IncomeListProps> => {
      const url =
        `/incomes/fetch-with-conditions?order=${order}` +
        `${startDate ? `&start_date=${encodeURIComponent(startDate)}` : ""}` +
        `${endDate ? `&end_date=${encodeURIComponent(endDate)}` : ""}` +
        `${category && category !== "all" ? `&category_id=${category}` : ""}` +
        `${q ? `&q=${encodeURIComponent(q)}` : ""}` +
        `&page=${page}` +
        `${limit ? `&limit=${limit}` : ""}` +
        `${sortBy ? `&sort_by=${sortBy}` : ""}` +
        `${sortOrder ? `&sort_order=${sortOrder}` : ""}`;

      const response = await api.get(url);
      if (response.status !== 200) {
        throw new Error("Failed to fetch incomes");
      }
      return response.data;
    },
    [pageNumber, pageSize, query],
  );

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

  const fetchIncomeMonthlyOverview = async () => {
    try {
      setIncomeOverviewV2Loading(true);

      const [monthlyRes, categoryRes] = await Promise.all([
        api.get(
          `/incomes/monthly?count=${incomeOverviewParams.count ?? 6}&type=${incomeOverviewParams.type ?? OverviewEnum.MONTH}`,
        ),
        api.get(
          `/incomes/monthly/category?count=${incomeOverviewParams.count ?? 6}&type=${incomeOverviewParams.type ?? OverviewEnum.MONTH}`,
        ),
      ]);

      if (monthlyRes.status !== 200 || categoryRes.status !== 200) {
        throw new Error("Network response was not ok");
      }

      setIncomeOverviewV2({
        amountByMonthV2: monthlyRes.data,
        monthlyCategoryExpenseV2: categoryRes.data,
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIncomeOverviewV2Loading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const categoryAddedHandler = () => fetchCategories();
    window.addEventListener("category-added", categoryAddedHandler);
    return () =>
      window.removeEventListener("category-added", categoryAddedHandler);
  }, [fetchCategories]);

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
    fetchIncomeMonthlyOverview();
  }, [incomeOverviewParams]);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setTableLoading(true);
        const data = await fetchIncomes({
          startDate: dateRange?.from ? formatDateTimeParam(dateRange.from) : "",
          endDate: dateRange?.to ? formatDateTimeParam(dateRange.to, true) : "",
          category: categoryFilter,
          order: "desc",
          page: pageNumber,
          limit: pageSize,
          q: query,
        });

        setIncomesList(data);
        setDatas(data.incomes || []);
      } catch (error) {
        toast.error("Failed to fetch incomes", { description: String(error) });
      } finally {
        setTableLoading(false);
      }
    };

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      loadInitial();
    }
  }, [fetchIncomes, categoryFilter, dateRange, pageNumber, pageSize, query]);

  useEffect(() => {
    // Initial load is handled by the mount-only effect above.
    // Skip first run to avoid duplicate requests on first render.
    if (skipInitialDebouncedFetchRef.current) {
      skipInitialDebouncedFetchRef.current = false;
      return;
    }

    const sortField = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    const sortByMap: Record<string, string> = {
      amount: "amount",
      incomeDate: "incomeDate",
      description: "description",
      categoryName: "category",
    };

    const timer = setTimeout(async () => {
      try {
        setTableLoading(true);
        const data = await fetchIncomes({
          startDate: dateRange?.from ? formatDateTimeParam(dateRange.from) : "",
          endDate: dateRange?.to ? formatDateTimeParam(dateRange.to, true) : "",
          category: categoryFilter,
          order: "desc",
          page: pageNumber,
          limit: pageSize,
          q: query,
          sortBy: sortField ? sortByMap[sortField] : undefined,
          sortOrder: sortField ? (sortOrder as "asc" | "desc") : undefined,
        });

        setIncomesList(data);
        setDatas(data.incomes || []);
      } catch (error) {
        toast.error("Failed to fetch incomes", { description: String(error) });
      } finally {
        setTableLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    sorting,
    query,
    categoryFilter,
    dateRange,
    pageNumber,
    pageSize,
    refreshTrigger,
    fetchIncomes,
  ]);

  useEffect(() => {
    const handleIncomeAdded = () => {
      setPageNumber(1);
      setRefreshTrigger((prev) => prev + 1);
      fetchIncomeOverview({ hasConstraint: true, type: "" });
      fetchIncomeMonthlyOverview();
    };

    window.addEventListener("income-added", handleIncomeAdded);
    return () => window.removeEventListener("income-added", handleIncomeAdded);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (categoryFilter !== "all") {
      params.set("category", categoryFilter);
    }

    const startDate = formatDateParam(dateRange?.from);
    const endDate = formatDateParam(dateRange?.to);

    if (startDate) {
      params.set("start_date", startDate);
    }

    if (endDate) {
      params.set("end_date", endDate);
    }

    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }

    if (pageSize !== 10) {
      params.set("limit", String(pageSize));
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) return;

    router.push(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, {
      scroll: false,
    });
  }, [
    router,
    pathname,
    searchParams,
    query,
    categoryFilter,
    dateRange,
    pageNumber,
    pageSize,
  ]);

  useEffect(() => {
    setPageNumber(1);
  }, [query, categoryFilter, dateRange]);

  useEffect(() => {
    const selectedRows = incomesList.incomes.filter(
      (income) => rowSelection[income.id],
    );
    setSelectedIncomes(selectedRows);
  }, [rowSelection, incomesList]);

  const tableColumns = useMemo(
    () =>
      columns({
        userCurrency: user.currency,
        onEdit: (row) => {
          setSelectedUpdate(row);
          setEditForm({
            amount: String(row.amount),
            description: row.description,
            incomeDate: toDateOnly(row.incomeDate),
            categoryId: row.categoryId,
          });
        },
        onDelete: (row) => setSelectedDelete(row),
      }),
    [user.currency],
  );

  const refreshIncomeTable = useCallback(async () => {
    const sortField = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    const sortByMap: Record<string, string> = {
      amount: "amount",
      incomeDate: "incomeDate",
      description: "description",
      categoryName: "category",
    };

    const data = await fetchIncomes({
      startDate: dateRange?.from ? formatDateTimeParam(dateRange.from) : "",
      endDate: dateRange?.to ? formatDateTimeParam(dateRange.to, true) : "",
      category: categoryFilter,
      order: "desc",
      page: pageNumber,
      limit: pageSize,
      q: query,
      sortBy: sortField ? sortByMap[sortField] : undefined,
      sortOrder: sortField ? (sortOrder as "asc" | "desc") : undefined,
    });

    setIncomesList(data);
    setDatas(data.incomes || []);
  }, [
    sorting,
    fetchIncomes,
    dateRange,
    categoryFilter,
    pageNumber,
    pageSize,
    query,
  ]);

  const handleUpdateIncome = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUpdate) return;

    const amount = Number.parseFloat(editForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!editForm.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!editForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      setSaving(true);
      const payload: UpdateIncomeReq = {
        category: {
          id: editForm.categoryId,
        },
        amount,
        description: editForm.description,
        incomeDate: formatDateForApi(editForm.incomeDate),
      };

      const res = await api.put(
        `/incomes/update/${selectedUpdate.id}`,
        payload,
      );
      if (res.status !== 200) {
        throw new Error("Failed to update income");
      }

      setIncomesList((prev) => ({
        ...prev,
        incomes: prev.incomes.map((income) =>
          income.id === selectedUpdate.id
            ? {
                ...income,
                categoryId: payload.category.id,
                categoryName:
                  categories.find(
                    (category) => category.id === payload.category.id,
                  )?.name || income.categoryName,
                amount: payload.amount,
                description: payload.description,
                incomeDate: payload.incomeDate,
              }
            : income,
        ),
      }));
      setDatas((prev) =>
        prev.map((income) =>
          income.id === selectedUpdate.id
            ? {
                ...income,
                categoryId: payload.category.id,
                categoryName:
                  categories.find(
                    (category) => category.id === payload.category.id,
                  )?.name || income.categoryName,
                amount: payload.amount,
                description: payload.description,
                incomeDate: payload.incomeDate,
              }
            : income,
        ),
      );

      setSelectedUpdate(null);
      window.dispatchEvent(new Event("income-added"));
      toast.success("Income updated successfully");
    } catch (error) {
      toast.error("Failed to update income", { description: String(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIncome = async () => {
    if (!selectedDelete) return;

    try {
      setSaving(true);
      const res = await api.delete(`/incomes/${selectedDelete.id}`);
      if (res.status !== 200) {
        throw new Error("Failed to delete income");
      }

      await refreshIncomeTable();
      setSelectedDelete(null);
      setRowSelection({});
      toast.success("Income deleted successfully");
    } catch (error) {
      toast.error("Failed to delete income", { description: String(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = selectedIncomes.map((income) => ({ id: income.id }));
    if (!ids.length) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/incomes/bulk-delete`, ids);

      if (response.status !== 200) {
        throw new Error(
          response.data?.error || "Failed to bulk delete incomes",
        );
      }

      await refreshIncomeTable();
      setSelectedIncomes([]);
      setRowSelection({});
      toast.success("Deleted successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        String(error);
      toast.error("Failed to delete incomes!", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async () => {
    if (!user.id) {
      toast.error("User not found");
      return;
    }

    try {
      setLoading(true);

      const startDate = dateRange?.from
        ? formatDateTimeParam(dateRange.from)
        : "";
      const endDate = dateRange?.to
        ? formatDateTimeParam(dateRange.to, true)
        : "";

      const link =
        `/incomes/user/${user.id}/export` +
        `${startDate || endDate ? "?" : ""}` +
        `${startDate ? `start_date=${encodeURIComponent(startDate)}` : ""}` +
        `${startDate && endDate ? "&" : ""}` +
        `${endDate ? `end_date=${encodeURIComponent(endDate)}` : ""}`;

      const response = await api.get(link, { responseType: "blob" });

      if (response.status !== 200) {
        throw new Error("Failed to download incomes");
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers["content-disposition"] as
        | string
        | undefined;
      const fileNameMatch = contentDisposition?.match(
        /filename=\"?([^\";]+)\"?/i,
      );
      const fileName = fileNameMatch?.[1] || "incomes.csv";

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      let errorMessage = "Failed to export incomes";

      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMessage = parsed?.message || errorMessage;
        } catch {
          errorMessage = String(error);
        }
      } else {
        errorMessage = error?.response?.data?.message || String(error);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncome = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number.parseFloat(addForm.amount);

    if (!addForm.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!addForm.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      setAddIncomeSaving(true);

      const payload = {
        category: { id: addForm.categoryId },
        amount,
        description: addForm.description,
        incomeDate: formatDateForApi(addForm.incomeDate),
      };

      const res = await api.post("/incomes/create", payload);
      if (res.status !== 200) {
        throw new Error("Failed to create income");
      }

      setAddForm({
        categoryId: "",
        amount: "",
        description: "",
        incomeDate: new Date().toISOString().slice(0, 10),
      });

      setAddIncomeSheetOpen(false);
      window.dispatchEvent(new Event("income-added"));
      toast.success("Income created successfully");
    } catch (error) {
      toast.error("Failed to create income", {
        description: String(error),
      });
    } finally {
      setAddIncomeSaving(false);
    }
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setCategoryFilter("all");
    setQuery("");
    setPageNumber(1);
  };

  const minIncomeYear = incomeOverview
    ? incomeOverview.earliestStartYear
    : 2000;
  const minIncomeMonth = incomeOverview ? incomeOverview.earliestStartMonth : 1;
  const mostIncome = incomeOverview?.thisMonthMostIncomeItem;
  const [incomeItemName, incomeItemValue] =
    mostIncome && Object.entries(mostIncome)[0]
      ? Object.entries(mostIncome)[0]
      : [null, null];

  return (
    <div className="w-full space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Ledger
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Income
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your income entries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleFileDownload}>
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
          <Button onClick={() => setAddIncomeSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        </div>
      </div>

      <Sheet open={addIncomeSheetOpen} onOpenChange={setAddIncomeSheetOpen}>
        <SheetContent className="h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Income</SheetTitle>
          </SheetHeader>

          <form
            onSubmit={handleCreateIncome}
            className="p-4 space-y-4 flex flex-col flex-1 h-full"
          >
            <div className="flex flex-col flex-1 h-full space-y-4">
              <Input
                placeholder="Description"
                value={addForm.description}
                onChange={(event) =>
                  setAddForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />

              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={addForm.amount}
                onChange={(event) =>
                  setAddForm((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                }
              />

              <Select
                onValueChange={(value) =>
                  setAddForm((prev) => ({ ...prev, categoryId: value }))
                }
                value={addForm.categoryId}
                disabled={categoriesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      categoriesLoading
                        ? "Loading categories..."
                        : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover
                open={addDatePickerOpen}
                onOpenChange={setAddDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between text-muted-foreground"
                  >
                    {addForm.incomeDate || "Select date"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      addForm.incomeDate
                        ? new Date(`${addForm.incomeDate}T00:00:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      setAddForm((prev) => ({
                        ...prev,
                        incomeDate: date.toISOString().slice(0, 10),
                      }));
                      setAddDatePickerOpen(false);
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddIncomeSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addIncomeSaving}>
                  {addIncomeSaving ? <Spinner /> : "Add Income"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <IncomeInsightCards
        userCurrency={user.currency}
        incomeOverview={incomeOverview}
        incomeItemName={incomeItemName as string | null}
        incomeItemValue={incomeItemValue as number | null}
      />
      <Tabs defaultValue="graphs" className="w-full space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="graphs">Analytics</TabsTrigger>
          <TabsTrigger value="table">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="graphs" className="mt-0 space-y-4">
          <IncomeInsightCharts
            userCurrency={user.currency}
            userTheme={user.theme}
            incomeOverview={incomeOverview}
            incomeOverviewV2={incomeOverviewV2}
            incomeOverviewV2Loading={incomeOverviewV2Loading}
            minIncomeYear={minIncomeYear}
            minIncomeMonth={minIncomeMonth}
            loadingIncomeYear={loadingIncomeYear}
            loadingIncomeMonth={loadingIncomeMonth}
            incomeCurrentYearForYearly={incomeCurrentYearForYearly}
            setIncomeCurrentYearForYearly={setIncomeCurrentYearForYearly}
            incomeCurrentMonth={incomeCurrentMonth}
            incomeCurrentMonthYear={incomeCurrentMonthYear}
            setIncomeCurrentMonth={setIncomeCurrentMonth}
            setIncomeCurrentMonthYear={setIncomeCurrentMonthYear}
            incomeOverviewParams={incomeOverviewParams}
            setIncomeOverviewParams={setIncomeOverviewParams}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0 space-y-4">
          <SearchAndFilter
            query={query}
            setQuery={setQuery}
            selectedIncomes={selectedIncomes}
            handleBulkDelete={handleBulkDelete}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            clearFilters={clearFilters}
            open={open}
            setOpen={setOpen}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

          <DataTable
            columns={tableColumns}
            data={datas}
            totalPages={incomesList.totalPages}
            pageIndex={pageNumber - 1}
            onPageChange={(page) => setPageNumber(page + 1)}
            loading={tableLoading || loading}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </TabsContent>
      </Tabs>

      {selectedDelete && (
        <AlertDialog
          open={!!selectedDelete}
          onOpenChange={(open) => !open && setSelectedDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete income?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                <strong> {selectedDelete.description}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteIncome}>
                {saving ? <Spinner /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {selectedUpdate && (
        <Dialog
          open={!!selectedUpdate}
          onOpenChange={() => setSelectedUpdate(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>Update Income</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateIncome} className="space-y-4 w-full">
              <Input
                placeholder="Description"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />

              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={editForm.amount}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                }
              />

              <Select
                value={editForm.categoryId}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover
                open={editDatePickerOpen}
                onOpenChange={setEditDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between text-muted-foreground"
                  >
                    {editForm.incomeDate || "Select date"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      editForm.incomeDate
                        ? new Date(`${editForm.incomeDate}T00:00:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      setEditForm((prev) => ({
                        ...prev,
                        incomeDate: date.toISOString().slice(0, 10),
                      }));
                      setEditDatePickerOpen(false);
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUpdate(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner /> : "Update Income"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const SearchAndFilter = ({
  query,
  setQuery,
  selectedIncomes,
  handleBulkDelete,
  categories,
  categoriesLoading,
  categoryFilter,
  setCategoryFilter,
  clearFilters,
  open,
  setOpen,
  dateRange,
  setDateRange,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedIncomes: IncomeRow[];
  handleBulkDelete: () => void;
  categories: Category[];
  categoriesLoading: boolean;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  clearFilters: () => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) => {
  const isDesktop = useMediaQuery("(min-width: 530px)");

  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...categories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
  ];

  return isDesktop ? (
    <Card>
      <CardContent className="flex flex-wrap flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 justify-between lg:items-end">
        <div className="flex flex-col lg:flex-row gap-4">
          <div>
            <Label className="mb-2 text-sm font-extrabold">
              What are you looking for?
            </Label>
            <div className="flex items-center relative rounded-md sm:w-full md:w-md lg:w-lg">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-7 text-muted-foreground"
                placeholder="Search incomes..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <Button
                  className="absolute right-2 h-[50%] w-2"
                  variant="ghost"
                  onClick={() => setQuery("")}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="w-[200px]">
            <Label className="mb-2 text-sm font-extrabold">Category</Label>
            <DropDown
              options={categoryOptions}
              selectedOption={categoryFilter}
              onSelect={setCategoryFilter}
            />
          </div>

          <div className="w-[200px]">
            <Label className="mb-2 text-sm font-extrabold">Date Range</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between text-muted-foreground"
                >
                  {dateRange?.from && dateRange?.to
                    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    : "Select date range"}
                  <ChevronDown />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from || new Date()}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          {selectedIncomes.length > 0 && (
            <Button
              disabled={selectedIncomes.length === 0}
              onClick={() => handleBulkDelete()}
              variant="destructive"
            >
              <Trash />
            </Button>
          )}

          <Button
            onClick={() => clearFilters()}
            disabled={!dateRange && categoryFilter === "all" && !query}
            variant="outline"
          >
            <FilterX className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Popover>
      <PopoverTrigger asChild className="group/collapsible">
        <Button variant="outline" className="w-full">
          <span>Filters & Options</span>
          <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 space-y-4 bg-background" role="dialog">
        <div className="flex flex-col lg:flex-row gap-4">
          <div>
            <Label className="mb-2 text-sm font-extrabold">
              What are you looking for?
            </Label>
            <div className="flex items-center relative rounded-md sm:w-full md:w-md lg:w-lg">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-7 text-muted-foreground"
                placeholder="Search incomes..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <Button
                  className="absolute right-2 h-[50%] w-2"
                  variant="ghost"
                  onClick={() => setQuery("")}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="w-[200px]">
            <Label className="mb-2 text-sm font-extrabold">Category</Label>
            <DropDown
              options={categoryOptions}
              selectedOption={categoryFilter}
              onSelect={setCategoryFilter}
            />
            {categoriesLoading && (
              <p className="mt-1 text-xs text-muted-foreground">
                Loading categories...
              </p>
            )}
          </div>

          <div className="w-[200px]">
            <Label className="mb-2 text-sm font-extrabold">Date Range</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between text-muted-foreground"
                >
                  {dateRange?.from && dateRange?.to
                    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    : "Select date range"}
                  <ChevronDown />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from || new Date()}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          {selectedIncomes.length > 0 && (
            <Button
              disabled={selectedIncomes.length === 0}
              onClick={() => handleBulkDelete()}
              variant="destructive"
            >
              <Trash />
            </Button>
          )}
          <Button
            onClick={() => clearFilters()}
            disabled={!dateRange && categoryFilter === "all" && !query}
            variant="outline"
          >
            <FilterX className="h-6 w-6" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
