"use client";
import { API_URL } from "@/config/config";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface UsersData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  country_code: string;
  phone: string;
  createdAt: string;
  currency: string;
  theme: string;
  language: string;
  isActive: boolean;
  profilePicFilePath: string;
  profileComplete: boolean;
  notificationsEnabled: boolean;
  oauth2User: boolean;
}

async function FetchAdminData() {
  // This function can be used to fetch any admin-specific data if needed
  // For now, it just returns a placeholder
  const response = await fetch(`${API_URL}/users/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin data");
  }
  const data = await response.json();
  return data as UsersData[];
}

export default function AdminUI() {
  const user = useSelector((state: RootState) => state.user);
  const [adminData, setAdminData] = useState<UsersData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin data only if the user is an admin

  useEffect(() => {
    if (user.isAdmin) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await FetchAdminData();
          setAdminData(data);
        } catch (err) {
          setError("Failed to fetch admin data: " + err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, []);

  return (
    <div className="flex items-center justify-center  bg-primary-color w-full">
      {user.isAdmin && (
        <div className="w-full">
          <h1 className="text-2xl font-bold dark:text-white text-black">
            Accounts
          </h1>
          <table
            className="w-full h-full divide-y divide-gray-700 dark:divide-transparent shadow-lg rounded-lg 
            overflow-hidden text-xs sm:text-sm my-8
            "
          >
            <thead
              className="bg-gray-100 text-gray-700 
            dark:bg-gray-800 dark:text-gray-200 "
            >
              <tr className="text-left">
                <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold">
                  Name
                </th>
                <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold">
                  Email
                </th>
                <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold">
                  Created At
                </th>
                <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold">
                  Active
                </th>
                <th className="px-1 py-3 sm:px-4 sm:py-3 font-semibold">
                  Profile Completed
                </th>
              </tr>
            </thead>

            {loading && (
              <tbody
                className="bg-white divide-y 
              dark:bg-gray-900 dark:text-gray-200 dark:divide-gray-700"
              >
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <p className="text-gray-500">
                      {loading ? "Loading..." : "No users found"}
                    </p>
                  </td>
                </tr>
              </tbody>
            )}
            {!loading && (
              <tbody
                className="bg-white
              dark:bg-gray-900 dark:text-gray-200
              divide-y dark:divide-gray-700 divide-gray-200"
              >
                {adminData.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-100 py-3  dark:hover:bg-gray-950 
                  transition-colors  divide-gray-200 "
                  >
                    <td className="px-1 py-3 sm:px-4 sm:py-3">{user.name}</td>
                    <td className="px-1 py-3 sm:px-4 sm:py-3">{user.email}</td>
                    <td className="px-1 py-3 sm:px-4 sm:py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-1 py-3 sm:px-4 sm:py-3">
                      {user.isActive ? "Yes" : "No"}
                    </td>
                    <td className="px-1 py-3 sm:px-4 sm:py-3">
                      {user.profileComplete ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}
      {!user.isAdmin && (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Access Denied</h1>
          <p className="mt-4 text-lg text-gray-300">
            You do not have permission to access this page.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
