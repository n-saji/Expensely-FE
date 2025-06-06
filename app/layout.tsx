import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import ReduxProvider from "@/redux/provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Expensely - Track and Manage Your Expenses",
  description: "Expensely helps you manage budgets, track spending, and visualize your finances securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${poppins.className} bg-gray-200`}
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
