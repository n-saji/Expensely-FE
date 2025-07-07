"use client";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function AdminUI() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <>
      <div className="flex items-center justify-center  bg-primary-color">
        {user.isAdmin && (
          <>
            <div className="text-center z-10">
              <h1 className="text-4xl font-bold text-white">Admin Page</h1>
              <p className="mt-4 text-lg text-gray-300">
                Welcome to the Admin Page
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Here you can manage your application settings and users.
              </p>
            </div>
          </>
        )}
        {!user.isAdmin && (
          <div className="text-center z-10">
            <h1 className="text-4xl font-bold text-white">Access Denied</h1>
            <p className="mt-4 text-lg text-gray-300">
              You do not have permission to access this page.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Please contact your administrator if you believe this is an error.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
