/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSelector } from "react-redux";
import { columns, Expense } from "./columns";
import { DataTable } from "./data-table";
import { RootState } from "@/redux/store";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
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
  Download,
  MoreHorizontal,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

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

interface expense {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  currency: string;
}

interface ExpenseListProps {
  expenses: expense[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
}

export default function ExpenseTableComponent() {
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [datas, setDatas] = useState<Expense[]>([]);
  const isExpenseMountedV2 = useRef(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const [calenderOpen, setCalenderOpen] = useState(false);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((old) =>
      typeof updater === "function" ? updater(old) : updater
    );
  };

  const [query, setQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [expensesList, setExpensesList] = useState<ExpenseListProps>({
    expenses: [],
    totalPages: 0,
    totalElements: 0,
    pageNumber: pageNumber,
  });

  useEffect(() => {
    const selectedRows = expensesList.expenses.filter(
      (expense) => rowSelection[expense.id]
    );
    setSelectedExpenses(selectedRows);
  }, [rowSelection, expensesList]);

  // initial fetch for expenses
  useEffect(() => {
    const fetchExpenses = async ({
      fromDate,
      toDate,
      category,
      order = "desc",
      page = pageNumber,
      limit = 10,
      q = query,
    }: {
      fromDate: string;
      toDate: string;
      category: string;
      order?: "asc" | "desc";
      page?: number;
      limit?: number;
      q?: string;
    }) => {
      const URL =
        `/expenses/user/${user.id}/fetch-with-conditions?order=${order}` +
        `${fromDate ? `&start_date=${fromDate}` : ""}` +
        `${toDate ? `&end_date=${toDate}` : ""}` +
        `${category ? `&category_id=${category}` : ""}` +
        `${q ? `&q=${q}` : ""}` +
        `&page=${page}` +
        `${limit ? `&limit=${limit}` : ""}`;

      try {
        const response = await api.get(URL);
        setTableLoading(true);
        if (response.status !== 200)
          throw new Error("Failed to fetch expenses");
        const data = await response.data;

        setExpensesList({
          expenses: data.expenses,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          pageNumber: data.pageNumber,
        });

        const formatedData = data.expenses.map((expense: Expense) => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          expenseDate: expense.expenseDate,
          categoryId: expense.categoryId,
          categoryName: expense.categoryName,
          currency: expense.currency,
        }));
        setDatas(formatedData);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setTableLoading(false);
      }
    };

    // Fetch expenses only on the first mount
    if (!isExpenseMountedV2.current) {
      isExpenseMountedV2.current = true;
      fetchExpenses({
        fromDate: dateRange?.from
          ? dateRange.from.toISOString().slice(0, 16)
          : "",
        toDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 16) : "",
        q: query,
        category: categoryFilter,
        order: "desc",
        limit: 10,
      });
    }
  }, []);

  const expenseSchema = z.object({
    id: z.string().min(1, "Expense id is required"),
    userId: z.string().min(1, "User ID is required"),
    description: z.string().min(1, "Description is required"),
    expenseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid expense date",
    }),
    amount: z.coerce.number().min(0, "Amount must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
    category: z.object({
      id: z.string().min(1, "Category is required"),
      name: z.string().min(1, "Category name is required"),
    }),
  });

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      id: expenseToEdit?.id || "",
      userId: user.id || "",
      description: expenseToEdit?.description || "",
      expenseDate: expenseToEdit?.expenseDate,
      amount: expenseToEdit?.amount || 0,
      currency: user.currency || "USD",
      category: {
        id: expenseToEdit?.categoryId || "",
        name: expenseToEdit?.categoryName || "",
      },
    },
  });

  async function onSubmitUpdate(data: z.infer<typeof expenseSchema>) {
    try {
      setLoading(true);
      const oldExpense = expensesList.expenses.find(
        (item) => item.id === data.id
      );

      if (
        oldExpense?.expenseDate.slice(0, 10) !== data.expenseDate.slice(0, 10)
      ) {
        const now = new Date();
        data.expenseDate =
          data.expenseDate +
          "T" +
          now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
      } else {
        data.expenseDate =
          data.expenseDate.slice(0, 10) + oldExpense?.expenseDate.slice(10);
      }
      const response = await api.put(`/expenses/update/${data.id}`, data);
      if (response.status !== 200) throw new Error("Failed to update expense");
      toast.success("Expense updated successfully");
      form.reset();
    } catch (error) {
      toast.error(`Error updating expense: ${error}`);
    } finally {
      setOpenEditDialog(false);
      setLoading(false);
      // Refresh expenses list
      try {
        setTableLoading(true);

        const updatedExpenses = await fetchExpenses({
          userId: user.id,
          fromDate: dateRange?.from
            ? dateRange.from.toISOString().slice(0, 16)
            : "",
          toDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 16) : "",
          category: categoryFilter,
          order: "desc",
          page: pageNumber,
          limit: 10,
          q: query,
        });
        setExpensesList(updatedExpenses);
        const formatedData = updatedExpenses.expenses.map(
          (expense: Expense) => ({
            id: expense.id,
            amount: expense.amount,
            description: expense.description,
            expenseDate: expense.expenseDate,
            categoryId: expense.categoryId,
            categoryName: expense.categoryName,
            currency: expense.currency,
          })
        );
        setDatas(formatedData);
      } catch (error) {
        toast.error("Error refreshing expenses", {
          description: String(error),
        });
      } finally {
        setTableLoading(false);
      }
    }
  }

  const handleDelete = async (expense: Expense | null) => {
    if (!expense) return;

    try {
      setLoading(true);
      const res = await api.delete(`/expenses/${expense.id}`);
      let data;
      try {
        const text = await res.data;
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse response:", e);
        data = {};
      }

      if (res.status !== 200) {
        throw new Error(data.error || "Failed to delete budget");
      }
      // Remove deleted budget from state
      setDatas((prev) => prev.filter((b) => b.id !== expense.id));
      toast.success(`Deleted ${expense.description}`, {
        description: "Expense deleted successfully",
      });
    } catch (err) {
      toast.error("Failed to delete expense", { description: String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sortField = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";
    setTableLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      // Fetch expenses after debounce time

      try {
        const data = await fetchExpenses({
          userId: user.id,
          fromDate: dateRange?.from
            ? dateRange.from.toISOString().slice(0, 16)
            : "",
          toDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 16) : "",
          category: categoryFilter,
          order: "desc",
          page: pageNumber,
          limit: 10,
          q: query,
          ...(sortField ? { sortBy: sortField, sortOrder } : {}),
        });

        setExpensesList(data);
        const formatedData = data.expenses.map((expense: Expense) => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          expenseDate: expense.expenseDate,
          categoryId: expense.categoryId,
          categoryName: expense.categoryName,
          currency: expense.currency,
        }));
        setDatas(formatedData);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        toast.error("Error fetching expenses", { description: String(error) });
      } finally {
        setTableLoading(false);
      }
    }, 600); // Adjust the debounce time as needed

    return () => clearTimeout(delayDebounceFn);
  }, [query, dateRange, categoryFilter, pageNumber, sorting]);

  async function fetchExpenses({
    userId,
    fromDate,
    toDate,
    category,
    order = "desc",
    page = 1,
    limit = 10,
    q = query,
    sortBy,
    sortOrder,
  }: {
    userId: string;
    fromDate: string;
    toDate: string;
    category: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
    q?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ExpenseListProps> {
    if (!userId) {
      toast("User not found", { description: "error" });
      return { expenses: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    }

    const URL =
      `/expenses/user/${userId}/fetch-with-conditions?order=${order}` +
      `${fromDate ? `&start_date=${fromDate}` : ""}` +
      `${toDate ? `&end_date=${toDate}` : ""}` +
      `${category ? `&category_id=${category}` : ""}` +
      `${q ? `&q=${q}` : ""}` +
      `&page=${page}` +
      `${limit ? `&limit=${limit}` : ""}` +
      `${sortBy ? `&sort_by=${sortBy}` : ""}` +
      `${sortOrder ? `&sort_order=${sortOrder}` : ""}`;

    const response = await api.get(URL);

    if (response.status !== 200) throw new Error("Failed to fetch expenses");

    if (response.status !== 200) {
      throw new Error("Failed to fetch expenses");
    }
    return response.data;
  }

  const tableColumns = useMemo(() => {
    return columns(
      user?.currency,
      dateRange,
      setDateRange,
      open,
      setOpen,
      categories,
      categoryFilter,
      setCategoryFilter
    ).map((col) => {
      if (col.id === "actions") {
        return {
          ...col,
          cell: ({ row }: any) => {
            const expense: Expense = row.original;
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
                      setExpenseToEdit(expense);
                      setOpenEditDialog(true);
                      form.reset({
                        id: expense.id,
                        userId: user.id,
                        description: expense.description,
                        expenseDate: expense.expenseDate,
                        amount: expense.amount,
                        currency: expense.currency,
                        category: {
                          id: expense.categoryId,
                          name: expense.categoryName,
                        },
                      });
                    }}
                  >
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setExpenseToDelete(expense)}
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
  }, [user?.currency, open, dateRange]);

  const handleBulkDelete = async (expenseId?: string) => {
    if (selectedExpenses.length === 0 && !expenseId) {
      console.warn("No expenses selected for deletion");
      return;
    }
    const ids = selectedExpenses.map((id) => ({ id: id.id }));
    if (expenseId && !selectedExpenses.find((e) => e.id === expenseId)) {
      ids.push({ id: expenseId });
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/expenses/user/${user.id}/bulk-delete`,
        ids
      );

      if (response.status !== 200) {
        throw new Error("Failed to delete expenses");
      }

      setExpensesList((prev) => ({
        ...prev,
        expenses: prev.expenses.filter(
          (expense) => !selectedExpenses.includes(expense)
        ),
      }));
      setSelectedExpenses([]);
    } catch (error) {
      console.error("Error deleting expenses:", error);
    } finally {
      setLoading(false);
      try {
        setTableLoading(true);
        fetchExpenses({
          userId: user.id,
          fromDate: dateRange?.from
            ? dateRange.from.toISOString().slice(0, 16)
            : "",
          toDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 16) : "",
          category: categoryFilter,
          order: "desc",
          page: pageNumber,
          limit: 10,
          q: query,
        });
      } catch (error) {
        console.error("Error fetching expenses:", error);
        toast.error("Error fetching expenses", { description: String(error) });
      } finally {
        setTableLoading(false);
      }
    }
  };

  const handleFileDownload = async () => {
    try {
      const link = `/expenses/user/${user.id}/export`;

      const response = await api.get(link, { responseType: "blob" });

      if (response.status !== 200) {
        throw new Error("Failed to download file");
      }

      const blob = await response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const file_name = `expenses`;
      a.download = `${file_name}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
    }
  };

  return (
    <div className="block w-full space-y-4">
      {expenseToDelete && (
        <AlertDialog
          open={!!expenseToDelete}
          onOpenChange={(open) => !open && setExpenseToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                expense <strong>{expenseToDelete.description}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await handleDelete(expenseToDelete);
                  setExpenseToDelete(null);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        selectedExpenses={selectedExpenses}
        handleBulkDelete={handleBulkDelete}
        handleFileDownload={handleFileDownload}
      />
      <DataTable
        columns={tableColumns}
        data={datas}
        totalPages={expensesList.totalPages}
        pageIndex={pageNumber - 1}
        onPageChange={(page) => setPageNumber(page + 1)}
        loading={tableLoading}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      {openEditDialog && expenseToEdit && (
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="max-h-[90vh] sm:max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitUpdate)}>
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  defaultValue={form.getValues("description")}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter expense description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  defaultValue={form.getValues("amount")}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter expense amount"
                          {...field}
                        />
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
                    <FormItem className="mt-4">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);

                          const selectedCategory = categories.categories.find(
                            (cat) => cat.id === val
                          );
                          if (selectedCategory) {
                            form.setValue(
                              "category.name",
                              selectedCategory.name
                            );
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="expenseDate"
                  defaultValue={form.getValues("expenseDate")}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Expense Date</FormLabel>
                      <FormControl>
                        <Popover
                          open={calenderOpen}
                          onOpenChange={setCalenderOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date"
                              className="w-full justify-between text-muted-foreground"
                            >
                              {field.value
                                ? field.value.slice(0, 10)
                                : "Select date"}
                              <ChevronDown />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-full overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              defaultMonth={
                                field.value ? new Date(field.value) : undefined
                              }
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setCalenderOpen(false);
                                if (date) {
                                  field.onChange(
                                    date.toISOString().slice(0, 10)
                                  );
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-4 max-sm:flex-row w-full justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" className="">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button className="ml-2" type="submit" disabled={loading}>
                    {loading && <Spinner />}
                    {loading ? "" : "Update"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const SearchAndFilter = ({
  query,
  setQuery,
  selectedExpenses,
  handleBulkDelete,
  handleFileDownload,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedExpenses: Expense[];
  handleBulkDelete: () => void;
  handleFileDownload: () => void;
}) => {
  return (
    <div className="flex md:space-x-2 justify-between items-center">
      <div
        className="flex items-center relative border border-gray-500 dark:border-none rounded-md 
            active:border-none focus:border-none w-[200px] md:w-md lg:w-lg"
      >
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-7 text-muted-foreground"
          placeholder="Search expenses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <Button
            className="absolute right-2  h-[50%] w-2"
            variant={"ghost"}
            onClick={() => setQuery("")}
          >
            <X className="h-2 w-2" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {selectedExpenses.length > 0 && (
          <Button
            className={`ml-4 ${
              selectedExpenses.length === 0
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            disabled={selectedExpenses.length === 0}
            onClick={() => handleBulkDelete()}
          >
            <Trash />
          </Button>
        )}

        <Button onClick={handleFileDownload}>
          <Download className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
