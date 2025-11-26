import type { Metadata } from "next";
import "./globals.css";

import ReduxProvider from "@/redux/provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// import { Poppins, DM_Mono } from "next/font/google";
// const poppins = Poppins({
//   variable: "--font-poppins",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// });

// const dmMono = DM_Mono({
//   variable: "--font-dmmono",
//   subsets: ["latin"],
//   weight: ["300", "400", "500"],
// });

export const metadata: Metadata = {
  title: "Expensely - Track and Manage Your Expenses",
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
