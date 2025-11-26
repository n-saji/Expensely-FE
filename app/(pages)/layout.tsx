import { SidebarProvider } from "@/components/ui/sidebar";

import DashboardPage from "./common";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <DashboardPage>{children}</DashboardPage>
      </SidebarProvider>
    </>
  );
}
