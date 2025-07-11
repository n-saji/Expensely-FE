
import { API_URL } from "@/config/config";

export default async function Logout() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    await fetch(`${API_URL}/users/logout`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }

  localStorage.removeItem("user_id");
  localStorage.removeItem("theme");
}
