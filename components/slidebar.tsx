"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { useState } from "react";
import { useSelector } from "react-redux";
import { z } from "zod";
import { RootState } from "@/redux/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";

import * as React from "react";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Label } from "./ui/label";
import RecurringExpenseForm from "@/components/recurring-expense-form";
import { BulkLoadResponse, CreateRecurringExpenseReq } from "@/global/dto";

const normalExpenseSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z.coerce.number().positive("Please enter a valid amount"),
  description: z.string().trim().min(1, "Please enter a description"),
  expenseDate: z.string().min(1, "Please select a date"),
});

type NormalExpenseErrors = Partial<
  Record<keyof z.infer<typeof normalExpenseSchema>, string>
>;

export default function Slidebar() {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [expense, setExpense] = useState({
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().slice(0, 10),
  });
  const [adding_expense_loading, setAddingExpenseLoading] = useState(false);
  const [expenseEntryMode, setExpenseEntryMode] = useState("normal");
  const [bulkLoadValidation, setBulkLoadValidation] = useState(false);
  const [bulkLoadLoading, setBulkLoadLoading] = useState(false);
  const [bulkLoadFile, setBulkLoadFile] = useState<File | null>(null);
  const [bulkLoadResponse, setBulkLoadResponse] =
    useState<BulkLoadResponse | null>(null);
  const [normalExpenseErrors, setNormalExpenseErrors] =
    useState<NormalExpenseErrors>({});

  const handleSubmit = async () => {
    const validation = normalExpenseSchema.safeParse({
      categoryId: expense.category.id,
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setNormalExpenseErrors({
        categoryId: fieldErrors.categoryId?.[0],
        amount: fieldErrors.amount?.[0],
        description: fieldErrors.description?.[0],
        expenseDate: fieldErrors.expenseDate?.[0],
      });
      return;
    }

    setNormalExpenseErrors({});
    const parsedAmount = validation.data.amount;

    setAddingExpenseLoading(true);
    try {
      const expenseDate = new Date(expense.expenseDate);
      const payload = {
        ...expense,
        amount: parsedAmount,
        expenseDate:
          expenseDate.toISOString().slice(0, 10) +
          "T" +
          new Date().toTimeString().slice(0, 8) +
          ".000Z",
      };

      const response = await api.post(`/expenses/create`, payload);

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
        amount: "",
        description: "",
        expenseDate: new Date().toISOString().slice(0, 10),
      });

      window.dispatchEvent(new Event("expense-added"));
      toast.success("Expense added successfully");
      setSheetOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense", { description: String(error) });
    } finally {
      setAddingExpenseLoading(false);
    }
  };

  const handleRecurringSubmit = async (data: CreateRecurringExpenseReq) => {
    const response = await api.post(`/recurring-expenses/create`, data);

    if (response.status !== 200) {
      throw new Error("Failed to add recurring expense");
    }

    window.dispatchEvent(new Event("recurring-expense-added"));
    setSheetOpen(false);
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
        { headers: { "Content-Type": "multipart/form-data" } },
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
        `/expenses/bulk_upload/upload?file_id=${data.validationId}`,
      );

      if (response.status !== 200) {
        throw new Error(
          "Failed to upload expenses: " + JSON.stringify(response.data),
        );
      }

      window.dispatchEvent(new Event("expense-added"));
      toast.success("Expenses uploaded successfully");
      setSheetOpen(false);
      setBulkLoadFile(null);
      setBulkLoadResponse(null);
    } catch (error) {
      console.error("Error uploading expenses:", error);
      toast.error(
        error instanceof Error ? error.message : "Error uploading expenses",
        {
          description: bulkLoadResponse?.error || "Unknown error occurred",
        },
      );
    } finally {
      setBulkLoadLoading(false);
      setBulkLoadValidation(false);
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Plus className="h-3 w-3" />
          <Label className="text-xs">Add Expense</Label>
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
          <SheetDescription>
            Add a new expense to your ledger. You can choose to make it a
            recurring expense or a one-time transaction.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-4 flex flex-col flex-1 h-full">
          <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="recurring-toggle">Recurring expense</Label>
              <p className="text-xs text-muted-foreground">
                Toggle to create a recurring expense that repeats on a regular
                schedule.
              </p>
            </div>
            <Switch
              id="recurring-toggle"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring ? (
            <>
              <RecurringExpenseForm
                submitLabel="Add Recurring Expense"
                onSubmit={handleRecurringSubmit}
              />
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </SheetClose>
            </>
          ) : (
            <>
              <Tabs
                value={expenseEntryMode}
                onValueChange={setExpenseEntryMode}
                className="w-full flex-1 flex flex-col"
              >
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="normal">Normal Entry</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="bulk" className="flex-1 mt-4">
                  <div className="flex flex-col space-y-4 h-full">
                    <div className="space-y-2 text-sm">
                      <Label className="font-semibold">Requirements</Label>
                      <p className="text-muted-foreground">
                        Upload a spreadsheet with columns: description, amount,
                        category, and expense_date (YYYY-MM-DD).
                      </p>
                      <p className="text-muted-foreground">
                        Category values should match existing category names.
                      </p>
                    </div>

                    <div className="grid w-full items-center gap-3">
                      <Label htmlFor="expense-bulk-file">Excel File</Label>
                      <Input
                        type="file"
                        id="expense-bulk-file"
                        accept=".csv, .xlsx"
                        disabled={bulkLoadLoading || bulkLoadValidation}
                        onChange={(e) =>
                          setBulkLoadFile(
                            e.target.files ? e.target.files[0] : null,
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col space-y-4 mt-auto">
                      <Button
                        type="button"
                        disabled={bulkLoadLoading || bulkLoadValidation}
                        onClick={
                          bulkLoadFile
                            ? handleBulkUpload
                            : () =>
                                toast.error("Please select a file to upload")
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
                      <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </SheetClose>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="normal" className="flex-1 mt-4">
                  <form
                    className="flex flex-col space-y-4 h-full"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <FieldGroup className="flex flex-col flex-1 space-y-4 gap-0">
                      <Field>
                        <FieldLabel htmlFor="expense-name">
                          Description
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="expense-name"
                            type="text"
                            placeholder="Rent, subscription, etc."
                            value={expense.description}
                            onChange={(e) => {
                              setExpense({
                                ...expense,
                                description: e.target.value,
                              });
                              if (normalExpenseErrors.description) {
                                setNormalExpenseErrors((prev) => ({
                                  ...prev,
                                  description: undefined,
                                }));
                              }
                            }}
                          />
                        </FieldContent>
                        <FieldError
                          errors={
                            normalExpenseErrors.description
                              ? [{ message: normalExpenseErrors.description }]
                              : undefined
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel>Category</FieldLabel>
                        <Select
                          onValueChange={(option) => {
                            setExpense({
                              ...expense,
                              category: {
                                id: option,
                              },
                            });
                            if (normalExpenseErrors.categoryId) {
                              setNormalExpenseErrors((prev) => ({
                                ...prev,
                                categoryId: undefined,
                              }));
                            }
                          }}
                          value={expense.category.id}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={
                            normalExpenseErrors.categoryId
                              ? [{ message: normalExpenseErrors.categoryId }]
                              : undefined
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="amount">Amount</FieldLabel>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Amount"
                          value={expense.amount}
                          onChange={(e) => {
                            setExpense({
                              ...expense,
                              amount: e.target.value,
                            });
                            if (normalExpenseErrors.amount) {
                              setNormalExpenseErrors((prev) => ({
                                ...prev,
                                amount: undefined,
                              }));
                            }
                          }}
                        />
                        <FieldError
                          errors={
                            normalExpenseErrors.amount
                              ? [{ message: normalExpenseErrors.amount }]
                              : undefined
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="date">Start Date</FieldLabel>
                        <Popover
                          open={datePickerOpen}
                          onOpenChange={setDatePickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              type="button"
                              variant="outline"
                              className="w-full justify-between text-muted-foreground"
                            >
                              {expense.expenseDate || "Select start date"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                expense.expenseDate
                                  ? new Date(`${expense.expenseDate}T00:00:00`)
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (!date) return;
                                setExpense({
                                  ...expense,
                                  expenseDate: date.toISOString().slice(0, 10),
                                });
                                if (normalExpenseErrors.expenseDate) {
                                  setNormalExpenseErrors((prev) => ({
                                    ...prev,
                                    expenseDate: undefined,
                                  }));
                                }
                                setDatePickerOpen(false);
                              }}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FieldError
                          errors={
                            normalExpenseErrors.expenseDate
                              ? [{ message: normalExpenseErrors.expenseDate }]
                              : undefined
                          }
                        />
                      </Field>
                    </FieldGroup>
                    <div className="flex flex-col space-y-4">
                      <Button type="submit" disabled={adding_expense_loading}>
                        {adding_expense_loading ? <Spinner /> : "Add Expense"}
                      </Button>
                      <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </SheetClose>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
