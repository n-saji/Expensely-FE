"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import { API_URL } from "@/config/config";
import FetchToken from "@/utils/fetch_token";
import UserPreferences from "@/utils/userPreferences";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import api from "@/lib/api";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const token = FetchToken();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      const response = await api.get(`/users/${user.id}`);
      if (response.status === 200) {
        const data = await response.data;
        dispatch(
          setUser({
            ...user,
            email: data.user.email,
            id: data.user.id,
            name: data.user.name,
            country_code: data.user.country_code,
            phone: data.user.phone,
            currency: data.user.currency,
            theme: data.user.theme,
            language: data.user.language,
            isActive: data.user.isActive,
            isAdmin: data.user.isAdmin,
            notificationsEnabled: data.user.notificationsEnabled,
          })
        );
      } else {
        toast.error("Failed to fetch user profile data.");
      }
    };
    fetchData();
  }, []);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">
          Please log in to access settings.
        </h1>
      </div>
    );
  }

  const handlePasswordChange = async () => {
    if (!password) {
      toast.error("Password cannot be empty.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    await api
      .patch(`${API_URL}/users/update-password`, {
        password: password,
        id: user.id,
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.error === null) {
          // dispatch(setUser(data.user));
          setPassword("");
          setConfirmPassword("");
          toast.success("Password updated successfully!");
        } else {
          toast.error(data.message || "Failed to update password.");
        }
      })
      .catch((err) => {
        console.error("Error updating password:", err);
        toast.error("An error occurred while updating the password.");
      });
  };

  const handleUserUpdation = async ({
    theme,
    notification,
  }: {
    theme?: string | null;
    notification?: boolean | null;
  }) => {
    await api
      .patch(`/users/update-settings`, {
        ...user,
        theme: theme || user.theme,
        notificationsEnabled:
          notification !== null ? notification : user.notificationsEnabled,
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.error === null) {
          toast.success(`Settings updated successfully!`);
        } else {
          toast.error(data.message || "Failed to update settings.");
        }
      })
      .catch((err) => {
        console.error("Error updating user settings:", err);
        toast.error("An error occurred while updating user settings.");
      });
  };

  const handleUserDeletion = async () => {
    if (!user.id) {
      toast.error("User ID is required for deletion.");
      return;
    }
    await api
      .delete(`${API_URL}/users/delete-account/${user.id}`)
      .then((res) => res.data)
      .then((data) => {
        if (data.error === null) {
          dispatch(setUser({ ...user, isActive: false }));
          toast.success("Account deleted successfully!");

          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("theme");
        } else {
          toast.error(data.message || "Failed to delete account.");
        }
      })
      .catch((err) => {
        console.error("Error deleting account:", err);
        toast.error("An error occurred while deleting the account.");
      });
  };

  return (
    <div className="flex flex-col w-full items-center space-y-6 ">
      <Card className="w-[90%] sm:w-4/5">
        <CardHeader>
          <CardTitle>Dark Mode</CardTitle>
          <CardDescription>
            Toggle dark mode for a better viewing experience.
          </CardDescription>
          <CardAction>
            <Switch
              checked={user.theme === "dark"}
              onClick={async () => {
                dispatch(
                  setUser({
                    ...user,
                    theme: user.theme === "dark" ? "light" : "dark",
                  })
                );
                await handleUserUpdation({
                  theme: user.theme === "dark" ? "light" : "dark",
                });
              }}
            />
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="w-[90%] sm:w-4/5">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences.
          </CardDescription>
          <CardAction>
            <Switch
              checked={user.notificationsEnabled}
              onClick={async () => {
                dispatch(
                  setUser({
                    ...user,
                    notificationsEnabled: !user.notificationsEnabled,
                  })
                );
                await handleUserUpdation({
                  notification: !user.notificationsEnabled,
                });
              }}
            />
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="w-[90%] sm:w-4/5">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
          <CardAction>
            <Dialog>
              <DialogTrigger asChild>
                <Edit2 className="h-5 w-5" />
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password below and click &quot;Save
                    changes&quot;
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handlePasswordChange();
                  }}
                >
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="password-1">Confirm Password</Label>
                      <Input
                        id="password-1"
                        name="password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={
                        password !== confirmPassword || password.length < 6
                      }
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="w-[90%] sm:w-4/5">
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account. This action cannot be undone.
          </CardDescription>
          <CardAction>
            <Button
              variant="destructive"
              onClick={async () => {
                alert(
                  "Are you sure you want to delete your account? This action cannot be undone."
                );
                if (
                  !window.confirm(
                    "Are you sure you want to delete your account?"
                  )
                ) {
                  return;
                }
                handleUserDeletion();
                toast.success("Account deleted successfully!");
                setTimeout(() => {
                  // Redirect to home or login page after deletion
                  window.location.href = "/";
                }, 2000);
              }}
            >
              Delete Account
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <UserPreferences />
    </div>
  );
}
