import RecurringExpensePage from "./recurring-expense";

export async function generateMetadata() {
  return {
    title: "Recurring Expense | Expensely",
  };
}

export default function RecurringExpensePageWrapper() {
  return <RecurringExpensePage />;
}
