import CategoryPage from "./category";

export async function generateMetadata() {
  return {
    title: "Category | Expensely",
  };
}

export default function CategoryPageWrapper() {
  return <CategoryPage />;
}
