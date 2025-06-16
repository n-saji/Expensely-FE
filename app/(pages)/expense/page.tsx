import Expense from "./expense";

export async function generateMetadata() {
  return {
    title: "Expense | Expensely",
  };
}

export default function ExpensePageWrapper() {
  return <Expense />;
}
