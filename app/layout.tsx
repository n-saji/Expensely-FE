import type { Metadata } from "next";
import "./globals.css";
import { Poppins, DM_Mono } from "next/font/google";
import ReduxProvider from "@/redux/provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dmmono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

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
      <body
        className={`antialiased ${poppins.className} ${dmMono.variable} bg-gray-200 dark:bg-gray-900  dark:text-gray-200`}
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
