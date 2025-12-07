"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import validateToken from "@/utils/validate_token";

import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@/redux/slices/userSlice";
import GoogleLogo from "@/assets/icon/google-logo.png";
import Image from "next/image";

import { signIn } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { RootState } from "@/redux/store";
import { Spinner } from "@/components/ui/spinner";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    validateToken().then((isValid) => {
      if (isValid) {
        dispatch(
          setUser({
            ...user,
            isAuthenticated: true,
          })
        );
        router.push("/dashboard");
      }

      setLoading(false);
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
      const payload = {
        email: username,
        password: password,
        phone: username,
      };
      const res = await api.post(`/users/login`, payload);
      if (res.status === 200) {
        const data = await res.data;

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

          const response = await api.get(`/users/${data.id}`);
          if (response.status === 200) {
            const data = await response.data;

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
            const error = await response.data;
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
        const errorData = await res.data;
        setLoading(false);
        dispatch(clearUser());
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setError(errorData.error || "Login failed");
      }
    } catch (error) {
      setLoading(false);
      dispatch(clearUser());
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user_id");
      setError(
        `An unexpected error occurred. Please try again. Error: ${error}`
      );
    }
  };

  const handleGoogleLogin = async () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <form className="space-y-5 w-full">
      <div className="flex flex-col space-y-4">
        <div>
          <Label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : ""}`}
            placeholder="email or phone number"
            required
            autoComplete="username"
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            value={username}
          />
        </div>

        <div>
          <Label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : ""}`}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            value={password}
          />
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Input
            type="checkbox"
            className="w-4 h-4"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            id="rememberMe"
          />
          <Label className="" htmlFor="rememberMe">
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          className={`button-green w-full py-2
            ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          onClick={(event) => handleSubmit(event)}
          disabled={loading}
        >
          {loading ? <Spinner /> : "Log In"}
        </Button>

        <div className="flex items-center justify-between">
          <hr className="w-full border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
            OR
          </span>
          <hr className="w-full border-gray-300 dark:border-gray-600" />
        </div>

        <Button
          type="button"
          variant={"outline"}
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
        </Button>

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
