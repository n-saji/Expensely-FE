"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecurringExpenseForm from "@/components/recurring-expense-form";
import api from "@/lib/api";
import { CreateRecurringExpenseReq } from "@/global/dto";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddRecurringExpensePage() {
  const router = useRouter();

  const handleCreateRecurring = async (data: CreateRecurringExpenseReq) => {
    const response = await api.post(`/recurring-expenses/create`, data);

    if (response.status !== 200) {
      throw new Error("Failed to create recurring expense");
    }

    toast.success("Recurring expense created successfully", {
      action: {
        label: "View Recurring",
        onClick: () => router.push("/recurring-expense"),
      },
    });
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Ledger
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Add Recurring Expense
        </h1>
        <p className="text-sm text-muted-foreground">
          Create recurring transactions for fixed, repeatable spending.
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto border-border/70 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Add Recurring Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringExpenseForm
            submitLabel="Create Recurring Expense"
            onSubmit={handleCreateRecurring}
            showSuccessToast={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
