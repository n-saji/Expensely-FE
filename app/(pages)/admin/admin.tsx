"use client";

import api from "@/lib/api";
import { clearCategories } from "@/redux/slices/categorySlice";
import { clearNotifications } from "@/redux/slices/notificationSlice";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AdminUserRow, columns } from "./columns";
import { DataTable } from "./data-table";

async function FetchAdminData() {
  const response = await api.get(`/users/all`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch admin data");
  }
  const data = response.data;
  return data as AdminUserRow[];
}

export default function AdminUI() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [adminData, setAdminData] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);

  const forceLogout = useCallback(() => {
    dispatch(clearCategories());
    dispatch(clearNotifications());
    dispatch(clearUser());

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user_id");
      window.localStorage.removeItem("theme");
      window.localStorage.removeItem("persist:root");
      window.location.href = "/login";
    }
  }, [dispatch]);

  const applyUserUpdate = useCallback(
    (updatedUser: AdminUserRow) => {
      setAdminData((prev) =>
        prev.map((u) =>
          u.id === updatedUser.id ? { ...u, ...updatedUser } : u,
        ),
      );

      if (updatedUser.id === user.id) {
        dispatch(
          setUser({
            ...user,
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            country_code: updatedUser.country_code,
            phone: updatedUser.phone,
            currency: updatedUser.currency,
            theme: updatedUser.theme,
            language: updatedUser.language,
            isActive: updatedUser.isActive,
            isAdmin: updatedUser.isAdmin,
            notificationsEnabled: updatedUser.notificationsEnabled,
            profilePicFilePath: updatedUser.profilePicFilePath || "",
            profileComplete: updatedUser.profileComplete,
          }),
        );

        if (!updatedUser.isActive) {
          forceLogout();
        }
      }
    },
    [dispatch, forceLogout, user],
  );

  const handleOpenEdit = useCallback((row: AdminUserRow) => {
    setSelectedUser(row);
    setIsEditDialogOpen(true);
  }, []);

  const tableColumns = useMemo(
    () => columns({ onEdit: handleOpenEdit }),
    [handleOpenEdit],
  );

  const handleUserAction = useCallback(
    async (action: "activate" | "deactivate" | "set-admin") => {
      if (!selectedUser) {
        return;
      }

      setIsUpdatingAction(true);
      try {
        const endpoint =
          action === "activate"
            ? `/admins/users/${selectedUser.id}/activate`
            : action === "deactivate"
              ? `/admins/users/${selectedUser.id}/deactivate`
              : `/admins/users/${selectedUser.id}/set-admin`;

        const response = await api.patch(endpoint);
        if (response.status !== 200 || !response.data?.user?.id) {
          throw new Error(response.data?.error || "Failed to update user");
        }

        const updatedUser = response.data.user as AdminUserRow;
        applyUserUpdate(updatedUser);
        setSelectedUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));

        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
      } catch (actionError) {
        toast.error(String(actionError));
      } finally {
        setIsUpdatingAction(false);
      }
    },
    [applyUserUpdate, selectedUser],
  );

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
  }, [user.isAdmin]);

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
          {loading ? (
            <div className="rounded-2xl border border-border/70 bg-background/80 p-6 text-sm text-muted-foreground shadow-sm">
              Loading users...
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-background/80 p-2 shadow-sm">
              <DataTable columns={tableColumns} data={adminData} />
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update access controls for the selected user.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={selectedUser?.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={selectedUser?.email || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={selectedUser?.phone || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={selectedUser?.isAdmin ? "Admin" : "User"}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input
                    value={selectedUser?.isActive ? "Active" : "Inactive"}
                    readOnly
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                {selectedUser && !selectedUser.isAdmin && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      void handleUserAction("set-admin");
                    }}
                    disabled={isUpdatingAction}
                  >
                    Make Admin
                  </Button>
                )}

                {selectedUser?.isActive ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      void handleUserAction("deactivate");
                    }}
                    disabled={isUpdatingAction}
                  >
                    Deactivate User
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      void handleUserAction("activate");
                    }}
                    disabled={isUpdatingAction}
                  >
                    Activate User
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
