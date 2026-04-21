/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FetchUserId } from "@/utils/fetch_token";
import { Budget } from "./columns";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BudgetReq, categorySkeleton, Period } from "@/global/dto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/api";
import BudgetCard from "./budget-card";
import { currencyMapper } from "@/utils/currencyMapper";
import {
  AlertTriangle,
  CheckCircle2,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const budgetSchema = z.object({
  Category: z.object({
    id: z.string().min(1, "Category is required"),
    name: z.string().min(1, "Category name is required"),
  }),
  User: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  amountLimit: z.coerce.number().min(1, "Amount must be greater than 0"),
  period: z.enum([Period.Weekly, Period.Monthly, Period.Yearly, Period.Custom]),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
});

async function fetchBudgets({ userId }: { userId: string }): Promise<Budget[]> {
  if (!userId) {
    toast("User not found", { description: "error" });
    return [];
  }
  const res = await api.get(`/budgets/user/${userId}`);
  if (res.status !== 200) {
    throw new Error("Failed to fetch budgets");
  }
  return res.data;
}

export default function Page() {
  const user_id = FetchUserId();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [loader, setLoader] = useState(false);
  const categories = useSelector((state: RootState) => state.categoryExpense);

  const isActiveBudget = (budget: Budget) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return true;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start <= now && end >= now;
  };

  useEffect(() => {
    const userId = FetchUserId();

    if (!userId) {
      toast("User not found", { description: "Please log in again." });
      setLoading(false);
      return;
    }

    async function loadBudgets() {
      try {
        const res = await api.get(`/budgets/user/${userId}`);

        if (res.status !== 200) {
          throw new Error("Failed to fetch budgets");
        }

        const data = res.data;
        const formatted: Budget[] = data.map((b: any) => ({
          id: b.id,
          category: {
            id: b.category.id,
            name: b.category.name,
          } as categorySkeleton,
          period: b.period,
          amountLimit: b.amountLimit,
          spent: b.amountSpent,
          startDate: b.startDate,
          endDate: b.endDate,
        }));

        setBudgets(formatted);
      } catch (error) {
        console.error(error);
        toast("Error fetching budgets", { description: String(error) });
      } finally {
        setLoading(false);
      }
    }

    loadBudgets();
  }, []);

  const handleDelete = async (budget: Budget | null) => {
    if (!budget) return;

    try {
      const res = await api.delete(`/budgets/${budget.id}`);
      let data;
      try {
        const text = await res.data;
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse response:", e);
        data = {};
      }

      if (res.status !== 204) {
        throw new Error(data.error || "Failed to delete budget");
      }
      setBudgets((prev) => prev.filter((b) => b.id !== budget.id));
      toast(`Deleted ${budget.category.name}`, {
        description: "Budget deleted successfully",
      });
    } catch (err) {
      toast("Failed to delete budget", { description: String(err) });
    }
  };

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      Category: {
        id: budgetToEdit?.category.id || "",
        name: budgetToEdit?.category.name || "",
      },
      User: { id: user.id || "" },
      amountLimit: budgetToEdit?.amountLimit || 0,
      period: budgetToEdit?.period || Period.Monthly,
      startDate:
        budgetToEdit?.startDate || new Date().toISOString().split("T")[0],
      endDate: budgetToEdit?.endDate || new Date().toISOString().split("T")[0],
    },
  });

  const watchPeriod = form.watch("period");
  useEffect(() => {
    const start = new Date();
    let newStart = new Date(start);
    let newEnd = new Date(start);

    if (watchPeriod === Period.Weekly) {
      const day = start.getDay();
      newStart.setDate(start.getDate() - day);
      newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + 6);
    } else if (watchPeriod === Period.Monthly) {
      newStart = new Date(start.getFullYear(), start.getMonth(), 1);
      newEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (watchPeriod === Period.Yearly) {
      newStart = new Date(start.getFullYear(), 0, 1);
      newEnd = new Date(start.getFullYear(), 11, 31);
    }

    form.setValue("startDate", newStart.toISOString().split("T")[0]);
    form.setValue("endDate", newEnd.toISOString().split("T")[0]);
  }, [watchPeriod, form]);

  async function onSubmit(data: z.infer<typeof budgetSchema>) {
    try {
      setLoader(true);
      const api_url = "/budgets/" + budgetToEdit?.id;
      const budgetData: BudgetReq = {
        category: {
          id: data.Category.id,
        },
        user: {
          id: data.User.id,
        },
        amountLimit: data.amountLimit,
        period: data.period,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      const response = await api.put(api_url, budgetData);
      const resData = await response.data;

      if (response.status !== 200) {
        toast("Failed to create budget", {
          description: resData.error || "Something went wrong.",
        });
        return;
      }
      toast("Budget edited successfully!", {
        description: "Your budget has been edited.",
      });

      form.reset({
        Category: {
          id: "",
          name: "",
        },
        User: { id: user.id || "" },
        amountLimit: 0,
        period: Period.Monthly,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error:", error);
      toast("Error", {
        description: "Failed to create budget. Please try again.",
      });
    } finally {
      setLoader(false);
      setOpenEditDialog(false);

      if (user_id) {
        setLoading(true);
        fetchBudgets({ userId: user_id })
          .then((data) => {
            const formatted: Budget[] = data.map((b: any) => ({
              id: b.id,
              category: {
                id: b.category.id,
                name: b.category.name,
              } as categorySkeleton,
              period: b.period,
              amountLimit: b.amountLimit,
              spent: b.amountSpent,
              startDate: b.startDate,
              endDate: b.endDate,
            }));

            setBudgets(formatted);
          })
          .catch((error) =>
            toast("Error fetching budgets", { description: String(error) }),
          )
          .finally(() => setLoading(false));
      }
    }
  }

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setOpenEditDialog(true);
    form.reset({
      Category: {
        id: budget.category.id,
        name: budget.category.name,
      },
      User: { id: user.id },
      amountLimit: budget.amountLimit,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
    });
  };

  const activeBudgets = budgets.filter(isActiveBudget);

  const symbol = user?.currency ? currencyMapper(user.currency) : "$";
  const totalLimit = activeBudgets.reduce(
    (sum, b) => sum + Number(b.amountLimit || 0),
    0,
  );
  const totalSpent = activeBudgets.reduce(
    (sum, b) => sum + Number(b.spent || 0),
    0,
  );
  const overBudgetCount = activeBudgets.filter(
    (b) =>
      Number(b.amountLimit) > 0 &&
      Number(b.spent) / Number(b.amountLimit) >= 1,
  ).length;
  const healthyCount = activeBudgets.filter(
    (b) =>
      Number(b.amountLimit) > 0 &&
      Number(b.spent) / Number(b.amountLimit) < 0.75,
  ).length;
  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div className="w-full space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Planning
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Budgets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set limits, track spending, stay in control.
          </p>
        </div>
        <Link href="/budget/add">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Budget</span>
          </Button>
        </Link>
      </div>

      {/* ── Summary Stats Bar ── */}
      {!loading && activeBudgets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Active Budgets",
              value: activeBudgets.length.toString(),
              icon: Wallet,
              accent: "var(--primary)",
              bg: "rgba(var(--primary-rgb, 34,197,94), 0.08)",
            },
            {
              label: "Total Budget",
              value: `${symbol}${fmt(totalLimit)}`,
              icon: PiggyBank,
              accent: "#6366f1",
              bg: "rgba(99,102,241,0.08)",
            },
            {
              label: "Total Spent",
              value: `${symbol}${fmt(totalSpent)}`,
              icon: TrendingUp,
              accent: "#f59e0b",
              bg: "rgba(245,158,11,0.08)",
            },
            {
              label: overBudgetCount > 0 ? "Over Budget" : "Healthy",
              value:
                overBudgetCount > 0
                  ? `${overBudgetCount} budget${overBudgetCount > 1 ? "s" : ""}`
                  : `${healthyCount} budget${healthyCount !== 1 ? "s" : ""}`,
              icon: overBudgetCount > 0 ? AlertTriangle : CheckCircle2,
              accent: overBudgetCount > 0 ? "#ef4444" : "#22c55e",
              bg:
                overBudgetCount > 0
                  ? "rgba(239,68,68,0.08)"
                  : "rgba(34,197,94,0.08)",
            },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div
              key={label}
              className="rounded-2xl border border-border/60 bg-card p-4 flex items-center gap-3
                transition-all duration-200 hover:shadow-md hover:border-border"
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: bg }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide truncate">
                  {label}
                </p>
                <p className="text-base font-bold text-foreground tabular-nums truncate">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {budgetToDelete && (
        <AlertDialog
          open={!!budgetToDelete}
          onOpenChange={(open) => !open && setBudgetToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The budget for{" "}
                <strong>{budgetToDelete.category.name}</strong> will be
                permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete(budgetToDelete);
                  setBudgetToDelete(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ── Budget Cards Grid ── */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[260px] w-full rounded-2xl" />
            ))}
          </div>
        ) : activeBudgets.length === 0 ? (
          <div
            className="flex min-h-[280px] flex-col items-center justify-center gap-4
              rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 text-center"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.08)" }}
            >
              <PiggyBank className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">
                No active budgets
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Create a budget to start tracking your spending limits.
              </p>
            </div>
            <Link href="/budget/add">
              <Button variant="outline" size="sm" className="gap-2 mt-1">
                <Plus className="h-4 w-4" />
                Create your first budget
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                currency={user?.currency}
                onEdit={handleEdit}
                onDelete={setBudgetToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Budget Dialog ── */}
      {openEditDialog && budgetToEdit && (
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="max-h-[90vh] sm:max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>
                Update the limit and period for{" "}
                <strong>{budgetToEdit.category.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Category (read-only) */}
                <FormField
                  control={form.control}
                  name="Category.id"
                  disabled={true}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full" disabled>
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

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amountLimit"
                  defaultValue={form.getValues("amountLimit")}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Amount Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter budget amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Period */}
                <FormField
                  control={form.control}
                  name="period"
                  defaultValue={budgetToEdit.period}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Timeframe</FormLabel>
                      <FormControl>
                        <Tabs
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value as Period)
                          }
                        >
                          <TabsList>
                            <TabsTrigger value={Period.Weekly}>
                              Weekly
                            </TabsTrigger>
                            <TabsTrigger value={Period.Monthly}>
                              Monthly
                            </TabsTrigger>
                            <TabsTrigger value={Period.Yearly}>
                              Yearly
                            </TabsTrigger>
                            <TabsTrigger value={Period.Custom}>
                              Custom
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </FormControl>
                      <FormDescription>
                        Select the timeframe for the budget
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={watchPeriod !== Period.Custom}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={watchPeriod !== Period.Custom}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6 max-sm:flex-row w-full justify-end">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button className="ml-2" type="submit" disabled={loader}>
                    {loader && <Spinner />}
                    {loader ? "" : "Update"}
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
