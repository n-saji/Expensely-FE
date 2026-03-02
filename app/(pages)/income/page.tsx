import IncomePage from "./income";

export async function generateMetadata() {
  return {
    title: "Income | Expensely",
  };
}

export default function IncomePageWrapper() {
  return <IncomePage />;
}
