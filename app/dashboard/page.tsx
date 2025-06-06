"use client";
import Card from "@/components/card";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function DashboardPage() {
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);

  return (
    <div className="w-full min-h-screen flex  justify-center bg-gray-200 min-sm:relative">
      <Sidebar />

      <div
        className={`w-full ${
          isOpen ? "min-sm:ml-64" : "min-sm:ml-0"
        } transition-all duration-300`}
      >
        <Navbar title="Dashboard" />
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
