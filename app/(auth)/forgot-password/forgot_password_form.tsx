"use client";

import { useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { toast, Toaster } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_REGEX = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Please enter your email.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const response = await api.post(`/users/request-password-reset`, {
        email: normalizedEmail,
      });

      const data = response.data;
      if (data?.error && data.error !== "") {
        toast.error(data.error || "Failed to send reset link.");
        return;
      }

      const message =
        data?.message || "If the account exists, a reset link has been sent.";
      setSuccessMessage(message);
      toast.success(message);
    } catch (error) {
      toast.error(resolveApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="forgot-email" className="text-sm text-muted-foreground">
          Email
        </Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          className="w-full border-border/70 bg-background"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (successMessage) {
              setSuccessMessage("");
            }
          }}
          required
        />
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : "Send reset link"}
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
