"use client";
import Logo from "@/components/logo";
import Logout from "../(auth)/logout/logout";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex  justify-center bg-gray-200">
      {/* sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700">Sidebar</h2>
        <ul className="mt-2 space-y-2">
          <li>
            <a
              href="/profile"
              className="text-sm text-gray-600 hover:underline"
            >
              Profile
            </a>
          </li>
          <li>
            <a
              href="/settings"
              className="text-sm text-gray-600 hover:underline"
            >
              Settings
            </a>
          </li>
        </ul>
      </aside>
      <div className="w-full">
        {/* Navbar */}
        <nav className="w-full px-6 py-4 bg-white shadow-md flex justify-between items-center">
          <Logo />
          <div className="space-x-4">
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
