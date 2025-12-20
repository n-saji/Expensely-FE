"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DropDown from "@/components/drop-down";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import * as React from "react";
import { ChevronDownIcon, Plus } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import api from "@/lib/api";
import { Label } from "./ui/label";

export default function Slidebar() {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [open, setOpen] = React.useState(false);
  const [expense, setExpense] = useState({
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: 0,
    description: "",
    expenseDate: new Date().toLocaleString().slice(0, 10),
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
      // convert date to datetime
      const expenseDate = new Date(expense.expenseDate);

      expense.expenseDate =
        expenseDate.toISOString().slice(0, 10) +
        "T" +
        new Date().toTimeString().slice(0, 8) +
        ".000Z";

      const response = await api.post(`/expenses/create`, expense);

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
        expenseDate: expense.expenseDate
          ? expense.expenseDate.slice(0, 10)
          : new Date().toLocaleString().slice(0, 10),
      });

      toast.success("Expense added successfully", {});
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setAddingExpenseLoading(false);
    }
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Plus className="h-3 w-3" />{" "}
          <Label className="text-xs">Add Expense</Label>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
          <SheetDescription>Add a new expense to your list</SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col space-y-4 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(event);
          }}
        >
          <Input
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
          <Input
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

          <DropDown
            options={categories.categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            selectedOption={expense.category.id}
            onSelect={(option) => {
              const selectedCategory = categories.categories.find(
                (category) => category.id === option
              );
              setExpense({
                ...expense,
                category: {
                  id: selectedCategory ? selectedCategory.id : "",
                },
              });
            }}
          />

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between text-muted-foreground"
              >
                {expense ? expense.expenseDate : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-full overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={expense ? new Date(expense.expenseDate) : undefined}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setOpen(false);
                  setExpense({
                    ...expense,
                    expenseDate: date ? date.toLocaleString().slice(0, 10) : "",
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        </form>

        <SheetFooter>
          <Button
            type="submit"
            disabled={adding_expense_loading}
            onClick={async (e) => {
              await handleSubmit(e);
              setOpen(false);
            }}
          >
            {adding_expense_loading ? <Spinner /> : "Add Expense"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
