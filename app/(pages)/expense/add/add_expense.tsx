"use client";
import { useState } from "react";
import { API_URL } from "@/config/config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import DropDown from "@/components/drop-down";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function AddExpensePage() {
  const user = useSelector((state: RootState) => state.user);
  const [error, setError] = useState("");
  const token = FetchToken();
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [expense, setExpense] = useState({
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: 0,
    description: "",
    expenseDate: new Date().toISOString().slice(0, 10), // Default to current date
  });
  const [adding_expense_loading, setAddingExpenseLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!expense.category.id) {
      setError("Please select a category");
      return;
    }
    if (expense.amount === null || expense.amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!expense.description) {
      setError("Please enter a description");
      return;
    }
    if (!expense.expenseDate) {
      setError("Please select a date");
      return;
    }

    setAddingExpenseLoading(true);
    try {
      // convert date to datetime
      const expenseDate = new Date(expense.expenseDate);
      expense.expenseDate = expenseDate.toISOString();

      const response = await fetch(`${API_URL}/expenses/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
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
          : new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setAddingExpenseLoading(false);
      setError("");
    }
  };

  return (
    <div
      className="bg-gray-300 shadow-md rounded-lg p-4 md:p-8 w-full
         flex flex-col items-center justify-center dark:bg-gray-800 dark:text-gray-200"
    >
      <Card className="w-[95%] sm:w-1/2 text-center">
        <CardHeader>
          <CardTitle className="text-xl">Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col space-y-4"
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

            <Input
              type="date"
              value={expense.expenseDate}
              onChange={(e) =>
                setExpense({
                  ...expense,
                  expenseDate: e.target.value,
                })
              }
            />
            <Button
              type="submit"
              disabled={adding_expense_loading}
              variant={"secondary"}
            >
              {adding_expense_loading ? <Spinner /> : "Add Expense"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-80 sm:w-1/2 text-center"></div>
          {error && (
            <div className="text-red-500 mt-2">
              <p>{error}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
