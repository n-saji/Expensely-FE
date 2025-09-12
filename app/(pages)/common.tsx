"use client";
import React, { useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";

import Link from "next/link";
import UserPreferences from "@/utils/userPreferences";
import Loader from "@/components/loader";
import FetchToken from "@/utils/fetch_token";

export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
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
  const router = useRouter();
  const loading = useSelector((state: RootState) => state.sidebar.loading);
  // conditional pathnames
  if (pathname === "/expense/add") {
    isLink = true;
    reactLink = (
      <div className="flex items-center space-x-2">
        <Link href="/expense" className="hover:underline">{`Expense`}</Link>
        <span className="text-gray-500">{" > "}</span>
        <Link href="/expense/add" className="hover:underline">
          Add
        </Link>
      </div>
    );
  } else if (pathname === "/category/add") {
    isLink = true;
    reactLink = (
      <div className="flex items-center space-x-2">
        <Link href="/category" className="hover:underline">{`Category`}</Link>
        <span className="text-gray-500">{" > "}</span>
        <Link href="/category/add" className="hover:underline">
          Add
        </Link>
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

  if (!user.isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl">
        <h1 className="text-gray-700">Please log in to continue. </h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  if (user.profileComplete === false) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl">
        <h1 className="text-gray-700">
          Please complete your profile to continue.&nbsp;
        </h1>
        <button
          onClick={() => {
            router.push("/complete-profile");
          }}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          Complete Profile
        </button>
      </div>
    );
  }

  return (
    <>
      {loading && <Loader />}
      <div
        className={`w-full flex min-h-screen bg-primary-color min-sm:relative
          dark:text-gray-200
        `}
      >
        <Sidebar />

        <div
          className={`w-full ${
            isOpen ? "min-lg:ml-64" : "min-lg:ml-0"
          } transition-all duration-300`}
        >
          <Navbar
            title={pathname}
            isLink={isLink}
            ReactLink={reactLink}
            addButton={
              pathname === "Expense" ? (
                <Link href="/expense/add">
                  <button
                    className="button-green-outline p-0 px-1.5 text-sm sm:py-1 sm:px-3 sm:text-md
                  "
                  >
                    {deviceWidth < 640 ? "+" : "Add Expense"}
                  </button>
                </Link>
              ) : pathname === "Category" ? (
                <Link href="/category/add">
                  <button className="button-green-outline p-1 px-1.5 text-sm sm:py-1 sm:px-3 sm:text-md">
                    {deviceWidth < 640 ? "+" : "Add Category"}
                  </button>
                </Link>
              ) : null
            }
          />

          <div className="px-8 pt-24 flex flex-col space-y-4 w-full items-center overflow-auto min-h-full ">
            {children}
          </div>
        </div>
        <UserPreferences />
      </div>
    </>
  );
}
