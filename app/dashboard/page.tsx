"use client";
import Card from "@/components/card";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function DashboardPage() {
  const [enableSideBar, setEnableSidebar] = useState(true);
  return (
    <div className="w-full min-h-screen flex  justify-center bg-gray-200 min-sm:relative">
      <Sidebar
        classname={enableSideBar ? "translate-x-0 " : "-translate-x-full"}
        setEnableSidebar={setEnableSidebar}
      />

      <div
        className={`w-full ${
          enableSideBar ? "min-sm:ml-64" : "min-sm:ml-0"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <Navbar setEnableSidebar={setEnableSidebar} title="Dashboard" />
        <div className="m-8 flex flex-col items-start space-y-4">
          <h1 className="text-gray-700 text-4xl">Welcome to your dashboard!</h1>
          <Card
            title="Card Title"
            description="This is a description for the card."
            className=""
          />
        </div>
      </div>
    </div>
  );
}
