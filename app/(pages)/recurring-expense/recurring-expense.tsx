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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function RecurringExpensePage() {
  const [loading, setLoading] = useState(true);
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [selectedDelete, setSelectedDelete] =
    useState<RecurringExpenseRow | null>(null);
  const [selectedUpdate, setSelectedUpdate] =
    useState<RecurringExpenseRow | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const categories = useSelector((state: RootState) => state.categoryExpense);

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      setLoading(true);
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
      fetchRecurringExpenses();
    };

    window.addEventListener("recurring-expense-added", refreshHandler);
    return () => {
      window.removeEventListener("recurring-expense-added", refreshHandler);
    };
  }, [fetchRecurringExpenses]);

  const rows = useMemo<RecurringExpenseRow[]>(() => {
    return recurringExpenses.map((item) => ({
      ...item,
      categoryName:
        categories.categories.find(
          (category) => category.id === item.categoryId,
        )?.name || "Unknown",
    }));
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
      await fetchRecurringExpenses();
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
      await fetchRecurringExpenses();
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
    await fetchRecurringExpenses();
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

      <Card className="border-border/70 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Recurring Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={tableColumns} data={rows} loading={loading} />
        </CardContent>
      </Card>

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
