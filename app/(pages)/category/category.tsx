"use client";
import { RootState } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { categoryTypes, categorySkeleton } from "@/global/dto";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import CategoryBadge from "@/components/category-badge";
import CategoryStylePicker from "@/components/category-style-picker";
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON_KEY,
  normalizeCategoryColor,
  resolveCategoryIconKey,
} from "@/components/category-icon-registry";

const table_data_classname = "px-1 py-3 sm:px-4 sm:py-3";
const table_data_loading = "bg-gray-200 dark:bg-gray-500 rounded animate-pulse";

export default function CategoryPage() {
  const user = useSelector((state: RootState) => state.user);
  const [showTable, setShowTable] = useState(false);
  const isCategoryMounted = useRef(false);
  // const [filter, setFilter] = useState(false);
  const [categoriesList, setCategories] = useState<categorySkeleton[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<categorySkeleton | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [openAddSheet, setOpenAddSheet] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "",
    icon: DEFAULT_CATEGORY_ICON_KEY as string,
    color: DEFAULT_CATEGORY_COLOR,
  });
  const [addingCategory, setAddingCategory] = useState(false);

  const [deletingCategory, setDeletingCategory] =
    useState<categorySkeleton | null>(null);
  const [dependencies, setDependencies] = useState<{
    budgetCount: number;
    expenseCount: number;
    incomeCount: number;
    recurringExpenseCount: number;
    reminderCount: number;
  } | null>(null);
  const [isFetchingDependencies, setIsFetchingDependencies] = useState(false);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCategory.name) {
      toast.error("Please enter a category name");
      return;
    }
    if (!newCategory.type) {
      toast.error("Please select a category type");
      return;
    }
    setAddingCategory(true);

    try {
      const payload = {
        ...newCategory,
        user: {
          id: user.id,
        },
        icon: resolveCategoryIconKey(newCategory.icon),
        color: normalizeCategoryColor(newCategory.color),
      };
      const response = await api.post(`/categories/create`, payload);

      if (response.status !== 200) {
        throw new Error("Failed to add category");
      }

      toast.success("Category added successfully");

      setNewCategory({
        name: "",
        type: "",
        icon: DEFAULT_CATEGORY_ICON_KEY,
        color: DEFAULT_CATEGORY_COLOR,
      });
      setOpenAddSheet(false);
      await fetchCategories(categoryFilter);
      window.dispatchEvent(new Event("category-added"));
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error adding category");
    } finally {
      setAddingCategory(false);
    }
  };

  const fetchCategories = async (type: string | null) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/categories/user${type ? `?type=${type}` : ""}`,
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

  const handleUpdateCategory = async () => {
    if (updatingCategory) {
      console.warn("Update already in progress");
      return;
    }

    if (!selectedCategory) return alert("Select one category to edit.");

    const toUpdate = {
      ...(selectedCategory as categorySkeleton),
      icon: resolveCategoryIconKey(selectedCategory.icon),
      color: normalizeCategoryColor(selectedCategory.color),
    };

    try {
      setUpdatingCategory(true);
      const response = await api.patch(
        `/categories/update/${toUpdate.id}`,
        toUpdate,
      );

      if (response.status !== 200) {
        throw new Error("Failed to update expense");
      }

      await fetchCategories(categoryFilter);
      window.dispatchEvent(new Event("category-added"));
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setUpdatingCategory(false);
      setSelectedCategory(null);
    }
  };

  const handleDeleteInitiate = async (category: categorySkeleton) => {
    setDeletingCategory(category);
    setDependencies(null);
    setOpenDeleteConfirmDialog(true);
    setIsFetchingDependencies(true);
    try {
      const response = await api.get(
        `/categories/find-category-dependencies/${category.id}`,
      );
      setDependencies(response.data);
    } catch (error) {
      console.error("Error fetching category dependencies:", error);
      setOpenDeleteConfirmDialog(false);
      alert("Failed to check category dependencies. Please try again.");
    } finally {
      setIsFetchingDependencies(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const response = await api.delete(`/categories/${deletingCategory.id}`);
      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Failed to delete category");
      }
      setOpenDeleteConfirmDialog(false);
      setDeletingCategory(null);
      await fetchCategories(categoryFilter);
      window.dispatchEvent(new Event("category-added"));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setIsDeleting(false);
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
        <div className="flex items-center gap-3">
          {/* <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-muted/50 transition-colors h-9"
            onClick={() => setFilter(!filter)}
          >
            <Image
              src={user.theme === "light" ? filterIcon : filterIconWhite}
              alt="Filter"
              className="w-4 h-4"
            />
            Filter
          </button> */}

          <Sheet open={openAddSheet} onOpenChange={setOpenAddSheet}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-full sm:max-w-md p-6 flex flex-col gap-6"
              side="right"
            >
              <SheetHeader className="p-0">
                <SheetTitle className="text-xl">Add New Category</SheetTitle>
                <SheetDescription>
                  Create a new category to organize expenses.
                </SheetDescription>
              </SheetHeader>

              <form
                className="flex flex-col gap-4 flex-1"
                onSubmit={handleAddCategory}
              >
                <div className="space-y-2">
                  <Label htmlFor="add-category-name">Category Name</Label>
                  <Input
                    id="add-category-name"
                    type="text"
                    placeholder="Category Name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-category-type">Category Type</Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(value) => {
                      setNewCategory((prev) => ({
                        ...prev,
                        type: value,
                      }));
                    }}
                  >
                    <SelectTrigger id="add-category-type" className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Style & Preview</Label>
                  <CategoryStylePicker
                    icon={newCategory.icon}
                    color={newCategory.color}
                    onIconChange={(value) => {
                      setNewCategory((prev) => ({ ...prev, icon: value }));
                    }}
                    onColorChange={(value) =>
                      setNewCategory((prev) => ({ ...prev, color: value }))
                    }
                    previewLabel={newCategory.name || "New category"}
                  />
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setOpenAddSheet(false)}
                    disabled={addingCategory}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={addingCategory}
                  >
                    {addingCategory ? <Spinner /> : "Add Category"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* {filter && (
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
      )} */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              {/* <TableHead className="w-[100px] text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!showTable || loading) && (
              <>
                {!loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No categories found
                      </p>
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <>
                    {[...Array(10)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </>
            )}
            {showTable && !loading && (
              <>
                {categoriesList.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <CategoryBadge
                        name={category.name}
                        icon={category.icon}
                        color={category.color}
                      />
                    </TableCell>
                    <TableCell className="capitalize">
                      {categoryTypes.find((cat) => cat.value === category.type)
                        ?.label || category.type}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCategory(category);
                              setOpenEditDialog(true);
                            }}
                          >
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            onClick={() => handleDeleteInitiate(category)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>

        <Dialog
          open={openEditDialog}
          onOpenChange={(open) => {
            setOpenEditDialog(open);
            if (!open) {
              setSelectedCategory(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await handleUpdateCategory();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  type="text"
                  placeholder="Category Name"
                  value={selectedCategory?.name || ""}
                  onChange={(e) => {
                    if (!selectedCategory) return;
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category-type">Category Type</Label>
                <Select
                  value={selectedCategory?.type || ""}
                  onValueChange={(value) => {
                    if (!selectedCategory) return;
                    setSelectedCategory({
                      ...selectedCategory,
                      type: value,
                    });
                  }}
                >
                  <SelectTrigger id="edit-category-type" className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CategoryStylePicker
                icon={selectedCategory?.icon}
                color={selectedCategory?.color}
                onIconChange={(value) => {
                  if (!selectedCategory) return;
                  setSelectedCategory({
                    ...selectedCategory,
                    icon: value,
                  });
                }}
                onColorChange={(value) => {
                  if (!selectedCategory) return;
                  setSelectedCategory({
                    ...selectedCategory,
                    color: value,
                  });
                }}
                previewLabel={selectedCategory?.name || "Category"}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOpenEditDialog(false);
                    setSelectedCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updatingCategory}
                >
                  {updatingCategory ? <Spinner /> : "Update Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openDeleteConfirmDialog}
          onOpenChange={(open) => {
            setOpenDeleteConfirmDialog(open);
            if (!open) {
              setDeletingCategory(null);
              setDependencies(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                Delete Category
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the category{" "}
                <span className="font-semibold text-foreground">
                  "{deletingCategory?.name}"
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {isFetchingDependencies ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Spinner className="h-6 w-6" />
                <span className="text-sm text-muted-foreground">
                  Checking category dependencies...
                </span>
              </div>
            ) : dependencies ? (
              <div className="space-y-4 py-2">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Associated Records
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between border-b pb-1.5 border-border/40">
                      <span className="text-muted-foreground">Expenses</span>
                      <span
                        className={`font-semibold ${
                          dependencies.expenseCount > 0
                            ? "text-amber-600 dark:text-amber-400 font-bold"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {dependencies.expenseCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-1.5 border-border/40">
                      <span className="text-muted-foreground">Incomes</span>
                      <span
                        className={`font-semibold ${
                          dependencies.incomeCount > 0
                            ? "text-amber-600 dark:text-amber-400 font-bold"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {dependencies.incomeCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-1.5 border-border/40">
                      <span className="text-muted-foreground">Budgets</span>
                      <span
                        className={`font-semibold ${
                          dependencies.budgetCount > 0
                            ? "text-amber-600 dark:text-amber-400 font-bold"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {dependencies.budgetCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-1.5 border-border/40">
                      <span className="text-muted-foreground">
                        Recurring Expenses
                      </span>
                      <span
                        className={`font-semibold ${
                          dependencies.recurringExpenseCount > 0
                            ? "text-amber-600 dark:text-amber-400 font-bold"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {dependencies.recurringExpenseCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-1.5 border-border/40 col-span-2">
                      <span className="text-muted-foreground">Reminders</span>
                      <span
                        className={`font-semibold ${
                          dependencies.reminderCount > 0
                            ? "text-red-500 font-bold"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {dependencies.reminderCount}
                      </span>
                    </div>
                  </div>
                </div>

                {(dependencies.expenseCount > 0 ||
                  dependencies.incomeCount > 0 ||
                  dependencies.budgetCount > 0 ||
                  dependencies.recurringExpenseCount > 0 ||
                  dependencies.reminderCount > 0) && (
                  <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <strong>Warning:</strong> Deleting this category will affect
                    the associated records listed above.
                    {dependencies.reminderCount > 0 && (
                      <span className="block mt-1 font-semibold text-rose-800 dark:text-rose-200">
                        Attention: Deleting this category will permanently hard delete all associated reminders.
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            <DialogFooter className="flex gap-2 pt-2 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpenDeleteConfirmDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteConfirm}
                disabled={isFetchingDependencies || isDeleting}
              >
                {isDeleting ? <Spinner /> : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
