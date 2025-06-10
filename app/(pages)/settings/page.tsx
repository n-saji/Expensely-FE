"use client";
import { SettingsCard } from "@/components/card";
import EditIcon from "@/app/assets/icon/edit.png";
import ConfirmIcon from "@/app/assets/icon/accept.png";
import CancelIcon from "@/app/assets/icon/cancel.png";
import Image from "next/image";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import { API_URL } from "@/config/config";
import FetchToken from "@/utils/fetch_token";
import UserPreferences from "@/utils/userPreferences";

export default function DashboardPage() {
  const [enablePasswordUpdate, setEnablePasswordUpdate] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changesMade, setChangesMade] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const token = FetchToken();
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
      setError("Password cannot be empty.");
      setSuccess(null);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSuccess(null);
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
          dispatch(setUser(data.user));
          setPassword("");
          setEnablePasswordUpdate(false);
          setSuccess("Password updated successfully!");
          setError(null);
        } else {
          setError(data.message || "Failed to update password.");
          setSuccess(null);
        }
      })
      .catch((err) => {
        console.error("Error updating password:", err);
        setError("An error occurred while updating the password.");
        setSuccess(null);
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
          setSuccess("User settings updated successfully!");
          setError(null);
        } else {
          setError(data.message || "Failed to update user settings.");
          setSuccess(null);
        }
      })
      .catch((err) => {
        console.error("Error updating user settings:", err);
        setError("An error occurred while updating user settings.");
        setSuccess(null);
      });
  };

  const handleUserDeletion = async () => {
    if (!user.id) {
      setError("User ID is required for deletion.");
      setSuccess(null);
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
          setSuccess("Account deleted successfully!");
          setError(null);

          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("theme");
        } else {
          setError(data.message || "Failed to delete account.");
          setSuccess(null);
        }
      })
      .catch((err) => {
        console.error("Error deleting account:", err);
        setError("An error occurred while deleting the account.");
        setSuccess(null);
      });
  };

  return (
    <div className="flex flex-col w-full items-center space-y-6 ">
      <SettingsCard
        title="Update Password"
        description="Change your password to keep your account secure."
        className=""
      >
        <div className="flex items-center space-x-2 max-w-1/2">
          <input
            type={enablePasswordUpdate ? "text" : "password"}
            placeholder="Enter new password"
            className={`p-2 border border-gray-300 rounded placeholder:text-gray-500 text-gray-900 dark:bg-gray-800 dark:text-gray-200 
            ${
              enablePasswordUpdate
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }
              `}
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
            <div>
              <Image
                src={ConfirmIcon}
                alt="Confirm Icon"
                className="w-6 h-6 ml-2 inline-block cursor-pointer"
                onClick={async () => {
                  if (!changesMade) {
                    setError("No changes made to update.");
                    setSuccess(null);
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
              src={EditIcon}
              alt="Edit Icon"
              className="w-4 h-4 ml-2 inline-block cursor-pointer"
              onClick={() => setEnablePasswordUpdate(!enablePasswordUpdate)}
            />
          )}
        </div>
      </SettingsCard>
      <SettingsCard
        title="Dark Mode"
        description="Toggle dark mode for a better viewing experience."
      >
        <div className="flex justify-center items-center space-x-4">
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
        <div className="flex justify-center items-center space-x-4">
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
        title="Delete Account"
        description="Permanently delete your account. This action cannot be undone."
      >
        <div className="flex justify-center items-center space-x-4">
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
              setSuccess("Account deleted successfully!");
              setError(null);
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

      <div
        className={`fixed w-80 bottom-10 -right-80  text-white 
          p-4 text-left rounded-md flex justify-between items-center shadow-lg
          ${error ? "bg-red-500" : success ? "bg-green-500" : "bg-gray-500"}
          ${
            error || success ? "-translate-x-85" : "translate-x-80"
          } transition-all duration-400 ease-in-out`}
      >
        {error && <div>{error}</div>}
        {success && <div>{success}</div>}
        <button
          className=" text-white underline text-sm cursor-pointer"
          onClick={() => {
            setError(null);
            setSuccess(null);
          }}
        >
          Close
        </button>
      </div>
      <UserPreferences />
    </div>
  );
}
