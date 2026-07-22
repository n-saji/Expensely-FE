"use client";

import {
  Sheet,
  SheetContent,
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

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Paperclip,
  Plus,
  SlidersHorizontal,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
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
    "expense"
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [entryMode, setEntryMode] = useState<"normal" | "bulk">("normal");
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
        `/transactions/get-presigned-url?fileName=${file.name}&transactionId=${transactionId}&contentType=${file.type}`
      );

      const uploadResponse = await fetch(res.data.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        await api
          .put(
            `/transactions/update-transaction-attachment-url/eid/${transactionId}`,
            {
              url: res.data.key,
            }
          )
          .catch((error) => {
            console.error("Error updating attachment URL in DB:", error);
          });
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
        user: { id: user.id },
        category: { id: "" },
        amount: "",
        currency: user.currency || "USD",
        description: "",
        transactionDate: new Date().toISOString().slice(0, 10),
        file: undefined,
      });

      window.dispatchEvent(new Event("transaction-added"));
      if (transactionType === "expense") {
        window.dispatchEvent(new Event("expense-added"));
      } else {
        window.dispatchEvent(new Event("income-added"));
      }
      toast.success(
        `${transactionType === "expense" ? "Expense" : "Income"} logged successfully`
      );
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
    window.dispatchEvent(new Event("expense-added"));
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
        `/transactions/bulk_upload/upload?file_id=${data.validationId}`
      );

      if (response.status !== 200) {
        throw new Error(
          "Failed to upload transactions: " + JSON.stringify(response.data)
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
        }
      );
    } finally {
      setBulkLoadLoading(false);
      setBulkLoadValidation(false);
    }
  };

  const filteredCategories = categories.categories.filter(
    (cat) => cat.type?.toLowerCase() === transactionType
  );

  const formattedSelectedDate = () => {
    if (!transaction.transactionDate) return "Select date";
    const today = new Date().toISOString().slice(0, 10);
    if (transaction.transactionDate === today) return "Today";
    const [year, month, day] = transaction.transactionDate.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant={variant || "ghost"} className="gap-1.5 font-medium">
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0 border-l border-border/60 bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold tracking-tight">
            Add Transaction
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Clear-Cut Separation Switch (Expense vs Income) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/40">
            <button
              type="button"
              onClick={() => setTransactionType("expense")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                transactionType === "expense"
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <ArrowDownRight
                className={`h-4 w-4 ${
                  transactionType === "expense"
                    ? "text-rose-500"
                    : "text-muted-foreground"
                }`}
              />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => setTransactionType("income")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                transactionType === "income"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <ArrowUpRight
                className={`h-4 w-4 ${
                  transactionType === "income"
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }`}
              />
              <span>Income</span>
            </button>
          </div>

          {/* Quick Normal / Bulk Mode Selector */}
          {entryMode === "bulk" ? (
            /* Bulk Upload View */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Bulk CSV / Excel Upload
                </span>
                <button
                  type="button"
                  onClick={() => setEntryMode("normal")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  ← Back to Single Entry
                </button>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Format Guidelines:</p>
                <p>
                  Columns required: <code className="text-foreground">description</code>,{" "}
                  <code className="text-foreground">amount</code>,{" "}
                  <code className="text-foreground">category</code>,{" "}
                  <code className="text-foreground">date (YYYY-MM-DD)</code>, and{" "}
                  <code className="text-foreground">type (EXPENSE/INCOME)</code>.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-file" className="text-xs font-medium">
                  Select Spreadsheet File
                </Label>
                <Input
                  id="bulk-file"
                  type="file"
                  accept=".csv, .xlsx"
                  disabled={bulkLoadLoading || bulkLoadValidation}
                  onChange={(e) =>
                    setBulkLoadFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="text-xs cursor-pointer"
                />
              </div>

              <Button
                type="button"
                className="w-full h-11 font-medium"
                disabled={bulkLoadLoading || bulkLoadValidation}
                onClick={
                  bulkLoadFile
                    ? handleBulkUpload
                    : () => toast.error("Please select a file to upload")
                }
              >
                {bulkLoadLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> Uploading...
                  </>
                ) : bulkLoadValidation ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> Validating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                  </>
                )}
              </Button>
            </div>
          ) : isRecurring && transactionType === "expense" ? (
            /* Recurring Expense View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recurring Expense Mode
                </span>
                <button
                  type="button"
                  onClick={() => setIsRecurring(false)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Switch to One-time
                </button>
              </div>
              <RecurringExpenseForm
                submitLabel="Save Recurring Expense"
                onSubmit={handleRecurringSubmit}
              />
            </div>
          ) : (
            /* Minimalist Fast-Entry Form */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-5"
            >
              {/* Hero Amount Field */}
              <div className="relative rounded-2xl border border-border/60 bg-muted/30 p-4 transition-all focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-medium">Amount</span>
                  <CurrencyDrawer
                    value={transaction.currency}
                    onChange={(currency) => {
                      setTransaction((prev) => ({ ...prev, currency }));
                      if (normalTransactionErrors.currency) {
                        setNormalTransactionErrors((prev) => ({
                          ...prev,
                          currency: undefined,
                        }));
                      }
                    }}
                    userCurrency={user.currency}
                    className="h-6 px-2 text-xs font-semibold"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-2xl font-bold ${
                      transactionType === "expense"
                        ? "text-rose-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {transactionType === "expense" ? "-" : "+"}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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
                    className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40"
                    autoFocus
                  />
                </div>

                {normalTransactionErrors.amount && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {normalTransactionErrors.amount}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Category
                </Label>
                <Select
                  onValueChange={(option) => {
                    setTransaction({
                      ...transaction,
                      category: { id: option },
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
                  <SelectTrigger className="w-full h-11 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <CategoryBadge
                          name={category.name}
                          icon={category.icon}
                          color={category.color}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {normalTransactionErrors.categoryId && (
                  <p className="text-xs text-destructive font-medium">
                    {normalTransactionErrors.categoryId}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Description
                </Label>
                <Input
                  type="text"
                  placeholder={
                    transactionType === "expense"
                      ? "e.g. Coffee, Groceries, Rent..."
                      : "e.g. Salary, Freelance, Dividend..."
                  }
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
                  className="h-11 rounded-xl"
                />
                {normalTransactionErrors.description && (
                  <p className="text-xs text-destructive font-medium">
                    {normalTransactionErrors.description}
                  </p>
                )}
              </div>

              {/* Date Quick Selector */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Date
                </span>
                <Popover
                  open={datePickerOpen}
                  onOpenChange={setDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg text-xs font-medium"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formattedSelectedDate()}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={
                        transaction.transactionDate
                          ? new Date(`${transaction.transactionDate}T00:00:00`)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (!date) return;
                        setTransaction({
                          ...transaction,
                          transactionDate: date.toISOString().slice(0, 10),
                        });
                        if (normalTransactionErrors.transactionDate) {
                          setNormalTransactionErrors((prev) => ({
                            ...prev,
                            transactionDate: undefined,
                          }));
                        }
                        setDatePickerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Optional Advanced Accordion / Toggle */}
              <div className="pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium py-1"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>
                    {showAdvanced
                      ? "Hide options"
                      : "More options (Attachment, Recurring, Bulk)"}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-4 text-xs">
                    {/* Attachment Option */}
                    {transactionType === "expense" && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="attachment"
                          className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                        >
                          <Paperclip className="h-3.5 w-3.5" /> Attachment (Receipt / Invoice)
                        </Label>
                        <Input
                          id="attachment"
                          type="file"
                          accept=".jpg, .jpeg, .png, .pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            setTransaction({
                              ...transaction,
                              file: file || undefined,
                            });
                          }}
                          className="h-9 text-xs cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Recurring Expense Option */}
                    {transactionType === "expense" && (
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="font-medium text-foreground">Recurring Expense</p>
                          <p className="text-[11px] text-muted-foreground">
                            Set repeat schedule for this expense
                          </p>
                        </div>
                        <Switch
                          checked={isRecurring}
                          onCheckedChange={setIsRecurring}
                        />
                      </div>
                    )}

                    {/* Bulk Upload Link */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-muted-foreground">Need to import multiple?</span>
                      <button
                        type="button"
                        onClick={() => setEntryMode("bulk")}
                        className="flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Bulk Upload
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={adding_transaction_loading}
                  className={`w-full h-12 rounded-xl text-base font-semibold transition-all shadow-md ${
                    transactionType === "expense"
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  }`}
                >
                  {adding_transaction_loading ? (
                    <Spinner />
                  ) : (
                    <span>
                      Add {transactionType === "expense" ? "Expense" : "Income"}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
