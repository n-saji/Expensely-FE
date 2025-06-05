"use client";

import Logout from "../(auth)/logout/logout";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex  justify-center bg-gray-200">
      {/* sidebar */}
      <Sidebar />
      <div className="w-full">
        {/* Navbar */}
        <nav className="w-full px-6 py-5 bg-white shadow-md flex justify-between items-center">
          <div className="space-x-4 flex">
            <img alt="hamburger menu" className="w-6 h-6" />
            <a href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </a>
            <button
              className="text-sm hover:underline"
              onClick={async () => {
                Logout()
                  .then(() => {
                    router.push("/");
                  })
                  .catch((error) => {
                    console.error("Logout failed:", error);
                  });
              }}
            >
              Logout
            </button>
          </div>
        </nav>
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
