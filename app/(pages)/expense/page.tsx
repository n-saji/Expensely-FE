"use client";
import { API_URL } from "@/config/config";
import { addCategory } from "@/redux/slices/category";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ExpenseList from "./expense_list";

const CategoryTypeExpense = "expense";
interface Category {
  id: string;
  type: string;
  name: string;
}

export default function Expense() {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const dispatch = useDispatch();
  const token = FetchToken();
  const isMounted = useRef(false);
  const [error, setError] = useState("");
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isMounted.current) {
        console.log("Component is already mounted, skipping fetch");
        return;
      }
      isMounted.current = true;
      try {
        const response = await fetch(
          `${API_URL}/categories/user/${user.id}?type=${CategoryTypeExpense}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid categories data");
        }
        data.forEach((category: Category) => {
          const alreadyExists = categories.categories.some(
            (c) => c.id === category.id
          );
          if (!alreadyExists) {
            dispatch(
              addCategory({
                id: category.id,
                type: category.type,
                name: category.name,
              })
            );
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
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
    event.preventDefault();
    setLoading(true);
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
      const data = await response.json();
      console.log("Expense added successfully:", data);
      setExpense({
        user: {
          id: user.id,
        },
        category: {
          id: "",
        },
        amount: NaN,
        description: "",
        expenseDate: new Date().toISOString().slice(0, 16),
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen
   w-full relative"
    >
      <div
        className="bg-gray-300 shadow-md rounded-lg p-4 w-full
         flex flex-col items-center justify-center
     "
      >
        <div className="w-1/2 text-center">
          <h1 className="text-2xl font-semibold">Add New Expense</h1>
          <div className="p-4">
            <form className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Expense Name"
                className="p-2 border border-gray-400 rounded"
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
                <option
                  value=""
                  disabled
                  className="text-gray-400"
                >
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
                disabled={loading}
                onClick={(event) => {
                  handleSubmit(event);
                }}
              >
                {loading ? "Adding..." : "Add Expense"}
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
      <ExpenseList />
    </div>
  );
}
