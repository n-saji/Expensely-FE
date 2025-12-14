import ExpenseTableComponent from "./expense";


export async function generateMetadata() {
  return {
    title: "Expense | Expensely",
  };
}

export default async function ExpensePageWrapper() {
  return <ExpenseTableComponent />;
}
