"use client";
import { useState } from "react";
import { API_URL } from "@/config/config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import DropDown from "@/components/drop-down";

export default function AddExpensePage() {
  const user = useSelector((state: RootState) => state.user);
  const [error, setError] = useState("");
  const token = FetchToken();
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expense, setExpense] = useState({
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: 0,
    description: "",
    expenseDate: new Date().toISOString().slice(0, 16),
  });
  const [adding_expense_loading, setAddingExpenseLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!expense.category.id) {
      setError("Please select a category");
      return;
    }
    if (expense.amount <= 0) {
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
        expenseDate: new Date().toISOString().slice(0, 16),
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
      <div className="w-80 sm:w-1/2 text-center">
        <h1 className="text-2xl font-semibold">Add New Expense</h1>
        <div className="p-4">
          <form
            className="flex flex-col space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(event);
            }}
          >
            <input
              type="text"
              placeholder="Expense Name"
              className="p-2 border border-gray-400 rounded "
              value={expense.description}
              onChange={(e) =>
                setExpense({
                  ...expense,
                  description: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              className="p-2 border border-gray-400 rounded"
              value={expense.amount}

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
              defaultValue="All Categories"
              selectedOption={categoryFilter}
              onSelect={(option) => {
                const selectedCategory = categories.categories.find(
                  (category) => category.name === option
                );
                setCategoryFilter(selectedCategory ? selectedCategory.id : "");
              }}
              classname="border border-gray-400 rounded p-2 cursor-pointer w-full"
              customButton={
                <button
                  className="button-green-outline px-1.5 py-0"
                  onClick={() => {
                    setCategoryFilter("");
                  }}
                >
                  +
                </button>
              }
            />

            <select
              className="p-2 border border-gray-400 rounded cursor-pointer"
              value={
                categories.categories.find(
                  (cat) => cat.id === expense.category.id
                )?.id || ""
              }
              onChange={(e) =>
                setExpense({
                  ...expense,
                  category: {
                    id: e.target.value,
                  },
                })
              }
            >
              <option value="" disabled className="text-gray-400">
                Select Category
              </option>
              {categories.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              className="p-2 border border-gray-400 rounded"
              value={expense.expenseDate}
              onChange={(e) =>
                setExpense({
                  ...expense,
                  expenseDate: e.target.value,
                })
              }
            />
            <button
              type="submit"
              className="button-green"
              disabled={adding_expense_loading}
            >
              {adding_expense_loading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>
      </div>
      {error && (
        <div className="text-red-500 mt-2">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
