"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import validateToken from "@/utils/validate_token";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).finally(() => {
      setLoading(false);
    });
    if (res.ok) {
      const data = await res.json();

      if (data.error === "") {
        setError("");
        if (rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }
        localStorage.setItem("user", JSON.stringify(data.user));

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
              phone_number: data.user.phone_number,
              currency: data.user.currency,
            })
          );
        } else {
          const error = await response.json();
          console.error("Error fetching user data:", error);
          setError(error.error || "Failed to fetch user data");
          return;
        }

        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } else {
      const errorData = await res.json();
      setError(errorData.message || "Login failed");
    }
  };

  return (
    <form className="space-y-5 w-full">
      <div className="">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`mt-1 w-full px-4 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : ""}`}
          placeholder="you@example.com"
          required
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          value={email}
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
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

      <div className="flex items-center justify-between text-sm text-gray-600">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 cursor-pointer"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="button-green w-full"
        onClick={(event) => handleSubmit(event)}
        disabled={loading}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
      <p className="mt-4 text-sm text-gray-600">
        {`Don't have an account?`}
        <a href="/register" className="text-blue-500 hover:underline">
          Sign up
        </a>
      </p>

      <div className={`text-red-500 absolute ${error ? "block" : "hidden"}`}>
        {error.charAt(0).toUpperCase() + error.slice(1)}
      </div>
    </form>
  );
}
