"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { toast, Toaster } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("uid")?.trim() || "";
  const otp = searchParams.get("otp")?.trim() || "";

  const hasValidResetParams = useMemo(() => {
    return Boolean(userId && otp);
  }, [otp, userId]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resolveApiErrorMessage = (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      return "Request failed. Please try again.";
    }

    if (error.response?.status && error.response.status >= 500) {
      return "Internal server error. Please try again later.";
    }

    const backendMessage =
      error.response?.data?.error || error.response?.data?.message;

    return typeof backendMessage === "string" && backendMessage
      ? backendMessage
      : "Request failed. Please try again.";
  };

  const validatePassword = (password: string) => {
    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    if (!hasValidResetParams) {
      toast.error("Reset link is invalid or incomplete.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      toast.error(passwordValidationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/users/confirm-password-reset`, {
        userId,
        otp,
        newPassword,
      });

      const data = response.data;
      if (data?.error && data.error !== "") {
        toast.error(data.error || "Failed to update password.");
        return;
      }

      toast.success(data?.message || "Password updated.");
      router.push("/login");
    } catch (error) {
      toast.error(resolveApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidResetParams) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          This reset link is invalid or incomplete. Please request a new
          password reset link.
        </div>
        <Button asChild className="w-full">
          <Link href="/forgot-password">Request a new reset link</Link>
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="text-emerald-600 hover:underline">
            login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-sm text-muted-foreground">
          New password
        </Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className="w-full border-border/70 bg-background"
          placeholder="Create a new password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
          }}
          required
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, number, and
          special character.
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirm-new-password"
          className="text-sm text-muted-foreground"
        >
          Verify password
        </Label>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          className="w-full border-border/70 bg-background"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : "Update password"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Back to{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          login
        </Link>
      </div>

      <Toaster closeButton />
    </form>
  );
}
