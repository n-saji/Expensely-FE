import { SidebarProvider } from "@/components/ui/sidebar";

import DashboardPage from "./common";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardPage>{children}</DashboardPage>
      </SidebarProvider>
    </>
  );
}
