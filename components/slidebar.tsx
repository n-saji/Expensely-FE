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

import { useState, useEffect } from "react";
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
import CategoryBadge from "@/components/category-badge";
import CurrencyDrawer from "@/components/currency-drawer";

const normalTransactionSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z.coerce
    .number()
    .positive({ message: "Please enter a valid amount" }),
  currency: z.string().min(1, "Please select a currency"),
  description: z.string().trim().min(1, "Please enter a description"),
  transactionDate: z.string().min(1, "Please select a date"),
  file: z.instanceof(File).optional(),
});

type NormalTransactionErrors = Partial<
  Record<keyof z.infer<typeof normalTransactionSchema>, string>
>;

export default function Slidebar({
  variant,
}: {
  variant?: "default" | "outline" | "ghost";
}) {
  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense",
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [transaction, setTransaction] = useState({
    id: "",
    user: {
      id: user.id,
    },
    category: {
      id: "",
    },
    amount: "",
    currency: user.currency || "USD",
    description: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    file: undefined as File | undefined,
  });
  const [adding_transaction_loading, setAddingTransactionLoading] =
    useState(false);
  const [entryMode, setEntryMode] = useState("normal");
  const [bulkLoadValidation, setBulkLoadValidation] = useState(false);
  const [bulkLoadLoading, setBulkLoadLoading] = useState(false);
  const [bulkLoadFile, setBulkLoadFile] = useState<File | null>(null);
  const [bulkLoadResponse, setBulkLoadResponse] =
    useState<BulkLoadResponse | null>(null);
  const [normalTransactionErrors, setNormalTransactionErrors] =
    useState<NormalTransactionErrors>({});

  useEffect(() => {
    if (!transaction.currency && user.currency) {
      setTransaction((prev) => ({ ...prev, currency: user.currency || "USD" }));
    }
  }, [transaction.currency, user.currency]);

  // Reset category ID when transaction type changes to avoid selecting a cross-type category
  useEffect(() => {
    setTransaction((prev) => ({
      ...prev,
      category: { id: "" },
    }));
    setNormalTransactionErrors({});
  }, [transactionType]);

  async function handleFileUpload(transactionId: string) {
    const file = transaction.file;
    if (!file) return;

    try {
      const res = await api.get(
        `/transactions/get-presigned-url?fileName=${file.name}&transactionId=${transactionId}&contentType=${file.type}`,
      );

      console.log("Presigned URL response:", res);

      const uploadResponse = await fetch(res.data.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        console.log("Upload successful!");

        await api
          .put(
            `/transactions/update-transaction-attachment-url/eid/${transactionId}`,
            {
              url: res.data.key,
            },
          )
          .then((res) => {
            if (res.status === 200) {
              console.log(
                "Attachment URL updated successfully in the database",
              );
            } else {
              console.error(
                "Failed to update attachment URL in the database",
                res.statusText,
              );
            }
          })
          .catch((error) => {
            console.error(
              "Error updating attachment URL in the database:",
              error,
            );
          });
      } else {
        console.error("Upload failed", uploadResponse.statusText);
      }
    } catch (error) {
      console.error("Error in upload flow:", error);
    }
  }

  const handleSubmit = async () => {
    const validation = normalTransactionSchema.safeParse({
      categoryId: transaction.category.id,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      file: transaction.file,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setNormalTransactionErrors({
        categoryId: fieldErrors.categoryId?.[0],
        amount: fieldErrors.amount?.[0],
        currency: fieldErrors.currency?.[0],
        description: fieldErrors.description?.[0],
        transactionDate: fieldErrors.transactionDate?.[0],
        file: fieldErrors.file?.[0],
      });
      return;
    }

    setNormalTransactionErrors({});
    const parsedAmount = validation.data.amount;

    setAddingTransactionLoading(true);
    try {
      const dateVal = new Date(transaction.transactionDate);
      const payload = {
        ...transaction,
        amount: parsedAmount,
        transactionDate:
          dateVal.toISOString().slice(0, 10) +
          "T" +
          new Date().toTimeString().slice(0, 8) +
          ".000Z",
        type: transactionType.toUpperCase(),
      };

      const response = await api.post(`/transactions/create`, payload);

      if (response.status !== 200) {
        throw new Error("Failed to add transaction");
      }

      console.log("Transaction creation response:", response.data);

      if (transactionType === "expense" && transaction.file) {
        try {
          await handleFileUpload(response.data.id);
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error("Expense added but failed to upload attachment");
        }
      }

      setTransaction({
        id: "",
        user: {
          id: user.id,
        },
        category: {
          id: "",
        },
        amount: "",
        currency: user.currency || "USD",
        description: "",
        transactionDate: new Date().toISOString().slice(0, 10),
        file: undefined,
      });

      window.dispatchEvent(new Event("transaction-added"));
      toast.success("Transaction added successfully");
      setSheetOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction", { description: String(error) });
    } finally {
      setAddingTransactionLoading(false);
    }
  };

  const handleRecurringSubmit = async (data: CreateRecurringExpenseReq) => {
    const response = await api.post(`/recurring-expenses/create`, data);

    if (response.status !== 200) {
      throw new Error("Failed to add recurring expense");
    }

    window.dispatchEvent(new Event("recurring-expense-added"));
    window.dispatchEvent(new Event("transaction-added"));
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
        `/transactions/bulk_upload/validate`,
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
        `/transactions/bulk_upload/upload?file_id=${data.validationId}`,
      );

      if (response.status !== 200) {
        throw new Error(
          "Failed to upload transactions: " + JSON.stringify(response.data),
        );
      }

      window.dispatchEvent(new Event("transaction-added"));
      toast.success("Transactions uploaded successfully");
      setSheetOpen(false);
      setBulkLoadFile(null);
      setBulkLoadResponse(null);
    } catch (error) {
      console.error("Error uploading transactions:", error);
      toast.error(
        error instanceof Error ? error.message : "Error uploading transactions",
        {
          description: bulkLoadResponse?.error || "Unknown error occurred",
        },
      );
    } finally {
      setBulkLoadLoading(false);
      setBulkLoadValidation(false);
    }
  };

  const filteredCategories = categories.categories.filter(
    (cat) => cat.type?.toLowerCase() === transactionType,
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant={variant || "ghost"}>
          <Plus className="h-3 w-3" />
          <Label className="text-xs">Add Transaction</Label>
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full flex flex-col gap-0 ">
        <SheetHeader className="mb-4">
          <SheetTitle>Add Transaction</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4 flex flex-col flex-1 h-full">
          <Tabs
            value={transactionType}
            onValueChange={(val) =>
              setTransactionType(val as "expense" | "income")
            }
            className="w-full mb-4"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4 flex flex-col flex-1 h-full">
            {transactionType === "expense" && (
              <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring-toggle">Recurring expense</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle to create a recurring expense that repeats on a
                    regular schedule.
                  </p>
                </div>
                <Switch
                  id="recurring-toggle"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>
            )}

            {transactionType === "expense" && isRecurring ? (
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
                  value={entryMode}
                  onValueChange={setEntryMode}
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
                          Upload a spreadsheet with columns: description,
                          amount, category, date (YYYY-MM-DD), and type
                          (EXPENSE/INCOME).
                        </p>
                        <p className="text-muted-foreground">
                          Category values should match existing category names.
                        </p>
                      </div>

                      <div className="grid w-full items-center gap-3">
                        <Label htmlFor="transaction-bulk-file">
                          Excel File
                        </Label>
                        <Input
                          type="file"
                          id="transaction-bulk-file"
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
                          <FieldLabel htmlFor="transaction-desc">
                            Description
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              id="transaction-desc"
                              type="text"
                              placeholder="Rent, salary, subscription, etc."
                              value={transaction.description}
                              onChange={(e) => {
                                setTransaction({
                                  ...transaction,
                                  description: e.target.value,
                                });
                                if (normalTransactionErrors.description) {
                                  setNormalTransactionErrors((prev) => ({
                                    ...prev,
                                    description: undefined,
                                  }));
                                }
                              }}
                            />
                          </FieldContent>
                          <FieldError
                            errors={
                              normalTransactionErrors.description
                                ? [
                                    {
                                      message:
                                        normalTransactionErrors.description,
                                    },
                                  ]
                                : undefined
                            }
                          />
                        </Field>

                        <Field>
                          <FieldLabel>Category</FieldLabel>
                          <Select
                            onValueChange={(option) => {
                              setTransaction({
                                ...transaction,
                                category: {
                                  id: option,
                                },
                              });
                              if (normalTransactionErrors.categoryId) {
                                setNormalTransactionErrors((prev) => ({
                                  ...prev,
                                  categoryId: undefined,
                                }));
                              }
                            }}
                            value={transaction.category.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredCategories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  <CategoryBadge
                                    name={category.name}
                                    icon={category.icon}
                                    color={category.color}
                                  />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError
                            errors={
                              normalTransactionErrors.categoryId
                                ? [
                                    {
                                      message:
                                        normalTransactionErrors.categoryId,
                                    },
                                  ]
                                : undefined
                            }
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="amount">Amount</FieldLabel>
                          <div className="flex gap-2">
                            <CurrencyDrawer
                              value={transaction.currency}
                              onChange={(currency) => {
                                setTransaction((prev) => ({
                                  ...prev,
                                  currency,
                                }));
                                if (normalTransactionErrors.currency) {
                                  setNormalTransactionErrors((prev) => ({
                                    ...prev,
                                    currency: undefined,
                                  }));
                                }
                              }}
                              userCurrency={user.currency}
                              className="w-28"
                            />
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Amount"
                              value={transaction.amount}
                              onChange={(e) => {
                                setTransaction({
                                  ...transaction,
                                  amount: e.target.value,
                                });
                                if (normalTransactionErrors.amount) {
                                  setNormalTransactionErrors((prev) => ({
                                    ...prev,
                                    amount: undefined,
                                  }));
                                }
                              }}
                            />
                          </div>
                          <FieldError
                            errors={
                              normalTransactionErrors.currency
                                ? [
                                    {
                                      message: normalTransactionErrors.currency,
                                    },
                                  ]
                                : undefined
                            }
                          />
                          <FieldError
                            errors={
                              normalTransactionErrors.amount
                                ? [{ message: normalTransactionErrors.amount }]
                                : undefined
                            }
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="date">Date</FieldLabel>
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
                                {transaction.transactionDate || "Select date"}
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  transaction.transactionDate
                                    ? new Date(
                                        `${transaction.transactionDate}T00:00:00`,
                                      )
                                    : undefined
                                }
                                onSelect={(date) => {
                                  if (!date) return;
                                  setTransaction({
                                    ...transaction,
                                    transactionDate: date
                                      .toISOString()
                                      .slice(0, 10),
                                  });
                                  if (normalTransactionErrors.transactionDate) {
                                    setNormalTransactionErrors((prev) => ({
                                      ...prev,
                                      transactionDate: undefined,
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
                              normalTransactionErrors.transactionDate
                                ? [
                                    {
                                      message:
                                        normalTransactionErrors.transactionDate,
                                    },
                                  ]
                                : undefined
                            }
                          />
                        </Field>

                        {transactionType === "expense" && (
                          <Field>
                            <FieldLabel htmlFor="attachment">
                              Attachment
                            </FieldLabel>
                            <Input
                              id="attachment"
                                type="file"
                                className=""
                              accept=".jpg, .jpeg, .png, .pdf"
                              onChange={() => {
                                const fileInput = document.getElementById(
                                  "attachment",
                                ) as HTMLInputElement;
                                const file = fileInput.files
                                  ? fileInput.files[0]
                                  : null;
                                setTransaction({
                                  ...transaction,
                                  file: file || undefined,
                                });
                                if (normalTransactionErrors.file) {
                                  setNormalTransactionErrors((prev) => ({
                                    ...prev,
                                    file: undefined,
                                  }));
                                }
                              }}
                            />
                            <FieldError
                              errors={
                                normalTransactionErrors.file
                                  ? [{ message: normalTransactionErrors.file }]
                                  : undefined
                              }
                            />
                          </Field>
                        )}
                      </FieldGroup>
                      <div className="flex flex-col space-y-4">
                        <Button
                          type="submit"
                          disabled={adding_transaction_loading}
                        >
                          {adding_transaction_loading ? (
                            <Spinner />
                          ) : (
                            "Add Transaction"
                          )}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
