"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import fetchProfileUrl from "@/utils/fetchProfileURl";
import api from "@/lib/api";

export default function AuthHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

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
          }
        )
        .then((res) => res.data)
        .then(async (data) => {
          if (data.profileIncomplete) {
            dispatch(
              setUser({
                isAuthenticated: true,
                id: data.id,
                profileComplete: !data.profileIncomplete,
              })
            );
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_id", data.id);
            router.push("/complete-profile");
          } else {
            if (data.error === "") {
              localStorage.setItem("token", data.token);

              localStorage.setItem("user_id", data.id);

              const response = await api.get(`/users/${data.id}`);
              if (response.status === 200) {
                const data = await response.data;
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
                const error = await response.data;
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
    <div
      className="flex items-center justify-center h-screen 
    bg-primary-color"
    >
      <p> Please wait...</p>
    </div>
  );
}
