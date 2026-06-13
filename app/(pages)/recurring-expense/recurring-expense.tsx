"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import {
  CreateRecurringExpenseReq,
  RecurringExpense,
  UpdateRecurringExpenseReq,
} from "@/global/dto";
import { toast } from "sonner";
import RecurringExpenseForm from "@/components/recurring-expense-form";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns, RecurringExpenseRow } from "./columns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RecurringExpensePage() {
  const [loading, setLoading] = useState(true);
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [selectedDelete, setSelectedDelete] =
    useState<RecurringExpenseRow | null>(null);
  const [selectedUpdate, setSelectedUpdate] =
    useState<RecurringExpenseRow | null>(null);
  const [openAddSheet, setOpenAddSheet] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);

  const handleCreateRecurring = async (data: CreateRecurringExpenseReq) => {
    const response = await api.post(`/recurring-expenses/create`, data);

    if (response.status !== 200) {
      throw new Error("Failed to create recurring expense");
    }

    await fetchRecurringExpenses(true);
  };

  const fetchRecurringExpenses = useCallback(async (noLoader?: boolean) => {
    try {
      if (!noLoader) setLoading(true);
      const response = await api.get(`/recurring-expenses/fetch-all`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch recurring expenses");
      }
      setRecurringExpenses(response.data);
    } catch (error) {
      toast.error("Failed to fetch recurring expenses", {
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurringExpenses();

    const refreshHandler = () => {
      fetchRecurringExpenses(true);
    };

    window.addEventListener("recurring-expense-added", refreshHandler);
    return () => {
      window.removeEventListener("recurring-expense-added", refreshHandler);
    };
  }, [fetchRecurringExpenses]);

  const rows = useMemo<RecurringExpenseRow[]>(() => {
    return recurringExpenses.map((item) => {
      const category = categories.categories.find(
        (category) => category.id === item.categoryId,
      );
      return {
        ...item,
        categoryName: category?.name || "Unknown",
        categoryIcon: category?.icon,
        categoryColor: category?.color,
      };
    });
  }, [recurringExpenses, categories.categories]);

  const handleDelete = async () => {
    if (!selectedDelete) return;

    try {
      const response = await api.delete(
        `/recurring-expenses/${selectedDelete.id}`,
      );
      if (response.status !== 200) {
        throw new Error("Failed to delete recurring expense");
      }
      toast.success("Recurring expense deleted successfully");
      setSelectedDelete(null);
      setRecurringExpenses((prev) =>
        prev.filter((expense) => expense.id !== selectedDelete.id),
      );
    } catch (error) {
      toast.error("Failed to delete recurring expense", {
        description: String(error),
      });
    }
  };

  const handleActivationToggle = async (row: RecurringExpenseRow) => {
    try {
      const action = row.active ? "deactivate" : "activate";
      const response = await api.put(`/recurring-expenses/${action}/${row.id}`);

      if (response.status !== 200) {
        throw new Error(`Failed to ${action} recurring expense`);
      }

      toast.success(
        row.active
          ? "Recurring expense deactivated successfully"
          : "Recurring expense activated successfully",
      );
      await fetchRecurringExpenses(true);
    } catch (error) {
      toast.error("Failed to update recurring expense status", {
        description: String(error),
      });
    }
  };

  const handleUpdateRecurring = async (data: CreateRecurringExpenseReq) => {
    if (!selectedUpdate) return;

    const payload: UpdateRecurringExpenseReq = {
      id: selectedUpdate.id,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      recurrence: data.recurrence,
      date: data.date,
    };

    const response = await api.put(
      `/recurring-expenses/${selectedUpdate.id}`,
      payload,
    );

    if (response.status !== 200) {
      throw new Error("Failed to update recurring expense");
    }

    setSelectedUpdate(null);
    setRecurringExpenses((prev) =>
      prev.map((expense) =>
        expense.id === selectedUpdate.id ? { ...expense, ...payload } : expense,
      ),
    );

    await fetchRecurringExpenses(true);
  };

  const tableColumns = useMemo(
    () =>
      columns({
        userCurrency: user.currency,
        onEdit: (row) => setSelectedUpdate(row),
        onDelete: (row) => setSelectedDelete(row),
        onToggleActive: handleActivationToggle,
      }),
    [user.currency],
  );

  return (
    <div className="w-full space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Ledger
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Recurring Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage repeating expenses and control activation states.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Sheet open={openAddSheet} onOpenChange={setOpenAddSheet}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                Add Recurring Expense
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-full sm:max-w-md p-6 flex flex-col gap-6"
              side="right"
            >
              <SheetHeader className="p-0">
                <SheetTitle className="text-xl">Add Recurring Expense</SheetTitle>
                <SheetDescription>
                  Create recurring transactions for fixed, repeatable spending.
                </SheetDescription>
              </SheetHeader>
              <RecurringExpenseForm
                submitLabel="Create Recurring Expense"
                onSubmit={handleCreateRecurring}
                onSuccess={() => setOpenAddSheet(false)}
                showSuccessToast={true}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <DataTable columns={tableColumns} data={rows} loading={loading} />

      {selectedDelete && (
        <AlertDialog
          open={!!selectedDelete}
          onOpenChange={(open) => !open && setSelectedDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete recurring expense?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                <strong> {selectedDelete.description}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {selectedUpdate && (
        <Dialog
          open={!!selectedUpdate}
          onOpenChange={() => setSelectedUpdate(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Recurring Expense</DialogTitle>
            </DialogHeader>
            <RecurringExpenseForm
              submitLabel="Update Recurring Expense"
              showCategory={false}
              initialValues={{
                amount: selectedUpdate.amount,
                currency: selectedUpdate.currency,
                description: selectedUpdate.description,
                recurrence: selectedUpdate.recurrence,
                date: selectedUpdate.date,
              }}
              onSubmit={handleUpdateRecurring}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
