"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import api from "@/lib/api";

export default function AuthHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session) {
      const isLinkingMode = searchParams.get("action") === "link";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session.idToken) {
        headers["Authorization"] = `Bearer ${session.idToken}`;
      }

      if (isLinkingMode) {
        // Handle linking to currently authenticated user session
        api
          .post(
            `/users/oauth/link`,
            {
              provider: session.provider || "google",
              providerUserId: session.providerAccountId || session.user?.email || "",
              providerEmail: session.user?.email || "",
            }
          )
          .then(() => {
            router.push("/settings?tab=security&linked=success");
          })
          .catch((err) => {
            console.error("Error linking OAuth account:", err);
            const msg = err?.response?.data?.message || err?.message || "Failed to link account.";
            router.push(`/settings?tab=security&linked=error&message=${encodeURIComponent(msg)}`);
          });
        return;
      }

      api
        .post(
          `/users/verify-oauth-login`,
          {
            provider: session.provider || "google",
            providerUserId: session.providerAccountId || session.user?.email || "",
            email: session.user ? session.user.email : null,
            name: session.user ? session.user.name : null,
            image: session.user ? session.user.image : null,
            token: session.accessToken,
          },
          {
            headers: headers as any,
          },
        )
        .catch((error) => {
          console.error("Error verifying OAuth login:", error);
          setError(
            "An error occurred during authentication. Please try again.",
          );
          return Promise.reject(error);
        })
        .then((res) => res?.data)
        .then(async (data) => {
          if (!data) return;
          if (data.error && data.error !== "") {
            setError(
              data.message || "Authentication failed. Please try again.",
            );
            return;
          }

          localStorage.setItem("user_id", data.id);

          const response = await api.get(`/users/me`);
          if (response.status !== 200) {
            const responseError = await response.data;
            console.error("Error fetching user data:", responseError);
            setError("Failed to load user profile. Please try again.");
            return;
          }

          const profileData = await response.data;
          if (!profileData.user.profilePictureUrl && profileData.user.profilePicFilePath) {
            profileData.user.profilePictureUrl = profileData.user.profilePicFilePath.startsWith("http")
              ? profileData.user.profilePicFilePath
              : `https://expensely-profiles.s3.amazonaws.com/${profileData.user.profilePicFilePath}`;
          }

          dispatch(
            setUser({
              email: profileData.user.email,
              id: profileData.user.id,
              name: profileData.user.name,
              country_code: profileData.user.country_code,
              phone: profileData.user.phone,
              currency: profileData.user.currency,
              theme: profileData.user.theme,
              themeColor:
                profileData.user.themeColor ?? profileData.user.theme_color,
              language: profileData.user.language,
              isActive: profileData.user.isActive,
              isAdmin: profileData.user.isAdmin,
              notificationsEnabled: profileData.user.notificationsEnabled,
              alertsEnabled:
                profileData.user.alerts_enabled ??
                profileData.user.alertsEnabled,
              profilePictureUrl: profileData.user.profilePictureUrl,
              profilePicFilePath: profileData.user.profilePicFilePath,
              profileComplete: profileData.user.profileComplete,
              emailVerified: profileData.user.emailVerified,
              hasTransactions:
                profileData.user.hasTransactions ??
                profileData.user.has_transactions ??
                false,
            }),
          );
          localStorage.setItem("theme", profileData.user.theme);

          if (profileData.user.emailVerified === false) {
            localStorage.setItem("pending_verify_user_id", profileData.user.id);
            localStorage.setItem(
              "pending_verify_email",
              profileData.user.email || "",
            );
            localStorage.setItem("otp_auto_resend", "1");
            router.push("/verify-otp");
            return;
          }

          if (profileData.user.profileComplete === false) {
            router.push("/complete-profile");
            return;
          }

          router.push("/dashboard");
        });
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, searchParams, router, dispatch]);

  return (
    <div
      className="flex flex-col items-center justify-center h-screen 
    bg-primary-color"
    >
      {!error && <p> Please wait...</p>}
      {error ? <p className="text-red-500">{error}</p> : null}
    </div>
  );
}
