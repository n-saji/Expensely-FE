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

  const redirectToOtpVerification = (id: string, email: string) => {
    if (id) {
      localStorage.setItem("pending_verify_user_id", id);
    }
    localStorage.setItem("pending_verify_email", email || "");
    localStorage.setItem("otp_auto_resend", "1");
    router.push("/verify-otp");
  };

  useEffect(() => {
    setLoading(true);
    validateToken().then(async (isValid) => {
      if (isValid) {
        const response = await api.get(`/users/me`);
        if (response.status === 200) {
          const data = await response.data;

          dispatch(
            setUser({
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
              profilePicFilePath: data.user.profilePicFilePath,
              profileComplete: data.user.profileComplete,
              profilePictureUrl: data.user.profilePictureUrl,
              emailVerified: data.user.emailVerified,
            }),
          );
          localStorage.setItem("theme", data.user.theme);

          if (data.user.emailVerified === false) {
            redirectToOtpVerification(data.user.id, data.user.email);
            return;
          }
        } else {
          const error = await response.data;
          console.error("Error fetching user data:", error);
          toast.error(error.data || "Failed to fetch user data");
          return;
        }

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
          localStorage.setItem("user_id", data.id);

          const response = await api.get(`/users/me`);
          if (response.status === 200) {
            const data = await response.data;

            dispatch(
              setUser({
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
                profilePicFilePath: data.user.profilePicFilePath,
                profileComplete: data.user.profileComplete,
                profilePictureUrl: data.user.profilePictureUrl,
                emailVerified: data.user.emailVerified,
              }),
            );
            localStorage.setItem("theme", data.user.theme);

            if (data.user.emailVerified === false) {
              redirectToOtpVerification(data.user.id, data.user.email);
              setLoading(false);
              return;
            }

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
          localStorage.removeItem("user_id");
          toast.error(data.message || "Login failed");
        }
      } else {
        const errorData = await res.data;
        setLoading(false);
        dispatch(clearUser());
        localStorage.removeItem("user_id");
        toast.error(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);

      if (error instanceof AxiosError && error.response) {
        const statusCode = error.response.status;
        const backendMessage =
          error.response.data?.error || error.response.data?.message || "";

        if (
          error.response.status === 403 &&
          typeof backendMessage === "string" &&
          backendMessage.toLowerCase().includes("email not verified")
        ) {
          const unresolvedUserId =
            error.response.data?.id ||
            error.response.data?.userId ||
            error.response.data?.user?.id ||
            localStorage.getItem("pending_verify_user_id") ||
            localStorage.getItem("user_id") ||
            "";
          const unresolvedEmail =
            error.response.data?.email ||
            (username.includes("@") ? username : "");

          if (!unresolvedUserId) {
            toast.error(
              "Email not verified, but verification session is missing. Please contact support.",
            );
            return;
          }

          toast.error("Email not verified. Please verify your OTP.");
          redirectToOtpVerification(unresolvedUserId, unresolvedEmail);
          return;
        }

        dispatch(clearUser());
        localStorage.removeItem("user_id");

        toast.error(
          statusCode >= 500
            ? "Internal server error. Please try again later."
            : typeof backendMessage === "string" && backendMessage
              ? backendMessage
              : "Request failed. Please try again.",
        );
        return;
      }

      dispatch(clearUser());
      localStorage.removeItem("user_id");

      toast.error("Request failed. Please try again.");
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
