import Page from "./budget";

export async function generateMetadata() {
  return {
    title: "Budget | Expensely",
  };
}

export default function BudgePage() {
  return (
    <>
      <Page />
    </>
  );
}
