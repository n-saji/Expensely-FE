"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast, Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser } from "@/redux/slices/userSlice";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 120;

const extractCooldownSeconds = (value?: string) => {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d+)\s*seconds?/i);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

export default function OtpForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [otp, setOtp] = useState("");
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [ready, setReady] = useState(false);

  const emailHint = useMemo(() => {
    if (!pendingEmail) {
      return "";
    }

    const at = pendingEmail.indexOf("@");
    if (at <= 1) {
      return pendingEmail;
    }

    const username = pendingEmail.slice(0, at);
    const domain = pendingEmail.slice(at);
    return `${username[0]}${"*".repeat(Math.max(username.length - 1, 1))}${domain}`;
  }, [pendingEmail]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldownSeconds]);

  const resolveApiError = (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      return {
        message: "Request failed. Please try again.",
        cooldown: null as number | null,
      };
    }

    const statusCode = error.response?.status;
    if (statusCode && statusCode >= 500) {
      return {
        message: "Internal server error. Please try again later.",
        cooldown: null as number | null,
      };
    }

    const apiError =
      error.response?.data?.error || error.response?.data?.message;
    const fallbackMessage =
      typeof apiError === "string" && apiError.length > 0
        ? apiError
        : "Request failed. Please try again.";

    return {
      message: fallbackMessage,
      cooldown: extractCooldownSeconds(fallbackMessage),
    };
  };

  const resendOtp = useCallback(async () => {
    if (!pendingUserId || resending || cooldownSeconds > 0) {
      return;
    }

    setResending(true);

    try {
      const response = await api.post(`/users/resend-otp`, {
        userId: pendingUserId,
      });

      const data = response.data;
      const errorMessage = data?.error || data?.message;
      if (typeof errorMessage === "string" && data?.error) {
        const seconds = extractCooldownSeconds(errorMessage);
        if (seconds) {
          setCooldownSeconds(seconds);
        }
        toast.error(errorMessage);
        return;
      }

      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      toast.success(data?.message || "OTP resent. Please check your email.");
    } catch (error) {
      const resolved = resolveApiError(error);
      if (resolved.cooldown) {
        setCooldownSeconds(resolved.cooldown);
      }
      toast.error(resolved.message);
    } finally {
      setResending(false);
    }
  }, [cooldownSeconds, pendingUserId, resending]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("pending_verify_user_id") || "";
    const storedEmail = localStorage.getItem("pending_verify_email") || "";
    const fallbackUserId = localStorage.getItem("user_id") || "";

    const userId = storedUserId || user?.id || fallbackUserId;
    const email = storedEmail || user?.email || "";

    if (!userId) {
      toast.error("Verification session not found. Please log in again.");
      router.push("/login");
      return;
    }

    localStorage.setItem("pending_verify_user_id", userId);
    if (email) {
      localStorage.setItem("pending_verify_email", email);
    }
    setPendingUserId(userId);
    setPendingEmail(email);
    setReady(true);
  }, [router, user?.email, user?.id]);

  useEffect(() => {
    if (!ready || !pendingUserId) {
      return;
    }

    const shouldAutoResend = localStorage.getItem("otp_auto_resend") === "1";
    if (!shouldAutoResend) {
      return;
    }

    localStorage.setItem("otp_auto_resend", "0");
    resendOtp();
  }, [pendingUserId, ready, resendOtp]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUserId || verifying) {
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifying(true);
    try {
      const response = await api.post(`/users/verify-otp`, {
        userId: pendingUserId,
        otp,
      });

      const data = response.data;
      if (data?.error && data.error !== "") {
        toast.error(data.error || data.message || "OTP verification failed.");
        return;
      }

      localStorage.removeItem("pending_verify_user_id");
      localStorage.removeItem("pending_verify_email");
      localStorage.removeItem("otp_auto_resend");
      localStorage.removeItem("user_id");
      localStorage.removeItem("theme");

      dispatch(clearUser());

      await api.get(`/users/logout`).catch(() => {
        return null;
      });

      toast.success(data?.message || "Email verified.");
      router.push("/login");
    } catch (error) {
      const resolved = resolveApiError(error);
      toast.error(resolved.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleVerifyOtp}>
      <div className="space-y-2">
        <Label htmlFor="otp" className="text-sm text-muted-foreground">
          6-digit OTP
        </Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter OTP"
          className="w-full border-border/70 bg-background"
          value={otp}
          maxLength={OTP_LENGTH}
          onChange={(e) => {
            if (!/^\d*$/.test(e.target.value)) {
              return;
            }
            setOtp(e.target.value);
          }}
        />
        {emailHint && (
          <p className="text-xs text-muted-foreground">
            OTP sent to {emailHint}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!ready || verifying || otp.length !== OTP_LENGTH}
      >
        {verifying ? <Spinner /> : "Verify OTP"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={!ready || resending || cooldownSeconds > 0}
        onClick={() => {
          resendOtp();
        }}
      >
        {resending
          ? "Resending..."
          : cooldownSeconds > 0
            ? `Resend OTP in ${cooldownSeconds}s`
            : "Resend OTP"}
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
