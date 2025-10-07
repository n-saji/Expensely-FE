"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import validateToken from "@/utils/validate_token";

import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/slices/userSlice";
import GoogleLogo from "@/assets/icon/google-logo.png";
import Image from "next/image";

import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    validateToken().then((isValid) => {
      if (isValid) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, phone: username, password }),
      });
      if (res.ok) {
        const data = await res.json();

        if (data.error === "") {
          setError("");
          if (rememberMe) {
            localStorage.setItem("token", data.token);
            sessionStorage.removeItem("token");
          } else {
            sessionStorage.setItem("token", data.token);
            localStorage.removeItem("token");
          }
          localStorage.setItem("user_id", data.id);

          const response = await fetch(`${API_URL}/users/${data.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();

            dispatch(
              setUser({
                email: data.user.email,
                isAuthenticated: true,
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
                profilePicFilePath: data.user.profilePicFilePath,
                profileComplete: data.user.profileComplete,
                profilePictureUrl: data.user.profilePictureUrl,
              })
            );
            localStorage.setItem("theme", data.user.theme);

            router.push("/dashboard");
          } else {
            const error = await response.json();
            console.error("Error fetching user data:", error);
            setError(error.error || "Failed to fetch user data");
            return;
          }
        } else {
          setLoading(false);
          dispatch(setUser(null));
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user_id");
          setError(data.message || "Login failed");
        }
      } else {
        const errorData = await res.json();
        setLoading(false);
        dispatch(clearUser());
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setError(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoading(false);
      dispatch(clearUser());
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user_id");
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <form className="space-y-5 w-full">
      <div className="flex flex-col space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : ""}`}
            placeholder="email or phone number"
            required
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            value={username}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : ""}`}
            placeholder="••••••••"
            required
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            value={password}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 "
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className={`button-green w-full py-2
            ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          onClick={(event) => handleSubmit(event)}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="flex items-center justify-between">
          <hr className="w-full border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
            OR
          </span>
          <hr className="w-full border-gray-300 dark:border-gray-600" />
        </div>

        <button
          type="button"
          className="button-white w-full py-2"
          onClick={() => {
            handleGoogleLogin();
          }}
        >
          <Image
            src={GoogleLogo}
            alt="Google Logo"
            width={20}
            className="inline mr-2"
          />
          <span className="sm:inline">Log in with Google</span>
        </button>

        <div
          className="mt-4 flex flex-col items-center justify-center space-y-4
      text-center "
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {`Don't have an account? `}
            <a href="/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>

          <Link
            href="/forgot-password"
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <div className={`text-red-500  ${error ? "block" : "hidden"} text-sm`}>
        {error.charAt(0).toUpperCase() + error.slice(1)}
      </div>
    </form>
  );
}
