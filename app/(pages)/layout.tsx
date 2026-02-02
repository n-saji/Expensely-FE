import { SidebarProvider } from "@/components/ui/sidebar";

import DashboardPage from "./common";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const maintenanceMode = process.env.NEXT_MAINTENANCE_MODE === "true";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  if (maintenanceMode) {
    redirect("/login");
  }
  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardPage>{!maintenanceMode && children}</DashboardPage>
      </SidebarProvider>
    </>
  );
}
