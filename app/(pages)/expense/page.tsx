"use client";
import { API_URL } from "@/config/config";
import { addCategory, removeCategory } from "@/redux/slices/category";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { currencyMapper } from "@/utils/currencyMapper";
import deleteIcon from "@/assets/icon/delete.png";
import editIcon from "@/assets/icon/edit.png";
import editIconWhite from "@/assets/icon/edit-white.png";
import Image from "next/image";
import PopUp from "@/components/pop-up";
import { togglePopUp } from "@/redux/slices/sidebarSlice";
import filterIcon from "@/assets/icon/filter.png";
import filterIconWhite from "@/assets/icon/filter-white.png";
import DropDown from "@/components/drop-down";

const CategoryTypeExpense = "expense";
interface Category {
  id: string;
  type: string;
  name: string;
}

interface Expense {
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

export default function Expense() {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);

  const dispatch = useDispatch();
  const token = FetchToken();
  const isExpenseMounted = useRef(false);
  const isCategoryMounted = useRef(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchExpenses = async ({
    fromDate,
    toDate,
    category,
    order = "desc",
    page = pageNumber,
    limit = 10,
  }: {
    fromDate: string;
    toDate: string;
    category: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => {
    const urlBuilder = new URL(
      `${API_URL}/expenses/user/${user.id}/fetch-with-conditions`
    );
    urlBuilder.searchParams.append("order", order);
    if (fromDate) urlBuilder.searchParams.append("start_date", fromDate);
    if (toDate) urlBuilder.searchParams.append("end_date", toDate);
    if (category) urlBuilder.searchParams.append("category_id", category);
    urlBuilder.searchParams.append("page", String(page));
    urlBuilder.searchParams.append("limit", String(limit));

    try {
      const response = await fetch(urlBuilder.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    if (!isExpenseMounted.current) {
      isExpenseMounted.current = true;
      fetchExpenses({
        fromDate: "",
        toDate: "",
        category: "",
        order: "desc",
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isCategoryMounted.current) {
        console.log("Component is already mounted, skipping fetch");
        return;
      }
      isCategoryMounted.current = true;
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

    dispatch(
      removeCategory({
        id: "",
        type: CategoryTypeExpense,
        name: "",
      })
    );
  }, []);

  return (
    <div className={`flex flex-col items-center w-full`}>
      <ExpenseList
        expenses={expenses}
        setExpenses={setExpenses}
        fetchExpenses={fetchExpenses}
        categories={categories.categories}
        showTable={expenses.length > 0}
        setPageNumber={setPageNumber}
        pageNumber={pageNumber}
        user={user}
        token={token}
        setSelectedExpenses={setSelectedExpenses}
        selectedExpenses={selectedExpenses}
        setFilter={setFilter}
        filter={filter}
        setCategoryFilter={setCategoryFilter}
        categoryFilter={categoryFilter}
        fromDateFilter={fromDate}
        toDateFilter={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />
    </div>
  );
}

function ExpenseList({
  expenses,
  setExpenses,
  fetchExpenses,
  categories,
  showTable = true,
  setPageNumber,
  pageNumber,
  user = {
    id: "",
    email: "",
    name: "",
    theme: "light",
  },
  token = "",
  setSelectedExpenses,
  selectedExpenses = [],
  setFilter,
  filter = false,
  setCategoryFilter,
  categoryFilter = "",
  fromDateFilter = "",
  toDateFilter = "",
  setFromDate,
  setToDate,
}: {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  fetchExpenses: ({
    fromDate,
    toDate,
    category,
    order,
    page,
  }: {
    fromDate: string;
    toDate: string;
    category: string;
    order: "asc" | "desc";
    page?: number;
  }) => void;
  categories: {
    id: string;
    type: string;
    name: string;
  }[];
  showTable: boolean;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  pageNumber: number;
  user: {
    id: string;
    email: string;
    name: string;
    theme: string;
  };
  token: string | null;
  setSelectedExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  selectedExpenses: Expense[];
  setFilter: React.Dispatch<React.SetStateAction<boolean>>;
  filter: boolean;
  setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  categoryFilter: string;
  fromDateFilter: string;
  toDateFilter: string;
  setFromDate: React.Dispatch<React.SetStateAction<string>>;
  setToDate: React.Dispatch<React.SetStateAction<string>>;
}) {
  const popUp = useSelector((state: RootState) => state.sidebar.popUpEnabled);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && popUp) {
        dispatch(togglePopUp());
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, popUp]);

  const handleBulkDelete = async () => {
    if (selectedExpenses.length === 0) {
      console.warn("No expenses selected for deletion");
      return;
    }
    if (!token) {
      console.error("No token found for authentication");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/expenses/user/${user.id}/bulk-delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedExpenses.map((id) => ({ id: id.id }))),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete expenses");
      }

      setExpenses(
        expenses.filter((expense) => !selectedExpenses.includes(expense))
      );
      setSelectedExpenses([]);
    } catch (error) {
      console.error("Error deleting expenses:", error);
    } finally {
      setLoading(false);
      fetchExpenses({
        fromDate: "",
        toDate: "",
        category: categoryFilter || "",
        order: "desc",
      });
    }
  };

  const handleUpdateExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) {
      console.warn("Update already in progress");
      return;
    }
    setLoading(true);
    if (selectedExpenses.length !== 1) {
      console.warn("Please select exactly one expense to update");
      return;
    }
    if (!selectedExpenses.length) return alert("Select one expense to edit.");

    const expenseToUpdate = selectedExpenses[0];

    if (!token) {
      console.error("No token found for authentication");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/expenses/update/${expenseToUpdate.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(expenseToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      fetchExpenses({
        fromDate: "",
        toDate: "",
        category: "",
        order: "desc",
      });
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setLoading(false);
      setSelectedExpenses([]);
    }
  };

  return (
    <div className="block w-full">
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-200">
          Recent Transactions
        </h1>
        <div>
          {selectedExpenses.length > 0 && (
            <button
              className={`ml-4 ${
                selectedExpenses.length === 0
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={selectedExpenses.length === 0}
              onClick={handleBulkDelete}
            >
              <Image
                src={deleteIcon}
                alt="Delete"
                className="inline-block w-6 h-6"
              />
            </button>
          )}
          <Image
            src={user.theme === "light" ? filterIcon : filterIconWhite}
            alt="Filter"
            className="inline-block w-6 h-6 cursor-pointer ml-4"
            onClick={() => setFilter(!filter)}
          />
        </div>
      </div>
      {filter && (
        <div
          className="mb-4 sm:flex sm:flex-row sm:items-center gap-2
          max-sm:grid
          max-sm:grid-cols-2 
        "
        >
          <DropDown
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            defaultValue="All Categories"
            selectedOption={categoryFilter}
            onSelect={(option) => {
              const selectedCategory = categories.find(
                (category) => category.id === option
              );
              setCategoryFilter(selectedCategory ? selectedCategory.id : "");
              fetchExpenses({
                fromDate: fromDateFilter
                  ? new Date(fromDateFilter).toISOString().slice(0, 16)
                  : "",
                toDate: toDateFilter
                  ? new Date(toDateFilter).toISOString().slice(0, 16)
                  : "",
                category: selectedCategory ? selectedCategory.id : "",
                order: "desc",
              });
            }}
            classname="bg-white dark:bg-gray-800 max-sm:w-full"
          />
          <div className="max-sm:w-full">
            <input
              type="date"
              className="p-2 border border-gray-400 rounded cursor-pointer w-full"
              onChange={(e) => {
                setFromDate(e.target.value);
                fetchExpenses({
                  fromDate: new Date(e.target.value).toISOString().slice(0, 16),
                  toDate:
                    toDateFilter !== ""
                      ? new Date(toDateFilter).toISOString().slice(0, 16)
                      : "",
                  category: categoryFilter || "",
                  order: "desc",
                });
              }}
            />
          </div>
          <div className="max-sm:w-full">
            <input
              type="date"
              className="p-2 border border-gray-400 rounded cursor-pointer w-full"
              onChange={(e) => {
                fetchExpenses({
                  fromDate:
                    fromDateFilter !== ""
                      ? new Date(fromDateFilter).toISOString().slice(0, 16)
                      : "",
                  toDate: new Date(e.target.value).toISOString().slice(0, 16),
                  category: categoryFilter || "",
                  order: "desc",
                });
                setToDate(e.target.value);
              }}
            />
          </div>

          <div className="max-sm:w-full">
            <button
              className="button-blue px-1 py-2 w-full"
              onClick={() => {
                setFilter(false);
                setFromDate("");
                setToDate("");
                setCategoryFilter("");
                fetchExpenses({
                  fromDate: "",
                  toDate: "",
                  category: "",
                  order: "desc",
                });
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full divide-y shadow-lg rounded-lg overflow-hidden dark:divide-gray-700 ">
          {/* divide-gray-300 */}
          <thead
            className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider
            dark:bg-gray-800 dark:text-gray-200"
          >
            <tr className="text-left">
              <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold ">#</th>
              <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold ">
                Category
              </th>
              <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold ">
                Amount
              </th>
              <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold ">
                Description
              </th>
              <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold ">Date</th>
            </tr>
          </thead>
          {!showTable && (
            <tbody
              className="bg-white divide-y  text-sm
              dark:bg-gray-900 dark:text-gray-200 dark:divide-gray-700"
            >
              {/* divide-gray-200 */}
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <p className="text-gray-500">No expenses found</p>
                </td>
              </tr>
            </tbody>
          )}
          {showTable && (
            <tbody
              className="bg-white divide-y divide-gray-200 text-sm
              dark:bg-gray-900 dark:text-gray-200
              dark:divide-gray-700"
            >
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-gray-100 py-3 group relative dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setSelectedExpenses([expense]);
                      dispatch(togglePopUp());
                      return;
                    }
                  }}
                >
                  <td className="px-1 py-3 sm:px-4 sm:py-3">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={selectedExpenses.some(
                        (e) => e.id === expense.id
                      )}
                      onChange={() => {
                        const isSelected = selectedExpenses.some(
                          (e) => e.id === expense.id
                        );
                        if (isSelected) {
                          setSelectedExpenses(
                            selectedExpenses.filter((e) => e.id !== expense.id)
                          );
                        } else {
                          setSelectedExpenses([...selectedExpenses, expense]);
                        }
                      }}
                    />
                  </td>
                  <td className="px-1 py-3 sm:px-4 sm:py-3">
                    {expense.categoryName}
                  </td>
                  <td className="px-1 py-3 sm:px-4 sm:py-3 font-medium text-green-600">
                    {`${currencyMapper(
                      expense?.currency || "USD"
                    )}${expense.amount.toFixed(2)}`}
                  </td>
                  <td className="px-1 py-3 sm:px-4 sm:py-3">
                    {expense.description}
                  </td>
                  <td className="px-1 py-3 sm:px-4 sm:py-3 text-gray-500">
                    {new Date(expense.expenseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Image
                      src={user.theme === "light" ? editIcon : editIconWhite}
                      alt="Edit"
                      className="w-4 h-4"
                      onClick={() => {
                        setSelectedExpenses([expense]);
                        dispatch(togglePopUp());
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {popUp && (
          <PopUp title="Edit Expense" showButton={false}>
            <div className="p-4">
              <form
                className="flex flex-col space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await handleUpdateExpense(event);
                  dispatch(togglePopUp());
                  fetchExpenses({
                    fromDate: "",
                    toDate: "",
                    category: "",
                    order: "desc",
                  });
                }}
              >
                <input
                  type="text"
                  placeholder="Expense Name"
                  className="p-2 border border-gray-400 rounded"
                  value={selectedExpenses[0]?.description}
                  onChange={(e) =>
                    setSelectedExpenses([
                      {
                        ...selectedExpenses[0],
                        description: e.target.value,
                      },
                    ])
                  }
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="p-2 border border-gray-400 rounded"
                  value={selectedExpenses[0]?.amount}
                  onChange={(e) =>
                    setSelectedExpenses([
                      {
                        ...selectedExpenses[0],
                        amount: Number(e.target.value),
                      },
                    ])
                  }
                />

                <select
                  className="p-2 border border-gray-400 rounded cursor-pointer"
                  value={
                    categories.find(
                      (cat) => cat.id === selectedExpenses[0]?.categoryId
                    )?.id || ""
                  }
                  onChange={(e) =>
                    setSelectedExpenses([
                      {
                        ...selectedExpenses[0],
                        categoryId: e.target.value,
                      },
                    ])
                  }
                >
                  <option value="" disabled className="text-gray-400">
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  className="p-2 border border-gray-400 rounded"
                  value={selectedExpenses[0]?.expenseDate}
                  onChange={(e) =>
                    setSelectedExpenses([
                      {
                        ...selectedExpenses[0],
                        expenseDate: e.target.value,
                      },
                    ])
                  }
                />
                <button type="submit" className="button-green">
                  Save Changes
                </button>
              </form>
            </div>
          </PopUp>
        )}
      </div>
      <div className="flex justify-between items-center py-4 w-full">
        <div className="flex items-center space-x-2 w-full justify-center">
          <button
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-l dark:text-gray-200 ${
              pageNumber <= 1
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
            disabled={pageNumber <= 1}
            aria-disabled={pageNumber <= 1}
            onClick={() => {
              setPageNumber((prev) => Math.max(prev - 1, 1));
              fetchExpenses({
                fromDate: fromDateFilter
                  ? new Date(fromDateFilter).toISOString().slice(0, 16)
                  : "",
                toDate: toDateFilter
                  ? new Date(toDateFilter).toISOString().slice(0, 16)
                  : "",
                category: "",
                order: "desc",
                page: Math.max(pageNumber - 1, 1),
              });
            }}
          >
            {`< Prev`}
          </button>
          <span className="px-4">Page {pageNumber}</span>
          <button
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-r dark:text-gray-200 ${
              expenses.length < 10
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
            disabled={expenses.length < 10} // Disable if less than 10 items
            aria-disabled={expenses.length < 10}
            onClick={() => {
              setPageNumber((prev) => prev + 1);
              fetchExpenses({
                fromDate: fromDateFilter
                  ? new Date(fromDateFilter).toISOString().slice(0, 16)
                  : "",
                toDate: toDateFilter
                  ? new Date(toDateFilter).toISOString().slice(0, 16)
                  : "",
                category: "",
                order: "desc",
                page: pageNumber + 1,
              });
            }}
          >
            {`Next >`}
          </button>
        </div>
      </div>
    </div>
  );
}
