import SwitchComponent from "./switchComponent";

export async function generateMetadata() {
  return {
    title: "Expense | Expensely",
  };
}

export default function ExpensePageWrapper() {
  return <SwitchComponent />;
}
