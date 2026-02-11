"use client";
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
import api from "@/lib/api";

const table_data_classname = "px-1 py-3 sm:px-4 sm:py-3";
const table_data_loading = "bg-gray-200 dark:bg-gray-500 rounded animate-pulse";

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
    try {
      setLoading(true);
      const response = await api.get(
        `/categories/user/${user.id}${type ? `?type=${type}` : ""}`,
      );
      if (response.status !== 200) throw new Error("Failed to fetch expenses");
      const data = await response.data;
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
      const response = await api.patch(
        `/categories/update/${toUpdate.id}`,
        toUpdate,
      );

      if (response.status !== 200) {
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
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Library
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your spending categories.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-sm"
          onClick={() => setFilter(!filter)}
        >
          <Image
            src={user.theme === "light" ? filterIcon : filterIconWhite}
            alt="Filter"
            className="w-4 h-4"
          />
          Filter
        </button>
      </div>
      {filter && (
        <div
          className="gap-6 sm:gap-3 md:gap-4 mb-6
          grid sm:grid-cols-3
          md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7
          bg-background/80 border border-border/70 p-4 rounded-2xl shadow-sm"
        >
          <DropDown
            options={categoryTypes.map((category) => ({
              label: category.label,
              value: category.value,
            }))}
            selectedOption={categoryFilter}
            onSelect={(option) => {
              const ctType = categoryTypes.find(
                (category) => category.value === option,
              );
              setCategoryFilter(ctType ? ctType.value : "");
              fetchCategories(ctType ? ctType.value : null);
            }}
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <table className="w-full text-xs sm:text-sm table-fixed">
          <thead className="bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <th className={`${table_data_classname}`}>#</th>
              <th className={`${table_data_classname}`}>Category</th>
              <th className={`${table_data_classname}`}>Amount</th>
            </tr>
          </thead>
          {(!showTable || loading) && (
            <tbody className="divide-y">
              {!loading && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <p className="text-muted-foreground">No categories found</p>
                  </td>
                </tr>
              )}
              {loading && (
                <>
                  {[...Array(10)].map((_, index) => (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className={table_data_classname}>
                        <div className={`h-4 w-4 ${table_data_loading}`}></div>
                      </td>
                      <td className={table_data_classname}>
                        <div className={`h-4 w-30 ${table_data_loading}`}></div>
                      </td>
                      <td className={table_data_classname}>
                        <div className={`h-4 w-16 ${table_data_loading}`}></div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          )}
          {showTable && !loading && (
            <tbody className="divide-y text-sm">
              {categoriesList.map((category) => (
                <tr
                  key={category.id}
                  className="group relative transition-colors hover:bg-muted/50"
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setSelectedCategory(category);
                      dispatch(togglePopUp());
                      return;
                    }
                  }}
                >
                  <td className={`${table_data_classname}`}></td>
                  <td className={`${table_data_classname}`}>{category.name}</td>

                  <td className={`${table_data_classname}`}>
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
    </div>
  );
}
