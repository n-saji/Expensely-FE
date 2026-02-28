"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Label } from "./ui/label";
import RecurringExpenseForm from "@/components/recurring-expense-form";
import { CreateRecurringExpenseReq } from "@/global/dto";

export default function Slidebar() {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [expense, setExpense] = useState({
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: 0,
    description: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });
  const [adding_expense_loading, setAddingExpenseLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!expense.category.id) {
      toast.error("Please select a category");
      return;
    }
    if (expense.amount === null || expense.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!expense.description) {
      toast.error("Please enter a description");
      return;
    }
    if (!expense.expenseDate) {
      toast.error("Please select a date");
      return;
    }

    setAddingExpenseLoading(true);
    try {
      const expenseDate = new Date(expense.expenseDate);
      const payload = {
        ...expense,
        expenseDate:
          expenseDate.toISOString().slice(0, 10) +
          "T" +
          new Date().toTimeString().slice(0, 8) +
          ".000Z",
      };

      const response = await api.post(`/expenses/create`, payload);

      if (response.status !== 200) {
        throw new Error("Failed to add expense");
      }

      setExpense({
        user: {
          id: user.id,
        },
        category: {
          id: "",
        },
        amount: 0,
        description: "",
        expenseDate: new Date().toISOString().slice(0, 10),
      });

      window.dispatchEvent(new Event("expense-added"));
      toast.success("Expense added successfully");
      setSheetOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense", { description: String(error) });
    } finally {
      setAddingExpenseLoading(false);
    }
  };

  const handleRecurringSubmit = async (data: CreateRecurringExpenseReq) => {
    const response = await api.post(`/recurring-expenses/create`, data);

    if (response.status !== 200) {
      throw new Error("Failed to add recurring expense");
    }

    window.dispatchEvent(new Event("recurring-expense-added"));
    setSheetOpen(false);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Plus className="h-3 w-3" />
          <Label className="text-xs">Add Expense</Label>
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
          <SheetDescription>
            Add a new expense to your ledger. You can choose to make it a
            recurring expense or a one-time transaction.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-4 flex flex-col flex-1 h-full">
          <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="recurring-toggle">Recurring expense</Label>
              <p className="text-xs text-muted-foreground">
                Toggle to create a recurring expense that repeats on a regular
                schedule.
              </p>
            </div>
            <Switch
              id="recurring-toggle"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring ? (
            <>
              <RecurringExpenseForm
                submitLabel="Add Recurring Expense"
                onSubmit={handleRecurringSubmit}
              />
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </SheetClose>
            </>
          ) : (
            <form
              className="flex flex-col space-y-4 h-full flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit(event);
              }}
            >
              <div className="flex flex-col space-y-4 flex-1">
                <Label htmlFor="expense-name">Expense Name</Label>
                <Input
                  id="expense-name"
                  type="text"
                  placeholder="Expense Name"
                  value={expense.description}
                  onChange={(e) =>
                    setExpense({
                      ...expense,
                      description: e.target.value,
                    })
                  }
                />
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount"
                  value={expense.amount === 0 ? "" : expense.amount}
                  onChange={(e) =>
                    setExpense({
                      ...expense,
                      amount: Number(e.target.value),
                    })
                  }
                />

                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(option) =>
                    setExpense({
                      ...expense,
                      category: {
                        id: option,
                      },
                    })
                  }
                  value={expense.category.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expense.expenseDate}
                  onChange={(e) =>
                    setExpense({
                      ...expense,
                      expenseDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col space-y-4">
                <Button type="submit" disabled={adding_expense_loading}>
                  {adding_expense_loading ? <Spinner /> : "Add Expense"}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
