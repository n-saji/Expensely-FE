import TransactionPage from "./_components/transaction";

export async function generateMetadata() {
  return {
    title: "Transactions | Expensely",
  };
}

export default function TransactionPageWrapper() {
  return <TransactionPage />;
}
