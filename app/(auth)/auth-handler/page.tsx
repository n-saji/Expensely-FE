"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import fetchProfileUrl from "@/utils/fetchProfileURl";
import api from "@/lib/api";

export default function AuthHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      api
        .post(
          `/users/verify-oauth-login`,
          {
            email: session.user ? session.user.email : null,
            name: session.user ? session.user.name : null,
            image: session.user ? session.user.image : null,
            token: session.accessToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.idToken}`, //dont remove - token from google
            },
          },
        )
        .catch((error) => {
          console.error("Error verifying OAuth login:", error);
          setError(
            "An error occurred during authentication. Please try again.",
          );
          return Promise.reject(error);
        })
        .then((res) => res.data)
        .then(async (data) => {
          if (data.error !== "") {
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
          if (profileData.user.profilePicFilePath) {
            const profilePictureUrl = await fetchProfileUrl(
              profileData.user.profilePicFilePath,
            ).catch((error) => {
              console.error("Error fetching profile picture URL:", error);
              return "";
            });
            profileData.user.profilePictureUrl = profilePictureUrl;
          } else {
            profileData.user.profilePictureUrl = "";
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
              language: profileData.user.language,
              isActive: profileData.user.isActive,
              isAdmin: profileData.user.isAdmin,
              notificationsEnabled: profileData.user.notificationsEnabled,
              profilePictureUrl: profileData.user.profilePictureUrl,
              profilePicFilePath: profileData.user.profilePicFilePath,
              profileComplete: profileData.user.profileComplete,
              emailVerified: profileData.user.emailVerified,
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
  }, [status]);

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
