"use client";
import { SettingsCard } from "@/components/card";
import EditIcon from "@/assets/icon/edit.png";
import EditIconWhite from "@/assets/icon/edit-white.png";
import ConfirmIcon from "@/assets/icon/accept.png";
import CancelIcon from "@/assets/icon/cancel.png";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import { API_URL } from "@/config/config";
import FetchToken from "@/utils/fetch_token";
import UserPreferences from "@/utils/userPreferences";
import { toast } from "sonner";

export default function SettingsPage() {
  const [enablePasswordUpdate, setEnablePasswordUpdate] = useState(false);
  const [password, setPassword] = useState("");
  const [changesMade, setChangesMade] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const token = FetchToken();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    console.log("Fetching user profile data...");

    const fetchData = async () => {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
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
    await fetch(`${API_URL}/users/update-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: password,
        id: user.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error === null) {
          // dispatch(setUser(data.user));
          setPassword("");
          setEnablePasswordUpdate(false);
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
    await fetch(`${API_URL}/users/update-settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...user,
        theme: theme || user.theme,
        notificationsEnabled:
          notification !== null ? notification : user.notificationsEnabled,
      }),
    })
      .then((res) => res.json())
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
    await fetch(`${API_URL}/users/delete-account/${user.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((res) => res.json())
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
      <SettingsCard
        title="Dark Mode"
        description="Toggle dark mode for a better viewing experience."
      >
        <div className="flex justify-left sm:justify-center items-center space-x-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={user.theme === "dark"}
              onChange={async () => {
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
          </label>
        </div>
      </SettingsCard>
      <SettingsCard
        title="Notifications"
        description="Manage your notification preferences."
      >
        <div className="flex justify-left sm:justify-center items-center space-x-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={user.notificationsEnabled}
              onChange={async () => {
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
          </label>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Update Password"
        description="Change your password to keep your account secure."
        className=""
      >
        <div className="flex items-center justify-between space-x-2 max-w-3/4">
          <input
            type={enablePasswordUpdate ? "text" : "password"}
            placeholder="Enter new password"
            className={`p-2 border border-gray-300 rounded
               placeholder:text-gray-500 text-gray-900 dark:bg-gray-800 dark:text-gray-200 
            ${
              enablePasswordUpdate
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }
              w-full`}
            disabled={!enablePasswordUpdate}
            autoComplete="new-password"
            value={password}
            onChange={async (e) => {
              setPassword(e.target.value);
              if (!enablePasswordUpdate) return;

              setChangesMade(true);
            }}
          />
          {enablePasswordUpdate ? (
            <div className="flex items-center space-x-2">
              <Image
                src={ConfirmIcon}
                alt="Confirm Icon"
                className="w-6 h-6 ml-2 inline-block cursor-pointer"
                onClick={async () => {
                  if (!changesMade) {
                    toast.error("No changes made to update.");
                    return;
                  }
                  await handlePasswordChange();
                  setEnablePasswordUpdate(false);
                }}
              />
              <Image
                src={CancelIcon}
                alt="Cancel Icon"
                className="w-6 h-6 ml-2 inline-block cursor-pointer"
                onClick={() => {
                  setEnablePasswordUpdate(false);
                }}
              />
            </div>
          ) : (
            <Image
              src={user.theme === "light" ? EditIcon : EditIconWhite}
              alt="Edit Icon"
              className="w-4 h-4 ml-2 inline-block cursor-pointer"
              onClick={() => setEnablePasswordUpdate(!enablePasswordUpdate)}
            />
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Delete Account"
        description="Permanently delete your account. This action cannot be undone."
      >
        <div className="flex justify-left sm:justify-center items-center space-x-4">
          <button
            className="button-delete py-2 dark:bg-red-600 dark:hover:bg-red-700"
            onClick={async () => {
              alert(
                "Are you sure you want to delete your account? This action cannot be undone."
              );
              if (
                !window.confirm("Are you sure you want to delete your account?")
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
          </button>
        </div>
      </SettingsCard>

      <UserPreferences />
    </div>
  );
}
