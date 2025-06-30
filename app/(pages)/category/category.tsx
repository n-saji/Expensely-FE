"use client";
import { API_URL } from "@/config/config";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import editIcon from "@/assets/icon/edit.png";
import editIconWhite from "@/assets/icon/edit-white.png";
import Image from "next/image";
import PopUp from "@/components/pop-up";
import { togglePopUp } from "@/redux/slices/sidebarSlice";
import filterIcon from "@/assets/icon/filter.png";
import filterIconWhite from "@/assets/icon/filter-white.png";
import DropDown from "@/components/drop-down";
import { categoryTypes, categorySkeleton } from "@/global/dto";

export default function CategoryPage() {
  const user = useSelector((state: RootState) => state.user);
  const popUp = useSelector((state: RootState) => state.sidebar.popUpEnabled);
  const [showTable, setShowTable] = useState(false);
  const dispatch = useDispatch();
  const token = FetchToken();
  const isCategoryMounted = useRef(false);
  const [filter, setFilter] = useState(false);
  const [categoriesList, setCategories] = useState<categorySkeleton[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<categorySkeleton | null>(null);

  const fetchCategories = async (type: string | null) => {
    const urlBuilder = new URL(`${API_URL}/categories/user/${user.id}`);
    if (type !== null && type !== "")
      urlBuilder.searchParams.append("type", type);

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
      if (data.length === 0) {
        setShowTable(false);
      } else {
        setShowTable(true);
      }
      setCategories(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCategoryMounted.current) {
      isCategoryMounted.current = true;
      fetchCategories("");
    }
  }, []);

  const handleUpdateCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) {
      console.warn("Update already in progress");
      return;
    }

    if (!selectedCategory) return alert("Select one category to edit.");

    if (!token) {
      console.error("No token found for authentication");
      return;
    }

    const toUpdate = selectedCategory as categorySkeleton;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/categories/update/${toUpdate.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(toUpdate),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      fetchCategories(categoryFilter);
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setLoading(false);
      setSelectedCategory(null);
    }
  };

  return (
    <div className="block w-full">
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-200">
          All Categories
        </h1>
        <div>
          <Image
            src={user.theme === "light" ? filterIcon : filterIconWhite}
            alt="Filter"
            className="inline-block w-6 h-6 cursor-pointer ml-4"
            onClick={() => setFilter(!filter)}
          />
        </div>
      </div>
      {filter && (
        <div className="mb-4 flex items-center space-x-4">
          <DropDown
            options={categoryTypes.map((category) => ({
              label: category.label,
              value: category.value,
            }))}
            defaultValue="All Types"
            selectedOption={categoryFilter}
            onSelect={(option) => {
              const ctType = categoryTypes.find(
                (category) => category.value === option
              );
              setCategoryFilter(ctType ? ctType.value : "");
              fetchCategories(ctType ? ctType.value : null);
            }}
            classname="bg-white dark:bg-gray-800"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full divide-y  shadow-lg rounded-lg overflow-hidden dark:divide-gray-700 ">
          {/* divide-gray-300 */}
          <thead
            className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider
            dark:bg-gray-800 dark:text-gray-200"
          >
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold ">#</th>
              <th className="px-4 py-3 font-semibold ">Category</th>
              <th className="px-4 py-3 font-semibold ">Amount</th>
            </tr>
          </thead>
          {!showTable && (
            <tbody
              className="bg-white divide-y  text-sm
              dark:bg-gray-900 dark:text-gray-200 dark:divide-gray-700"
            >
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <p className="text-gray-500">
                    {loading ? "Loading..." : "No category found"}
                  </p>
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
              {categoriesList.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-100 py-3 group relative dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setSelectedCategory(category);
                      dispatch(togglePopUp());
                      return;
                    }
                  }}
                >
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">{category.name}</td>

                  <td className="px-4 py-3">
                    {
                      categoryTypes.find((cat) => cat.value === category.type)
                        ?.label
                    }
                  </td>

                  <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Image
                      src={user.theme === "light" ? editIcon : editIconWhite}
                      alt="Edit"
                      className="w-4 h-4"
                      onClick={() => {
                        setSelectedCategory(category);
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
                  await handleUpdateCategory(event);
                  dispatch(togglePopUp());
                }}
              >
                <input
                  type="text"
                  placeholder="Category Name"
                  className="p-2 border border-gray-400 rounded"
                  value={selectedCategory?.name}
                  onChange={(e) => {
                    if (!selectedCategory) return;
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    });
                  }}
                />

                <select
                  className="p-2 border border-gray-400 rounded cursor-pointer"
                  value={selectedCategory?.type}
                  onChange={(e) => {
                    if (!selectedCategory) return;
                    setSelectedCategory({
                      ...selectedCategory,
                      type: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    Select Type
                  </option>
                  {categoryTypes.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <button type="submit" className="button-green">
                  {loading ? "Updating..." : "Update Category"}
                </button>
              </form>
            </div>
          </PopUp>
        )}
      </div>
      {/* <div className="flex justify-between items-center py-4 w-full">
        <div className="flex items-center space-x-2 w-full justify-center">
          <button
                  Save Changes
                </button>
              </form>
            </div>
          </PopUp>
        )}
      </div>
      {/* <div className="flex justify-between items-center py-4 w-full">
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
                fromDate: "",
                toDate: "",
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
                fromDate: "",
                toDate: "",
                category: "",
                order: "desc",
                page: pageNumber + 1,
              });
            }}
          >
            {`Next >`}
          </button>
        </div>
      </div> */}
    </div>
  );
}
