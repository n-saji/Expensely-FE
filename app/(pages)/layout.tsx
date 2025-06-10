"use client";
import React, { useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { usePathname } from "next/navigation";

import Link from "next/link";
import UserPreferences from "@/utils/userPreferences";

export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);
  const user = useSelector((state: RootState) => state.user);
  const [deviceWidth, setDeviceWidth] = React.useState<number>(
    window.innerWidth
  );
  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let pathname = usePathname();
  let reactLink = null;
  let isLink = false;
  // conditional pathnames
  if (pathname === "/expense/add") {
    isLink = true;
    reactLink = (
      <div className="flex items-center space-x-2">
        <Link href="/expense">{`Expense`}</Link>
        <span className="text-gray-500">{" > "}</span>
        <Link href="/expense/add">Add Expense</Link>
      </div>
    );
  } else if (pathname === "/category/add") {
    isLink = true;
    reactLink = (
      <div className="flex items-center space-x-2">
        <Link href="/category">{`Category`}</Link>
        <span className="text-gray-500">{" > "}</span>
        <Link href="/category/add">Add Category</Link>
      </div>
    );
  } else {
    pathname = pathname.charAt(1).toUpperCase() + pathname.slice(2);
  }

  const popUp = useSelector((state: RootState) => state.sidebar.popUpEnabled);

  useEffect(() => {
    document.body.style.overflow = popUp ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [popUp]);

  if (!user.isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl text-gray-700">Please log in to continue.</h1>
      </div>
    );
  }

  return (
    <div className="w-full flex min-h-screen bg-gray-200 min-sm:relative dark:bg-gray-900 dark:text-gray-200">
      <Sidebar />

      <div
        className={`w-full ${
          isOpen ? "min-sm:ml-64" : "min-sm:ml-0"
        } transition-all duration-300`}
      >
        <Navbar
          title={pathname}
          isLink={isLink}
          ReactLink={reactLink}
          addButton={
            pathname === "Expense" ? (
              <Link href="/expense/add">
                <button className="button-green-outline p-0 px-1.5 text-md sm:py-0 sm:px-3 sm:text-md">
                  {deviceWidth < 640 ? "+" : "+ Add Expense"}
                </button>
              </Link>
            ) : null
          }
        />

        <div className="p-8 pt-24 flex flex-col space-y-4 w-full items-center overflow-auto">
          {children}
        </div>
      </div>
      <UserPreferences />
    </div>
  );
}
