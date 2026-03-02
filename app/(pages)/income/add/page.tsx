import AddIncomePage from "./add_income";

export async function generateMetadata() {
  return {
    title: "Add Income | Expensely",
  };
}

export default function AddIncomePageWrapper() {
  return <AddIncomePage />;
}
