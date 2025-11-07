"use client";
import { API_URL } from "@/config/config";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { currencyMapper } from "@/utils/currencyMapper";
import deleteIcon from "@/assets/icon/delete.png";
import deleteIconWhite from "@/assets/icon/delete-white.png";
import editIcon from "@/assets/icon/edit.png";
import editIconWhite from "@/assets/icon/edit-white.png";
import Image from "next/image";
import PopUp from "@/components/pop-up";
import { togglePopUp } from "@/redux/slices/sidebarSlice";
import filterIcon from "@/assets/icon/filter.png";
import filterIconWhite from "@/assets/icon/filter-white.png";
import DropDown from "@/components/drop-down";
import DownloadFile from "@/assets/icon/download-file.png";
import DownloadFileWhite from "@/assets/icon/download-file-white.png";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

interface ExpenseListProps {
  expenses: Expense[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
}

const table_data_classname = "px-1 py-3 sm:px-4 sm:py-3";
const table_data_loading = "bg-gray-200 dark:bg-gray-500 rounded animate-pulse";

export default function Expense({ isDemo }: { isDemo?: boolean }) {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const token = FetchToken();
  const isExpenseMounted = useRef(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [expensesList, setExpensesList] = useState<ExpenseListProps>({
    expenses: [],
    totalPages: 0,
    totalElements: 0,
    pageNumber: 1,
  });
  const [query, setQuery] = useState("");

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
    const urlBuilder = new URL(
      `${API_URL}/expenses/user/${user.id}/fetch-with-conditions`
    );
    urlBuilder.searchParams.append("order", order);
    if (fromDate) urlBuilder.searchParams.append("start_date", fromDate);
    if (toDate) urlBuilder.searchParams.append("end_date", toDate);
    if (category) urlBuilder.searchParams.append("category_id", category);
    if (q) urlBuilder.searchParams.append("q", q);
    urlBuilder.searchParams.append("page", String(page));
    urlBuilder.searchParams.append("limit", String(limit));

    try {
      setLoading(true);
      const response = await fetch(urlBuilder.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();

      if (page > data.totalPages && data.totalPages > 0) {
        fetchExpenses({
          fromDate,
          toDate,
          category,
          order,
          page: data.totalPages,
          limit,
        });
        setPageNumber(data.totalPages);
        setExpensesList({
          ...expensesList,
          totalPages: data.totalPages,
          pageNumber: data.totalPages,
        });
        return; // Exit current call
      }

      setExpensesList({
        expenses: data.expenses,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        pageNumber: data.pageNumber,
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch for expenses
  useEffect(() => {
    if (!isExpenseMounted.current) {
      isExpenseMounted.current = true;
      fetchExpenses({
        fromDate: "",
        toDate: "",
        category: "",
        order: "desc",
        limit: isDemo ? 5 : 10,
      });
    }
  }, []);

  return (
    <div className={`flex flex-col w-full h-full flex-grow overflow-hidden`}>
      <ExpenseList
        expensesList={expensesList}
        setExpensesList={setExpensesList}
        showTable={expensesList.expenses.length > 0}
        fetchExpenses={fetchExpenses}
        categories={categories.categories}
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
        setLoading={setLoading}
        loading={loading}
        isDemo={isDemo ? true : false}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
}

function ExpenseList({
  expensesList,
  setExpensesList,
  showTable,
  fetchExpenses,
  categories,
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
  setLoading,
  loading = false,
  isDemo = false,
  query = "",
  setQuery,
}: {
  expensesList: ExpenseListProps;
  setExpensesList: React.Dispatch<React.SetStateAction<ExpenseListProps>>;
  showTable: boolean;
  fetchExpenses: ({
    fromDate,
    toDate,
    category,
    order,
    page,
    q,
  }: {
    fromDate: string;
    toDate: string;
    category: string;
    order: "asc" | "desc";
    page?: number;
    q?: string;
  }) => void;
  categories: {
    id: string;
    type: string;
    name: string;
  }[];

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
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  isDemo?: boolean;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const popUp = useSelector((state: RootState) => state.sidebar.popUpEnabled);
  const dispatch = useDispatch();
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
        fromDate: fromDateFilter
          ? new Date(fromDateFilter).toISOString().slice(0, 16)
          : "",
        toDate: toDateFilter
          ? new Date(toDateFilter).toISOString().slice(0, 16)
          : "",
        category: categoryFilter || "",
        order: "desc",
      });
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setLoading(false);
      setSelectedExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses({
      q: query,
      fromDate: fromDateFilter
        ? new Date(fromDateFilter).toISOString().slice(0, 16)
        : "",
      toDate: toDateFilter
        ? new Date(toDateFilter).toISOString().slice(0, 16)
        : "",
      category: categoryFilter || "",
      order: "desc",
    });
  }, [query, fromDateFilter, toDateFilter, categoryFilter]);

  const handleFileDownload = async () => {
    try {
      const link = new URL(`${API_URL}/expenses/user/${user.id}/export`);
      if (fromDateFilter) {
        const fromDate = new Date(fromDateFilter).toISOString().slice(0, 16);
        link.searchParams.append("start_date", fromDate);
      }
      if (toDateFilter) {
        const toDate = new Date(toDateFilter).toISOString().slice(0, 16);
        link.searchParams.append("end_date", toDate);
      }

      const response = await fetch(link.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const file_name =
        `expenses` +
        `${
          fromDateFilter
            ? `_from_${new Date(fromDateFilter).toISOString().slice(0, 10)}`
            : ""
        }` +
        `${
          toDateFilter
            ? `_till_${new Date(toDateFilter).toISOString().slice(0, 10)}`
            : ""
        }`;
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
    <div className="flex flex-col w-full h-full flex-grow overflow-hidden min-w-[330px]">
      <div
        className={`flex flex-col sm:flex-row w-full sm:justify-between sm:items-center ${
          !isDemo ? "mb-6" : ""
        }
          max-sm:space-y-4`}
      >
        {!isDemo && (
          <h1 className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-200">
            Recent Transactions
          </h1>
        )}
        {!isDemo && (
          <div className="flex items-center max-sm:justify-between">
            <div
              className="flex items-center relative border border-gray-500 dark:border-none rounded-md 
            active:border-none focus:border-none"
            >
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-7"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex">
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
                    src={user.theme === "light" ? deleteIcon : deleteIconWhite}
                    alt="Delete"
                    className=" w-6 h-6"
                  />
                </button>
              )}

              <Image
                src={user.theme === "light" ? filterIcon : filterIconWhite}
                alt="Filter"
                className="w-6 h-6 cursor-pointer ml-4"
                onClick={() => setFilter(!filter)}
              />

              <Image
                src={user.theme === "light" ? DownloadFile : DownloadFileWhite}
                alt="Download"
                className="w-6 h-6 cursor-pointer ml-4"
                onClick={handleFileDownload}
              />
            </div>
          </div>
        )}
      </div>
      {filter && (
        <div
          className="gap-6 sm:gap-3 md:gap-4 mb-6
          grid sm:grid-cols-3
          md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7
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
            classname="bg-white dark:bg-gray-900 w-full text-sm px-2 max-sm:py-2"
          />
          <div className="w-full">
            <DatePicker
              selected={fromDateFilter ? new Date(fromDateFilter) : null}
              onChange={(date) => {
                setFromDate(date ? date.toISOString().slice(0, 16) : "");
                fetchExpenses({
                  fromDate: date ? date.toISOString().slice(0, 16) : "",
                  toDate:
                    toDateFilter !== ""
                      ? new Date(toDateFilter).toISOString().slice(0, 16)
                      : "",
                  category: categoryFilter || "",
                  order: "desc",
                });
              }}
              selectsStart
              startDate={fromDateFilter ? new Date(fromDateFilter) : null}
              endDate={toDateFilter ? new Date(toDateFilter) : null}
              dateFormat="yyyy-MM-dd"
              className="p-2 rounded cursor-pointer
              w-full h-full bg-white dark:bg-gray-900
              outline-none shadow-md dark:outline dark:border dark:border-gray-400
              text-sm"
              placeholderText="From"
              maxDate={toDateFilter ? new Date(toDateFilter) : new Date()}
              wrapperClassName="w-full h-full"
            />
          </div>
          <div className="w-full">
            <DatePicker
              selected={toDateFilter ? new Date(toDateFilter) : null}
              onChange={(date) => {
                setToDate(date ? date.toISOString().slice(0, 16) : "");
                fetchExpenses({
                  fromDate: fromDateFilter
                    ? new Date(fromDateFilter).toISOString().slice(0, 16)
                    : "",
                  toDate: date ? date.toISOString().slice(0, 16) : "",
                  category: categoryFilter || "",
                  order: "desc",
                });
              }}
              selectsEnd
              startDate={fromDateFilter ? new Date(fromDateFilter) : null}
              endDate={toDateFilter ? new Date(toDateFilter) : null}
              dateFormat="yyyy-MM-dd"
              className="p-2 rounded cursor-pointer
              w-full h-full bg-white dark:bg-gray-900
              outline-none shadow-md dark:outline dark:border dark:border-gray-400
              text-sm"
              placeholderText="To"
              minDate={fromDateFilter ? new Date(fromDateFilter) : undefined}
              wrapperClassName="w-full h-full"
            />
          </div>

          <div className="max-sm:w-full">
            <button
              className="button-blue px-2 py-1 w-full h-full text-md"
              onClick={() => {
                // setFilter(false);
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

      <div className="flex-grow overflow-auto">
        <table
          className="w-full h-full layout-fixed border border-gray-200 dark:border-gray-700
          shadow-lg rounded-lg text-xs sm:text-sm border-collapse divide-y bg-white dark:bg-gray-900
          divide-gray-200 dark:divide-gray-700"
        >
          <thead
            className="text-gray-700 uppercase tracking-wider
             dark:text-gray-200"
          >
            <tr className="text-left font-semibold first:rounded-tl-lg last:rounded-tr-lg">
              {!isDemo && (
                <th className={`${table_data_classname} w-1/13`}>#</th>
              )}
              <th className={`${table_data_classname} w-3/13`}>Category</th>
              <th className={`${table_data_classname} w-2/13`}>Amount</th>
              <th className={`${table_data_classname} w-4/13`}>Description</th>
              <th className={`${table_data_classname} w-3/13`}>Date</th>
            </tr>
          </thead>
          {(!showTable || loading) && (
            <tbody
              className="bg-white divide-y 
              dark:bg-gray-900 dark:text-gray-200 dark:divide-gray-700"
            >
              {!loading && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <p className="text-gray-500">
                      {loading ? "Loading..." : "No expenses found"}
                    </p>
                  </td>
                </tr>
              )}
              {loading && (
                <>
                  {[...Array(10)].map((_, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 py-3 dark:hover:bg-gray-950 
                      transition-colors cursor-pointer"
                    >
                      <td className={table_data_classname}>
                        <div className={`h-4 w-4 ${table_data_loading}`}></div>
                      </td>
                      <td className={table_data_classname}>
                        <div className={`h-4 w-20 ${table_data_loading}`}></div>
                      </td>
                      <td className={table_data_classname}>
                        <div className={`h-4 w-14 ${table_data_loading}`}></div>
                      </td>
                      <td className={table_data_classname}>
                        <div
                          className={`h-4 w-full ${table_data_loading}`}
                        ></div>
                      </td>
                      <td className={table_data_classname}>
                        <div className={`h-4 w-24 ${table_data_loading}`}></div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          )}
          {showTable && !loading && (
            <tbody
              className="dark:text-gray-200 divide-y last:rounded-bl-lg last:rounded-br-lg
                 dark:divide-gray-700 "
            >
              {expensesList.expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-gray-100 py-3 dark:hover:bg-gray-950 
                  transition-colors relative group
                  "
                >
                  {!isDemo && (
                    <td className={table_data_classname}>
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        disabled={loading}
                        checked={selectedExpenses.some(
                          (e) => e.id === expense.id
                        )}
                        onChange={() => {
                          const isSelected = selectedExpenses.some(
                            (e) => e.id === expense.id
                          );
                          if (isSelected) {
                            setSelectedExpenses(
                              selectedExpenses.filter(
                                (e) => e.id !== expense.id
                              )
                            );
                          } else {
                            setSelectedExpenses([...selectedExpenses, expense]);
                          }
                        }}
                      />
                    </td>
                  )}
                  <td
                    className={table_data_classname}
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setSelectedExpenses([expense]);
                        dispatch(togglePopUp());
                        return;
                      }
                    }}
                  >
                    {expense.categoryName}
                  </td>
                  <td
                    className={`${table_data_classname} font-medium text-green-600`}
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setSelectedExpenses([expense]);
                        dispatch(togglePopUp());
                        return;
                      }
                    }}
                  >
                    {`${currencyMapper(
                      expense?.currency || "USD"
                    )}${expense.amount.toFixed(2)}`}
                  </td>
                  <td
                    className={table_data_classname}
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setSelectedExpenses([expense]);
                        dispatch(togglePopUp());
                        return;
                      }
                    }}
                  >
                    {expense.description}
                  </td>
                  <td className={`${table_data_classname} text-gray-500`}>
                    {new Date(expense.expenseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {!isDemo && (
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
                  )}
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
                  onChange={(e) => {
                    setSelectedExpenses([
                      {
                        ...selectedExpenses[0],
                        category: {
                          id: e.target.value,
                          name:
                            categories.find((cat) => cat.id === e.target.value)
                              ?.name || "",
                        },
                        categoryId: e.target.value,
                        categoryName:
                          categories.find((cat) => cat.id === e.target.value)
                            ?.name || "",
                      },
                    ]);
                  }}
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
      {!isDemo && (
        <div
          className="shrink-0 flex justify-center items-center text-xs sm:text-sm 
       py-4"
        >
          <div className="flex items-center space-x-2 justify-center">
            <button
              className={`px-2 py-1 rounded dark:text-gray-200 border border-gray-700 dark:border-gray-700 
               ${
                 pageNumber <= 1
                   ? "cursor-not-allowed opacity-30"
                   : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
               }`}
              disabled={pageNumber <= 1}
              onClick={() => {
                setPageNumber(1);
                fetchExpenses({
                  fromDate: fromDateFilter
                    ? new Date(fromDateFilter).toISOString().slice(0, 16)
                    : "",
                  toDate: toDateFilter
                    ? new Date(toDateFilter).toISOString().slice(0, 16)
                    : "",
                  category: categoryFilter || "",
                  order: "desc",
                  page: 1,
                });
              }}
            >
              {`<<`}
            </button>
            <button
              className={`px-3 py-1 rounded dark:text-gray-200 border border-gray-700 dark:border-gray-700 
               ${
                 pageNumber <= 1
                   ? "cursor-not-allowed opacity-30"
                   : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
               }`}
              disabled={pageNumber <= 1}
              onClick={() => {
                const newPageNumber = Math.max(pageNumber - 1, 1);
                setPageNumber(newPageNumber);
                fetchExpenses({
                  fromDate: fromDateFilter
                    ? new Date(fromDateFilter).toISOString().slice(0, 16)
                    : "",
                  toDate: toDateFilter
                    ? new Date(toDateFilter).toISOString().slice(0, 16)
                    : "",
                  category: categoryFilter || "",
                  order: "desc",
                  page: newPageNumber,
                });
              }}
            >
              {`<`}
            </button>
            <span className="px-4 text-gray-600 dark:text-gray-300">
              Page {pageNumber} of {expensesList.totalPages || 1}
            </span>
            <button
              className={`px-3 py-1 rounded dark:text-gray-200 border border-gray-700 dark:border-gray-700 
               ${
                 expensesList.pageNumber >= expensesList.totalPages
                   ? "cursor-not-allowed opacity-30"
                   : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
               }`}
              disabled={expensesList.pageNumber >= expensesList.totalPages} // Disable if less than 10 items
              onClick={() => {
                setPageNumber((prev) => prev + 1);
                fetchExpenses({
                  fromDate: fromDateFilter
                    ? new Date(fromDateFilter).toISOString().slice(0, 16)
                    : "",
                  toDate: toDateFilter
                    ? new Date(toDateFilter).toISOString().slice(0, 16)
                    : "",
                  category: categoryFilter || "",
                  order: "desc",
                  page: pageNumber + 1,
                });
              }}
            >
              {`>`}
            </button>
            <button
              className={`px-2 py-1 rounded dark:text-gray-200 border border-gray-700 dark:border-gray-700 
              
              ${
                expensesList.pageNumber >= expensesList.totalPages
                  ? "cursor-not-allowed opacity-30"
                  : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
              disabled={expensesList.pageNumber >= expensesList.totalPages} // Disable if less than 10 items
              onClick={() => {
                setPageNumber(expensesList.totalPages);
                fetchExpenses({
                  fromDate: fromDateFilter
                    ? new Date(fromDateFilter).toISOString().slice(0, 16)
                    : "",
                  toDate: toDateFilter
                    ? new Date(toDateFilter).toISOString().slice(0, 16)
                    : "",
                  category: categoryFilter || "",
                  order: "desc",
                  page: expensesList.totalPages,
                });
              }}
            >
              {`>>`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
