import AdminUI from "./admin";

export async function generateMetadata() {
  return {
    title: "Admin | Expensely",
  };
}

export default function AdminPage() {
  return <AdminUI />;
}
