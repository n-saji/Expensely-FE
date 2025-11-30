"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DropDown from "@/components/drop-down";
import { categoryTypes } from "@/global/dto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function AddCategoryPage() {
  const user = useSelector((state: RootState) => state.user);
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
      toast.error("Please enter a category name");
      return;
    }
    if (!category.type) {
      toast.error("Please select a category type");
      return;
    }
    setLoader(true);

    try {
      const response = await api.post(`/categories/create`, category);

      if (response.status !== 200) {
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
      toast.error("Error adding category");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div
      className="p-4 md:p-8 w-full
         flex flex-col items-center justify-center  "
    >
      <Card className="w-[95%] sm:w-1/2 text-center">
        <CardHeader>
          <CardTitle className="text-xl">Add New Category</CardTitle>
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
              placeholder="Category Name"
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
            />
            <Button type="submit" disabled={loader}>
              {loader ? <Spinner /> : "Add Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
