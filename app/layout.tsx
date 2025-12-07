import type { Metadata } from "next";
import "./globals.css";

import ReduxProvider from "@/redux/provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const maintenanceMode = process.env.NEXT_MAINTENANCE_MODE === "true";


export const metadata: Metadata = {
  title: maintenanceMode ? "Under Maintenance | Expensely" : "Expensely - Track and Manage Your Expenses",
  description:
    "Expensely helps you manage budgets, track spending, and visualize your finances securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-background `}>
        <ReduxProvider>{children}</ReduxProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
