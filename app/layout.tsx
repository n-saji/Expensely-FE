import type { Metadata } from "next";
import "./globals.css";

import ReduxProvider from "@/redux/provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const maintenanceMode = process.env.NEXT_MAINTENANCE_MODE === "true";

export const metadata: Metadata = {
  title: maintenanceMode
    ? "Under Maintenance | Expensely"
    : "Expensely - Track and Manage Your Expenses",
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
        <ReduxProvider>
          {maintenanceMode && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
              <h1 className="text-3xl font-semibold mb-2">
                We’ll be back soon!
              </h1>
              <p className="text-gray-600 text-lg">
                Our site is currently undergoing scheduled maintenance.
                <br />
                Thank you for your patience.
              </p>
            </div>
          )}
          {!maintenanceMode && children}
        </ReduxProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
