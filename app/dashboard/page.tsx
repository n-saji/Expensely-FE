"use client";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function DashboardPage() {
  const [enableSideBar, setEnableSidebar] = useState(true);
  return (
    <div className="w-full min-h-screen flex  justify-center bg-gray-200 relative">
      <Sidebar
        classname={enableSideBar ? "translate-x-0" : "-translate-x-full"}
      />

      <div className={`w-full ${enableSideBar ? "ml-64" : "ml-0"} transition-all duration-300`}>
        {/* Navbar */}
        <Navbar setEnableSidebar={setEnableSidebar} />
        <div className="max-sm:w-85 bg-gray-50 max-sm:p-8 p-16 rounded-2xl shadow-lg w-full max-w-md mt-10 flex flex-col items-center my-4">
          <h1 className="text-3xl font-semibold text-gray-600 pb-8">
            Dashboard
          </h1>
          <p className="text-gray-700">Welcome to your dashboard!</p>
        </div>
      </div>
    </div>
  );
}
