"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DropDown from "@/components/drop-down";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkLoadResponse } from "@/global/dto";

export default function AddExpensePage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [open, setOpen] = React.useState(false);
  const [expense, setExpense] = useState({
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: 0,
    description: "",
    expenseDate: new Date().toLocaleString().slice(0, 10),
  });
  const [adding_expense_loading, setAddingExpenseLoading] = useState(false);
  const [bulkLoadValidation, setBulkLoadValidation] = useState<boolean>(false);
  const [bulkLoadLoading, setBulkLoadLoading] = useState<boolean>(false);
  const [bulkLoadFile, setBulkLoadFile] = useState<File | null>(null);
  const [bulkLoadResponse, setBulkLoadResponse] =
    useState<BulkLoadResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!expense.category.id) {
      toast.error("Please select a category");
      return;
    }
    if (expense.amount === null || expense.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!expense.description) {
      toast.error("Please enter a description");
      return;
    }
    if (!expense.expenseDate) {
      toast.error("Please select a date");
      return;
    }

    setAddingExpenseLoading(true);
    try {
      // convert date to datetime
      const expenseDate = new Date(expense.expenseDate);

      expense.expenseDate =
        expenseDate.toISOString().slice(0, 10) +
        "T" +
        new Date().toTimeString().slice(0, 8) +
        ".000Z";

      const response = await api.post(`/expenses/create`, expense);

      if (response.status !== 200) {
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
          : new Date().toLocaleString().slice(0, 10),
      });

      toast.success("Expense added successfully", {
        action: {
          label: "View Expenses",
          onClick: () => {
            router.push("/expense");
          },
        },
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setAddingExpenseLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkLoadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", bulkLoadFile);

      setBulkLoadValidation(true);
      const validationResponse = await api.post(
        `/expenses/bulk_upload/validate`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = validationResponse.data;
      setBulkLoadResponse(data);

      if (
        validationResponse.status !== 200 ||
        validationResponse.data.error !== null
      ) {
        throw new Error("Validation failed: " + validationResponse.data.error);
      } else if (data.errors && data.errors.length > 0) {
        toast.error("Validation errors found in the file", {
          description: `Found ${data.errors.length} errors. Please review and correct them before uploading.`,
        });
        return;
      }
      setBulkLoadValidation(false);

      setBulkLoadLoading(true);
      const response = await api.get(
        `/expenses/bulk_upload/upload?file_id=${data.validationId}`
      );

      if (response.status !== 200) {
        throw new Error(
          "Failed to upload expenses: " + JSON.stringify(response.data)
        );
      }

      toast.success("Expenses uploaded successfully", {
        action: {
          label: "View Expenses",
          onClick: () => router.push("/expense"),
        },
      });
    } catch (error) {
      console.error("Error uploading expenses:", error);
      toast.error(
        error instanceof Error ? error.message : "Error uploading expenses",
        {
          description: bulkLoadResponse?.error || "Unknown error occurred",
          // handle popup via state, not JSX directly
        }
      );
    } finally {
      setBulkLoadLoading(false);
      setBulkLoadValidation(false);
    }
  };

  return (
    <div
      className="p-4 md:p-8 w-full
         flex flex-col items-center justify-center  "
    >
      <Card className="w-[95%] sm:w-1/2 text-center">
        <CardHeader>
          <CardTitle className="flex justify-center">
            <Label className="text-xl">Add New Expense</Label>
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="single">Single Entry</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
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

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between text-muted-foreground"
                    >
                      {expense ? expense.expenseDate : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        expense ? new Date(expense.expenseDate) : undefined
                      }
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setOpen(false);
                        setExpense({
                          ...expense,
                          expenseDate: date
                            ? date.toLocaleString().slice(0, 10)
                            : "",
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <Button type="submit" disabled={adding_expense_loading}>
                  {adding_expense_loading ? <Spinner /> : "Add Expense"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="bulk">
              <div className="mb-8">
                <Label className="text-bold mb-3">Requirements:</Label>
                <Label className="mb-3 text-muted-foreground">
                  Upload an Excel file (.csv only) with the following columns:
                </Label>
                <ul className="ml-2 list-disc list-inside text-left mb-3">
                  <Label className="mb-1 text-muted-foreground">
                    <li>description </li>
                  </Label>

                  <Label className="mb-1 text-muted-foreground">
                    <li>amount</li>
                  </Label>

                  <Label className="mb-1 text-muted-foreground">
                    <li>category</li>
                  </Label>

                  <Label className="mb-1 text-muted-foreground">
                    <li>expense_date (YYYY-MM-DD format)</li>
                  </Label>
                </ul>
                <Label className="text-bold mb-1">Notes:</Label>
                <Label className="text-sm ml-2 mb-1 text-muted-foreground">
                  Ensure that the category corresponds to existing categories
                  names.
                </Label>
              </div>
              <div className="grid w-full max-w-sm items-center gap-3">
                <Label htmlFor="excelFile" className="text-bold">
                  Excel File
                </Label>
                <div className="flex gap-4 justify-center items-center">
                  <Input
                    type="file"
                    id="excelFile"
                    accept=".csv , .xlsx"
                    disabled={bulkLoadLoading || bulkLoadValidation}
                    onChange={(e) =>
                      setBulkLoadFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                  <Button
                    className="max-w-[150px]"
                    disabled={bulkLoadLoading || bulkLoadValidation}
                    onClick={
                      bulkLoadFile
                        ? handleBulkUpload
                        : () => toast.error("Please select a file to upload")
                    }
                  >
                    {bulkLoadLoading ? (
                      <>
                        <Spinner /> Uploading...
                      </>
                    ) : bulkLoadValidation ? (
                      <>
                        <Spinner /> Validating...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
