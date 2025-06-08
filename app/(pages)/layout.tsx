"use client";
import React, { useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { usePathname } from "next/navigation";


export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);
  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const popUp = useSelector((state: RootState) => state.sidebar.popUpEnabled);

  if (!user.isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl text-gray-700">Please log in to continue.</h1>
      </div>
    );
  }
  useEffect(() => {
    document.body.style.overflow = popUp ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [popUp]);

  return (
    <div className="w-full flex h-screen bg-gray-200 min-sm:relative">
      <Sidebar />

      <div
        className={`w-full ${
          isOpen ? "min-sm:ml-64" : "min-sm:ml-0"
        } transition-all duration-300`}
      >
        <Navbar title={pathname.charAt(1).toUpperCase() + pathname.slice(2)} />

        <div className="p-8 pt-24 flex flex-col space-y-4 w-full items-center overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
