/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import FetchToken, { FetchUserId } from "@/utils/fetch_token";
import { columns, Budget } from "./columns";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
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
  const token = FetchToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/budgets/user/${userId}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch budgets");
  }
  return res.json();
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
  const token = localStorage.getItem("token");
  const categories = useSelector((state: RootState) => state.categoryExpense);

  useEffect(() => {
    const userId = FetchUserId();
    const token = FetchToken();

    if (!userId || !token) {
      toast("User not found", { description: "Please log in again." });
      setLoading(false);
      return;
    }

    async function loadBudgets() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/budgets/user/${userId}`,
          {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch budgets");
        }

        const data = await res.json();
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/budgets/${budget.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse response:", e);
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete budget");
      }
      // Remove deleted budget from state
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
      newStart.setDate(start.getDate() - day); // Sunday
      newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + 6); // Saturday
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
      const api_url =
        process.env.NEXT_PUBLIC_API_URL + "/budgets/" + budgetToEdit?.id;
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
      const response = await fetch(api_url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      });
      const resData = await response.json();

      if (!response.ok) {
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

      // Refresh budgets list
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
            toast("Error fetching budgets", { description: String(error) })
          )
          .finally(() => setLoading(false));
      }
    }
  }

  const tableColumns = columns(user?.currency).map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: any) => {
          const budget: Budget = row.original;
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
                    // handleEdit(budget);
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
                  }}
                >
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setBudgetToDelete(budget)}
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

  return (
    <div className="block w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-200">
        All Categories
      </h1>
      {budgetToDelete && (
        <AlertDialog
          open={!!budgetToDelete}
          onOpenChange={(open) => !open && setBudgetToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                budget <strong>{budgetToDelete.category.name}</strong>.
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
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {loading ? (
        <div className="w-full space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <DataTable columns={tableColumns} data={budgets} />
      )}
      {openEditDialog && budgetToEdit && (
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="max-h-[90vh] sm:max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>
                Make changes to your budget.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Category */}
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
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter budget amount"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the amount for the budget
                      </FormDescription>
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
                      <FormDescription>
                        Select the start date for the budget
                      </FormDescription>
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
                          className=""
                        />
                      </FormControl>
                      <FormDescription>
                        Select the end date for the budget
                      </FormDescription>
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
