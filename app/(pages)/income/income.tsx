/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import { Category, UpdateIncomeReq } from "@/global/dto";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { ChevronDown, Download, FilterX, Search, Trash, X } from "lucide-react";
import DropDown from "@/components/drop-down";
import { Label } from "@/components/ui/label";
import useMediaQuery from "@/utils/useMediaQuery";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IncomeListProps {
  incomes: IncomeRow[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
}

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
  const user = useSelector((state: RootState) => state.user);
  const isMountedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [editDatePickerOpen, setEditDatePickerOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [datas, setDatas] = useState<IncomeRow[]>([]);
  const [incomesList, setIncomesList] = useState<IncomeListProps>({
    incomes: [],
    totalPages: 0,
    totalElements: 0,
    pageNumber: 1,
  });

  const [selectedDelete, setSelectedDelete] = useState<IncomeRow | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<IncomeRow | null>(null);
  const [selectedIncomes, setSelectedIncomes] = useState<IncomeRow[]>([]);
  const [editForm, setEditForm] = useState({
    amount: "",
    description: "",
    incomeDate: new Date().toISOString().slice(0, 10),
  });

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((old) =>
      typeof updater === "function" ? updater(old) : updater,
    );
  };

  const fetchCategories = useCallback(async () => {
    if (!user.id) return;

    try {
      setCategoriesLoading(true);
      const res = await api.get(`/categories/user/${user.id}?type=income`);
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

  useEffect(() => {
    fetchCategories();
    const categoryAddedHandler = () => fetchCategories();
    window.addEventListener("category-added", categoryAddedHandler);
    return () =>
      window.removeEventListener("category-added", categoryAddedHandler);
  }, [fetchCategories]);

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
    };

    window.addEventListener("income-added", handleIncomeAdded);
    return () => window.removeEventListener("income-added", handleIncomeAdded);
  }, []);

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
          });
        },
        onDelete: (row) => setSelectedDelete(row),
      }),
    [user.currency],
  );

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

    try {
      setSaving(true);
      const payload: UpdateIncomeReq = {
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

      setIncomesList((prev) => {
        const updated = prev.incomes.filter(
          (income) => income.id !== selectedDelete.id,
        );
        const totalElements = Math.max(0, prev.totalElements - 1);
        const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
        return {
          ...prev,
          incomes: updated,
          totalElements,
          totalPages,
          pageNumber: Math.min(prev.pageNumber, totalPages),
        };
      });
      setDatas((prev) =>
        prev.filter((income) => income.id !== selectedDelete.id),
      );
      setSelectedDelete(null);
      window.dispatchEvent(new Event("income-added"));
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

    const deletedIds = new Set(ids.map((item) => item.id));

    try {
      setLoading(true);
      const response = await api.post(`/incomes/bulk-delete`, ids);

      if (response.status !== 200) {
        throw new Error(
          response.data?.error || "Failed to bulk delete incomes",
        );
      }

      setIncomesList((prev) => ({
        ...prev,
        incomes: prev.incomes.filter((income) => !deletedIds.has(income.id)),
        totalElements: Math.max(0, prev.totalElements - deletedIds.size),
        totalPages: Math.max(
          1,
          Math.ceil(
            Math.max(0, prev.totalElements - deletedIds.size) / pageSize,
          ),
        ),
      }));
      setDatas((prev) => prev.filter((income) => !deletedIds.has(income.id)));
      setSelectedIncomes([]);
      setRowSelection({});
      toast.success("Bulk delete incomes successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        String(error);
      toast.error("Bulk delete incomes failed!", {
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

  const clearFilters = () => {
    setDateRange(undefined);
    setCategoryFilter("all");
    setQuery("");
    setPageNumber(1);
  };

  return (
    <div className="w-full space-y-6 pb-8">
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

      <Card className="border-border/70 shadow-sm overflow-hidden">
        <CardContent className="pt-6">
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
            handleFileDownload={handleFileDownload}
            loading={loading}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm overflow-hidden">
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Income</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateIncome} className="space-y-4">
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
  handleFileDownload,
  loading,
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
  handleFileDownload: () => void;
  loading: boolean;
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Label className="text-sm text-muted-foreground truncate">
                <Button onClick={handleFileDownload}>
                  {loading ? <Spinner /> : <Download className="h-6 w-6" />}
                </Button>
              </Label>
            </TooltipTrigger>
            <TooltipContent>Download Incomes</TooltipContent>
          </Tooltip>

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
          <Button onClick={handleFileDownload}>
            {loading ? <Spinner /> : <Download className="h-6 w-6" />}
          </Button>
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
