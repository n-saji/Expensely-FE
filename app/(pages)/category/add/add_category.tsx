"use client";
import { useState } from "react";
import { API_URL } from "@/config/config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import DropDown from "@/components/drop-down";
import { categoryTypes } from "@/global/dto";

export default function AddCategoryPage() {
  const user = useSelector((state: RootState) => state.user);
  const [error, setError] = useState("");
  const token = FetchToken();
  const [category, setCategory] = useState({
    user: {
      id: user.id,
    },
    name: "",
    type: "",
  });
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!category.name) {
      setError("Please enter a category name");
      return;
    }
    if (!category.type) {
      setError("Please select a category type");
      return;
    }
    setLoader(true);

    try {
      const response = await fetch(`${API_URL}/categories/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      setCategory({
        user: {
          id: user.id,
        },
        name: "",
        type: "",
      });
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoader(false);
      setError("");
    }
  };

  return (
    <div
      className="bg-gray-300 shadow-md rounded-lg p-4 md:p-8 w-full
         flex flex-col items-center justify-center dark:bg-gray-800 dark:text-gray-200"
    >
      <div className="w-80 sm:w-1/2 text-center">
        <h1 className="text-2xl font-semibold">Add New Category</h1>
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
              placeholder="Category Name"
              className="p-2 border border-gray-400 rounded "
              value={category.name}
              onChange={(e) =>
                setCategory({
                  ...category,
                  name: e.target.value,
                })
              }
            />

            <DropDown
              options={categoryTypes.map((c) => ({
                label: c.label,
                value: c.value,
              }))}
              defaultValue="Select Category Type"
              selectedOption={category.type}
              onSelect={(option) => {
                const selectedCategory = categoryTypes.find(
                  (category) => category.value === option
                );
                setCategory({
                  ...category,
                  type: selectedCategory ? selectedCategory.value : "",
                });
              }}
              classname="border border-gray-400 rounded p-2 cursor-pointer w-full"
            />
            <button type="submit" className="button-green" disabled={loader}>
              {loader ? "Adding..." : "Add Category"}
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
