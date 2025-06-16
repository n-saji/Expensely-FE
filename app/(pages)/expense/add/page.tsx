import AddExpensePage from "./add_expense";

export async function generateMetadata() {
  return {
    title: "Add Expense | Expensely",
  };
}

export default function AddExpensePageWrapper() {
  return <AddExpensePage />;
}
