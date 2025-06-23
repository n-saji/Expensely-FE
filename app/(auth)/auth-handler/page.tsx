"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config/config";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/slices/userSlice";
import fetchProfileUrl from "@/utils/fetchProfileURl";

export default function AuthHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("Session data:", session);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`${API_URL}/users/verify-oauth-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.idToken}`,
        },

        body: JSON.stringify({
          email: session.user ? session.user.email : null,
          name: session.user ? session.user.name : null,
          image: session.user ? session.user.image : null,
          token: session.accessToken,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.profileIncomplete) {
            router.push("/profile");
          } else {
            if (data.error === "") {
              localStorage.setItem("token", data.token);

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
                if (data.user.profilePicFilePath) {
                  const profilePictureUrl = await fetchProfileUrl(
                    data.user.profilePicFilePath
                  ).catch((error) => {
                    console.error("Error fetching profile picture URL:", error);
                    return "";
                  });
                  data.user.profilePictureUrl = profilePictureUrl;
                } else {
                  data.user.profilePictureUrl = "";
                }

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
                    profilePictureUrl: data.user.profilePictureUrl,
                      profilePicFilePath: data.user.profilePicFilePath,
                    profileComplete: data.user.profileComplete,
                  })
                );
                localStorage.setItem("theme", data.user.theme);
              } else {
                const error = await response.json();
                console.error("Error fetching user data:", error);
                return;
              }

              router.push("/dashboard");
            }
          }
        });
    }
  }, [status]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200 dark:bg-gray-800">
      <p> Please wait...</p>
    </div>
  );
}
