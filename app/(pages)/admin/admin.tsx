"use client";
import api from "@/lib/api";
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
  const response = await api.get(`/users/all`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch admin data");
  }
  const data = response.data;
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
    <div className="w-full space-y-6">
      {user.isAdmin && (
        <div className="w-full space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Administration
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Accounts
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage user access and account status.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-background/80 shadow-sm">
            <table className="w-full text-xs sm:text-sm table-fixed">
              <thead className="bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
                <tbody className="divide-y">
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <p className="text-muted-foreground">
                        {loading ? "Loading..." : "No users found"}
                      </p>
                    </td>
                  </tr>
                </tbody>
              )}
              {!loading && (
                <tbody className="divide-y">
                  {adminData.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-1 py-3 sm:px-4 sm:py-3">{user.name}</td>
                      <td className="px-1 py-3 sm:px-4 sm:py-3">
                        {user.email}
                      </td>
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
        </div>
      )}
      {!user.isAdmin && (
        <div className="text-center rounded-2xl border border-border/70 bg-background/80 p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-foreground">
            Access Denied
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
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
