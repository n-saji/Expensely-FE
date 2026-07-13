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
import {
  ExpenseInsightCards,
  ExpenseInsightCharts,
} from "../../dashboard/_components/expense-insights";
import {
  IncomeInsightCards,
  IncomeInsightCharts,
} from "../../dashboard/_components/income-insights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Slidebar from "@/components/slidebar";

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

  // Attachment editing states
  const [attachmentEditMode, setAttachmentEditMode] = useState(false);
  const [attachmentActionLoading, setAttachmentActionLoading] = useState(false);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const skipInitialDebouncedFetchRef = useRef(true);

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

  // CSV download trigger
  const downloadCsvHandler = async () => {
    try {
      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";
      const fromDate = dateRange?.from
        ? dateRange.from.toISOString().slice(0, 10)
        : "";
      const toDate = dateRange?.to
        ? dateRange.to.toISOString().slice(0, 10)
        : "";

      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append("start_date", fromDate + " 00:00:00");
      if (toDate) queryParams.append("end_date", toDate + " 23:59:59");
      if (categoryFilter) queryParams.append("category_id", categoryFilter);
      if (query) queryParams.append("q", query);
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={downloadCsvHandler}>
            <Download className="mr-2 h-4 w-4" />
            <span className="text-xs">Download CSV</span>
          </Button>
          <Slidebar variant="default" />
        </div>
      </div>

      {/* Tabs Switcher for insights */}
      <div className="w-full">
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="expense">Expense Insights</TabsTrigger>
            <TabsTrigger value="income">Income Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-6">
            <ExpenseInsightCards
              userCurrency={user.currency}
              overview={overview}
              itemName={null}
              itemValue={null}
            />
            <ExpenseInsightCharts
              overview={overview}
              overviewV2={overviewV2}
              overviewV2Loading={overviewV2Loading}
              minYear={minYear}
              minMonth={minMonth}
              loadingYear={loadingYear}
              loadingMonth={loadingMonth}
              currentYearForYearly={currentYearForYearly}
              setCurrentYearForYearly={setCurrentYearForYearly}
              currentMonth={currentMonth}
              currentMonthYear={currentMonthYear}
              setCurrentMonth={setCurrentMonth}
              setCurrentMonthYear={setCurrentMonthYear}
              overviewParams={overviewParams}
              setOverviewParams={setOverviewParams}
              userCurrency={user.currency}
              userTheme={user.theme}
            />
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <IncomeInsightCards
              userCurrency={user.currency}
              incomeOverview={incomeOverview}
              incomeItemName={null}
              incomeItemValue={null}
            />
            <IncomeInsightCharts
              incomeOverview={incomeOverview}
              incomeOverviewV2={incomeOverviewV2}
              incomeOverviewV2Loading={incomeOverviewV2Loading}
              minIncomeYear={incomeMinYear}
              minIncomeMonth={incomeMinMonth}
              loadingIncomeYear={incomeLoadingYear}
              loadingIncomeMonth={incomeLoadingMonth}
              incomeCurrentYearForYearly={incomeCurrentYearForYearly}
              setIncomeCurrentYearForYearly={setIncomeCurrentYearForYearly}
              incomeCurrentMonth={incomeCurrentMonth}
              incomeCurrentMonthYear={incomeCurrentMonthYear}
              setIncomeCurrentMonth={setIncomeCurrentMonth}
              setIncomeCurrentMonthYear={setIncomeCurrentMonthYear}
              incomeOverviewParams={incomeOverviewParams}
              setIncomeOverviewParams={setIncomeOverviewParams}
              userCurrency={user.currency}
              userTheme={user.theme}
              incomeCategories={categories.categories}
            />
          </TabsContent>
        </Tabs>
      </div>

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
              className=" pl-9 pr-8 text-foreground bg-muted/20 border-muted/60 focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  updateQueryParams({ q: null, page: "1" });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={categoryFilter || "all-categories"}
              onValueChange={(val) =>
                updateQueryParams({
                  category_id: val === "all-categories" ? null : val,
                  page: "1",
                })
              }
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date boundaries filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 font-normal">
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
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}

            {selectedTransactions.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-9">
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
    </div>
  );
}
