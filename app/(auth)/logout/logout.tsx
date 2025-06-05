"use client";
import { API_URL } from "@/config/config";
import { useRouter } from "next/navigation";

export default function useLogout() {
  const router = useRouter();

  const logout = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      await fetch(`${API_URL}/users/logout`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    router.push("/login");
  };

  return logout;
}
