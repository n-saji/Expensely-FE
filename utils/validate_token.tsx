import { API_URL } from "@/config/config";

export default async function validateToken() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/users/check-auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
