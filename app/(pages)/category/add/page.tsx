import AddCategoryPage from "./add_category";

export async function generateMetadata() {
  return {
    title: "Add Category | Expensely",
  };
}

export default function AddCategoryPageWrapper({}: {}) {
  return <AddCategoryPage />;
}
