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
import { AxiosError } from "axios";
import { toast, Toaster } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
          }),
        );
        router.push("/dashboard");
      }

      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields.");
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
          toast.success("Login successful.");
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
              }),
            );
            localStorage.setItem("theme", data.user.theme);

            router.push("/dashboard");
          } else {
            const error = await response.data;
            console.error("Error fetching user data:", error);
            toast.error(error.data || "Failed to fetch user data");
            return;
          }
        } else {
          setLoading(false);
          dispatch(clearUser());
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user_id");
          toast.error(data.message || "Login failed");
        }
      } else {
        const errorData = await res.data;
        setLoading(false);
        dispatch(clearUser());
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user_id");
        toast.error(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      dispatch(clearUser());
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user_id");
      if (error instanceof AxiosError && error.response) {
        toast.error("Internal server error. Please try again later.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    signIn("google", { callbackUrl: "/dashboard" }).catch((error) => {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="username" className="text-sm text-muted-foreground">
            Email or phone
          </Label>
          <Input
            id="username"
            type="text"
            className="mt-2 w-full border-border/70 bg-background"
            placeholder="you@example.com"
            required
            autoComplete="username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            value={username}
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-sm text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            className="mt-2 w-full border-border/70 bg-background"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Input
              type="checkbox"
              className="h-4 w-4"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              id="rememberMe"
            />
            <Label htmlFor="rememberMe" className="text-muted-foreground">
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-emerald-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className={`w-full ${loading ? "opacity-70" : ""}`}
          disabled={loading}
        >
          {loading ? <Spinner /> : "Log In"}
        </Button>

        <div className="flex items-center gap-3">
          <hr className="w-full border-border/60" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            or
          </span>
          <hr className="w-full border-border/60" />
        </div>

        <Button
          type="button"
          variant={"outline"}
          className="w-full"
          onClick={() => {
            handleGoogleLogin();
          }}
        >
          <Image
            src={GoogleLogo}
            alt="Google Logo"
            width={20}
            className="mr-2"
          />
          <span className="sm:inline">Log in with Google</span>
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {`Don't have an account? `}
        <Link href="/register" className="text-emerald-600 hover:underline">
          Register
        </Link>
      </div>

      <Toaster closeButton />
    </form>
  );
}
