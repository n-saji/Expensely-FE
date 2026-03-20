"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";

import { Category, BudgetReq, Period } from "@/global/dto";
import { CategoryTypeExpense } from "@/global/constants";
import api from "@/lib/api";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface NewUserOnboardingProps {
  userId: string;
  onFirstExpenseCreated: () => Promise<void>;
  onBudgetCreated: () => Promise<void>;
}

interface ExpenseFormState {
  categoryId: string;
  description: string;
  amount: string;
  expenseDate: string;
}

interface BudgetFormState {
  categoryId: string;
  amountLimit: string;
  period: Period;
  startDate: string;
  endDate: string;
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getPeriodBoundaries(period: Period) {
  const start = new Date();
  let startDate = new Date(start);
  let endDate = new Date(start);

  if (period === Period.Weekly) {
    const day = start.getDay();
    startDate.setDate(start.getDate() - day);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (period === Period.Monthly) {
    startDate = new Date(start.getFullYear(), start.getMonth(), 1);
    endDate = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  } else if (period === Period.Yearly) {
    startDate = new Date(start.getFullYear(), 0, 1);
    endDate = new Date(start.getFullYear(), 11, 31);
  }

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

export default function NewUserOnboarding({
  userId,
  onFirstExpenseCreated,
  onBudgetCreated,
}: NewUserOnboardingProps) {
  const expenseCategories = useSelector(
    (state: RootState) => state.categoryExpense.categories,
  );

  const validExpenseCategories = useMemo(
    () => expenseCategories.filter((category) => category.id),
    [expenseCategories],
  );

  const [categoryName, setCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    categoryId: "",
    description: "",
    amount: "",
    expenseDate: getTodayDateString(),
  });

  const defaultBudgetPeriod = Period.Monthly;
  const defaultBudgetRange = getPeriodBoundaries(defaultBudgetPeriod);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [creatingBudget, setCreatingBudget] = useState(false);
  const [loadingBudgetCategories, setLoadingBudgetCategories] = useState(false);
  const [availableBudgetCategories, setAvailableBudgetCategories] = useState<
    Category[]
  >([]);
  const [budgetForm, setBudgetForm] = useState<BudgetFormState>({
    categoryId: "",
    amountLimit: "",
    period: defaultBudgetPeriod,
    startDate: defaultBudgetRange.startDate,
    endDate: defaultBudgetRange.endDate,
  });

  useEffect(() => {
    const range = getPeriodBoundaries(budgetForm.period);
    setBudgetForm((prev) => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  }, [budgetForm.period]);

  useEffect(() => {
    if (!budgetOpen) {
      return;
    }

    const fetchAvailableCategories = async () => {
      try {
        setLoadingBudgetCategories(true);
        const res = await api.get("/budgets/available-categories");

        if (res.status !== 200 || !Array.isArray(res.data)) {
          throw new Error("Failed to load budget categories");
        }

        setAvailableBudgetCategories(res.data as Category[]);
      } catch (error) {
        console.error("Error loading budget categories:", error);
        toast.error("Failed to load budget categories");
      } finally {
        setLoadingBudgetCategories(false);
      }
    };

    fetchAvailableCategories();
  }, [budgetOpen]);

  const handleCreateCategory = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setCreatingCategory(true);

      const response = await api.post("/categories/create", {
        user: { id: userId },
        name: categoryName.trim(),
        type: CategoryTypeExpense,
      });

      if (response.status !== 200) {
        throw new Error("Failed to create category");
      }

      window.dispatchEvent(new Event("category-added"));
      toast.success("Category created");
      setCategoryName("");
      setCategoryOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Could not create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateExpense = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsedAmount = Number.parseFloat(expenseForm.amount);

    if (!expenseForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!expenseForm.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!expenseForm.expenseDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setCreatingExpense(true);

      const expenseDate = new Date(expenseForm.expenseDate);
      const payload = {
        user: { id: userId },
        category: { id: expenseForm.categoryId },
        description: expenseForm.description.trim(),
        amount: parsedAmount,
        expenseDate:
          expenseDate.toISOString().slice(0, 10) +
          "T" +
          new Date().toTimeString().slice(0, 8) +
          ".000Z",
      };

      const response = await api.post("/expenses/create", payload);

      if (response.status !== 200) {
        throw new Error("Failed to add expense");
      }

      toast.success("First expense added");
      setExpenseForm({
        categoryId: "",
        description: "",
        amount: "",
        expenseDate: getTodayDateString(),
      });
      setExpenseOpen(false);

      await onFirstExpenseCreated();
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Could not add expense");
    } finally {
      setCreatingExpense(false);
    }
  };

  const handleCreateBudget = async (event: React.FormEvent) => {
    event.preventDefault();

    const amountLimit = Number.parseFloat(budgetForm.amountLimit);

    if (!budgetForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!Number.isFinite(amountLimit) || amountLimit <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    if (!budgetForm.startDate || !budgetForm.endDate) {
      toast.error("Please provide start and end dates");
      return;
    }

    try {
      setCreatingBudget(true);

      const payload: BudgetReq = {
        category: { id: budgetForm.categoryId },
        user: { id: userId },
        amountLimit,
        period: budgetForm.period,
        startDate: new Date(budgetForm.startDate).toISOString(),
        endDate: new Date(budgetForm.endDate).toISOString(),
      };

      const response = await api.post("/budgets/create", payload);
      if (response.status !== 200) {
        throw new Error("Failed to create budget");
      }

      toast.success("Budget created");
      setBudgetForm((prev) => ({
        ...prev,
        categoryId: "",
        amountLimit: "",
      }));
      setBudgetOpen(false);

      await onBudgetCreated();
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Could not create budget");
    } finally {
      setCreatingBudget(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border-border/70 shadow-sm overflow-hidden bg-gradient-to-br from-background via-background to-emerald-500/5">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            New workspace setup
          </div>
          <CardTitle className="text-2xl md:text-3xl">
            Build your financial dashboard in minutes
          </CardTitle>
          <CardDescription className="text-sm md:text-base max-w-3xl">
            Start by creating an expense category, log your first expense, and
            set a budget limit. Once your first expense is added, the full
            analytics dashboard will open automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">
                Quick setup checklist
              </p>
            </div>
            <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Create expense category
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Add your first expense
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Set a monthly budget
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">Create Category</CardTitle>
                <CardDescription>
                  Add your first expense category to organize transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Create Category</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Expense Category</DialogTitle>
                      <DialogDescription>
                        This creates an expense category that will be available
                        immediately in your add expense form.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleCreateCategory}>
                      <Input
                        value={categoryName}
                        onChange={(event) =>
                          setCategoryName(event.target.value)
                        }
                        placeholder="Example: Groceries"
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={creatingCategory}>
                          {creatingCategory ? <Spinner /> : "Save Category"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">Add First Expense</CardTitle>
                <CardDescription>
                  Log your first expense and unlock analytics automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      disabled={validExpenseCategories.length === 0}
                    >
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add First Expense</DialogTitle>
                      <DialogDescription>
                        Track one real transaction to generate your first
                        dashboard insights.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleCreateExpense}>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Category
                        </p>
                        <Select
                          value={expenseForm.categoryId}
                          onValueChange={(value) =>
                            setExpenseForm((prev) => ({
                              ...prev,
                              categoryId: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {validExpenseCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={expenseForm.description}
                        onChange={(event) =>
                          setExpenseForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Description"
                      />
                      <Input
                        value={expenseForm.amount}
                        onChange={(event) =>
                          setExpenseForm((prev) => ({
                            ...prev,
                            amount: event.target.value,
                          }))
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                      />
                      <Input
                        type="date"
                        value={expenseForm.expenseDate}
                        onChange={(event) =>
                          setExpenseForm((prev) => ({
                            ...prev,
                            expenseDate: event.target.value,
                          }))
                        }
                      />

                      <DialogFooter>
                        <Button type="submit" disabled={creatingExpense}>
                          {creatingExpense ? <Spinner /> : "Save Expense"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                {validExpenseCategories.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Create at least one category before adding your first
                    expense.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">Set Budget</CardTitle>
                <CardDescription>
                  Add a spending limit so you can track budget usage from day
                  one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      Set Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Budget</DialogTitle>
                      <DialogDescription>
                        Choose a category, set a limit, and define a budget
                        period.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleCreateBudget}>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Category
                        </p>
                        <Select
                          value={budgetForm.categoryId}
                          onValueChange={(value) =>
                            setBudgetForm((prev) => ({
                              ...prev,
                              categoryId: value,
                            }))
                          }
                          disabled={loadingBudgetCategories}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                loadingBudgetCategories
                                  ? "Loading categories..."
                                  : "Select category"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBudgetCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        value={budgetForm.amountLimit}
                        onChange={(event) =>
                          setBudgetForm((prev) => ({
                            ...prev,
                            amountLimit: event.target.value,
                          }))
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Budget amount"
                      />

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Period</p>
                        <Select
                          value={budgetForm.period}
                          onValueChange={(value) =>
                            setBudgetForm((prev) => ({
                              ...prev,
                              period: value as Period,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Period.Weekly}>
                              Weekly
                            </SelectItem>
                            <SelectItem value={Period.Monthly}>
                              Monthly
                            </SelectItem>
                            <SelectItem value={Period.Yearly}>
                              Yearly
                            </SelectItem>
                            <SelectItem value={Period.Custom}>
                              Custom
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                          type="date"
                          value={budgetForm.startDate}
                          onChange={(event) =>
                            setBudgetForm((prev) => ({
                              ...prev,
                              startDate: event.target.value,
                            }))
                          }
                        />
                        <Input
                          type="date"
                          value={budgetForm.endDate}
                          onChange={(event) =>
                            setBudgetForm((prev) => ({
                              ...prev,
                              endDate: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={creatingBudget}>
                          {creatingBudget ? <Spinner /> : "Save Budget"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
