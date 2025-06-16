import DashboardPage from "./dashboard";

export async function generateMetadata() {
  return {
    title: "Dashboard | Expensely",
  };
}

export default function DashboardPageWrapper({}: {}) {
  return <DashboardPage />;
}
