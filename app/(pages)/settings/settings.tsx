"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import { API_URL } from "@/config/config";
import UserPreferences from "@/utils/userPreferences";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Dot, Edit2, Globe, LogOut, Monitor, RefreshCw, Smartphone } from "lucide-react";
import api from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import {
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
  THEME_COLOR_OPTIONS,
  ThemeColorId,
} from "@/global/constants";
import { currencyCodes, currencyMap } from "@/utils/currencyMapper";
import { UAParser } from "ua-parser-js";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const hasFetchedRef = useRef(false);
  const orderedCurrencyCodes = useMemo(() => {
    if (!user.currency) return currencyCodes;
    return [
      user.currency,
      ...currencyCodes.filter((code) => code !== user.currency),
    ];
  }, [user.currency]);

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

  const handleCurrencyUpdate = async (currency: string) => {
    const isProfileComplete =
      Boolean(user.name) &&
      Boolean(user.email) &&
      Boolean(user.country_code) &&
      Boolean(user.phone);

    try {
      const response = await api.patch(`/users/update-profile`, {
        name: user.name,
        email: user.email,
        country_code: user.country_code,
        phone: user.phone,
        currency,
        id: user.id,
        profileComplete: isProfileComplete,
      });

      if (response.status !== 200) {
        throw new Error("Failed to update preferred currency.");
      }

      dispatch(
        setUser({
          ...user,
          currency,
          profileComplete: isProfileComplete,
        }),
      );
      toast.success("Preferred currency updated.");
      return true;
    } catch (error) {
      console.error("Error updating currency:", error);
      toast.error("Failed to update preferred currency.");
      return false;
    }
  };

  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);
  const [currencyDraft, setCurrencyDraft] = useState<string>(
    user.currency || "USD",
  );
  const [currencySaving, setCurrencySaving] = useState(false);

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

          <Card className="w-full border-border/70 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Preferred Currency</CardTitle>
              <CardDescription>
                Set the default currency for your expense display.
              </CardDescription>
              <CardAction>
                <Dialog
                  open={isCurrencyDialogOpen}
                  onOpenChange={(open) => {
                    setIsCurrencyDialogOpen(open);
                    if (open) setCurrencyDraft(user.currency || "USD");
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <span className="font-medium">
                        {user.currency || "USD"}
                      </span>
                      <span className="text-muted-foreground">
                        {currencyMap[user.currency || "USD"] ||
                          user.currency ||
                          "USD"}
                      </span>
                      <Edit2 className="ml-1" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Preferred Currency</DialogTitle>
                      <DialogDescription>
                        Choose your default currency for expense display.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="mt-2 space-y-4">
                      <Label>Currency</Label>
                      <Select
                        value={currencyDraft}
                        onValueChange={setCurrencyDraft}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderedCurrencyCodes.map((code) => (
                            <SelectItem key={code} value={code}>
                              <span className="flex items-center gap-2">
                                <span className="font-medium">{code}</span>
                                <span className="text-muted-foreground">
                                  {currencyMap[code] || code}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setIsCurrencyDialogOpen(false)}
                        disabled={currencySaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          setCurrencySaving(true);
                          const ok = await handleCurrencyUpdate(currencyDraft);
                          setCurrencySaving(false);
                          if (ok) setIsCurrencyDialogOpen(false);
                        }}
                        disabled={currencySaving}
                      >
                        {currencySaving ? (
                          <>
                            <Spinner /> Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

          <Sessions />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type SessionStruct = {
  ipAddress: string;
  deviceId: string;
  userId: string;
  lastSeen: string;
  current: boolean | string;
  parser?: UAParser;
};

function Sessions() {
  const [sessions, setSessions] = useState<Map<string, SessionStruct>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/sessions/get-all`);

      const data = (await response.data) as Record<string, SessionStruct>;
      Object.entries(data).forEach(
        ([key, session]: [string, SessionStruct]) => {
          session.current = session.current === "true";
          const parser = new UAParser(session.deviceId);
          session.parser = parser;
          setSessions((prev) => new Map(prev).set(key, session));
        },
      );
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeOtherSessions = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        await api.delete(`/users/sessions/id/${token}`);
        toast.success("Other sessions revoked successfully!");
        fetchSessions();
      } catch (err) {
        console.error("Error revoking sessions:", err);
        toast.error("Failed to revoke other sessions.");
      } finally {
        setLoading(false);
      }
    },
    [fetchSessions],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            View and manage your active sessions across devices.
          </CardDescription>
        </div>
        <CardAction>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchSessions}
            title="Refresh sessions"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin text-muted-foreground" : "text-foreground"}`}
            /> 
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6 text-sm text-muted-foreground border rounded-lg border-dashed">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
            Loading sessions...
          </div>
        ) : sessions.size === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20">
            <p className="text-sm font-medium text-foreground">
              No active sessions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You are currently logged out of all other devices.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(sessions.entries()).map(([key, session]) => {
              const isMobile = session.parser?.getDevice().type === "mobile";
              const deviceName =
                session.parser?.getDevice().model ||
                session.deviceId ||
                "Unknown Device";
              const browserName =
                session.parser?.getBrowser().name || "Unknown Browser";
              const osName = session.parser?.getOS().name || "Unknown OS";

              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/30 ${
                    session.current
                      ? "border-primary/30 bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-secondary rounded-full text-secondary-foreground">
                      {isMobile ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none">
                          {deviceName}
                        </p>
                        {session.current && (
                          <span className="bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-muted-foreground">
                        {browserName} on {osName}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(
                            parseInt(session.lastSeen),
                          ).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                          {", "}
                          {new Date(
                            parseInt(session.lastSeen),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 ml-12 sm:ml-0 flex-shrink-0">
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={async () => await revokeOtherSessions(key)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
