"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import { API_URL } from "@/config/config";
import UserPreferences from "@/utils/userPreferences";
// import { motion } from "motion/react"
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
  THEME_COLOR_OPTIONS,
  ThemeColorId,
} from "@/global/constants";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      const response = await api.get(`/users/me`);
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
            themeColor:
              data.user.themeColor ?? data.user.theme_color ?? user.themeColor,
            language: data.user.language,
            isActive: data.user.isActive,
            isAdmin: data.user.isAdmin,
            notificationsEnabled: data.user.notificationsEnabled,
            alertsEnabled: data.user.alerts_enabled ?? data.user.alertsEnabled,
          }),
        );
      } else {
        toast.error("Failed to fetch user profile data.");
      }
    };
    fetchData();
  }, []);

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
    themeColor,
    notification,
    alertsEnabled,
  }: {
    theme?: string | null;
    themeColor?: ThemeColorId | null;
    notification?: boolean | null;
    alertsEnabled?: boolean | null;
  }) => {
    await api
      .patch(`/users/update-settings`, {
        id: user.id,
        ...(theme !== undefined && theme !== null ? { theme } : {}),
        ...(themeColor !== undefined && themeColor !== null
          ? { themeColor }
          : {}),
        ...(notification !== undefined && notification !== null
          ? { notificationsEnabled: notification }
          : {}),
        ...(alertsEnabled !== undefined && alertsEnabled !== null
          ? { alerts_enabled: alertsEnabled }
          : {}),
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
          localStorage.removeItem("user_id");
          localStorage.removeItem("theme");
          localStorage.removeItem("themeColor");
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
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Preferences
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account preferences and security.
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
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
                      }),
                    );
                    await handleUserUpdation({
                      theme: user.theme === "dark" ? "light" : "dark",
                    });
                  }}
                />
              </CardAction>
            </CardHeader>
          </Card>

          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Theme Color</CardTitle>
              <CardDescription>
                Pick a color preset for highlights across the app.
              </CardDescription>
              <CardAction>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {THEME_COLOR_OPTIONS.map((option) => {
                      const isSelected =
                        (user.themeColor || DEFAULT_THEME_COLOR) === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-label={`Select ${option.label} theme color`}
                          title={option.label}
                          onClick={() => {
                            const nextColor = THEME_COLOR_IDS.includes(
                              option.id,
                            )
                              ? option.id
                              : DEFAULT_THEME_COLOR;

                            dispatch(
                              setUser({
                                ...user,
                                themeColor: nextColor as ThemeColorId,
                              }),
                            );
                            handleUserUpdation({
                              themeColor: nextColor as ThemeColorId,
                            });
                          }}
                          className={`h-8 w-8 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            isSelected
                              ? "border-foreground scale-110"
                              : "border-border/70 hover:scale-105"
                          }`}
                          style={{ backgroundColor: option.swatch }}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardAction>
            </CardHeader>
          </Card>

          <UserPreferences />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Dashboard Alerts</CardTitle>
              <CardDescription>
                Show or hide the alerts banner on the dashboard.
              </CardDescription>
              <CardAction>
                <Switch
                  checked={user.alertsEnabled}
                  onClick={async () => {
                    const nextValue = !user.alertsEnabled;

                    dispatch(
                      setUser({
                        ...user,
                        alertsEnabled: nextValue,
                      }),
                    );
                    await handleUserUpdation({
                      alertsEnabled: nextValue,
                    });
                  }}
                />
              </CardAction>
            </CardHeader>
          </Card>

          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Enable or disable notifications for important updates.
              </CardDescription>
              <CardAction>
                <Switch
                  checked={user.notificationsEnabled}
                  onClick={async () => {
                    const nextValue = !user.notificationsEnabled;

                    dispatch(
                      setUser({
                        ...user,
                        notificationsEnabled: nextValue,
                      }),
                    );
                    await handleUserUpdation({
                      notification: nextValue,
                    });
                  }}
                />
              </CardAction>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
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

          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
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
                      "Are you sure you want to delete your account? This action cannot be undone.",
                    );
                    if (
                      !window.confirm(
                        "Are you sure you want to delete your account?",
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
