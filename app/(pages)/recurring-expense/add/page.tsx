import AddRecurringExpensePage from "./add_recurring_expense";

export async function generateMetadata() {
  return {
    title: "Add Recurring Expense | Expensely",
  };
}

export default function AddRecurringExpensePageWrapper() {
  return <AddRecurringExpensePage />;
}
