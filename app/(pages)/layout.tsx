import DashboardPage from "./common";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DashboardPage>{children}</DashboardPage>
    </>
  );
}
