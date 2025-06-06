"use client";
import React from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);

  return (
    <div className="w-full flex h-screen bg-gray-200 min-sm:relative">
      <Sidebar />

      <div
        className={`w-full ${
          isOpen ? "min-sm:ml-64" : "min-sm:ml-0"
        } transition-all duration-300`}
      >
        <Navbar title="Dashboard" />

        <div className="p-8 pt-24 flex flex-col space-y-4 w-full items-center overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
