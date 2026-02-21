import api from "@/lib/api";

export default async function Logout() {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.getItem !== "function" ||
    typeof window.sessionStorage?.getItem !== "function"
  ) {
    return;
  }

  const token =
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token");

  if (token) {
    await api.get(`/users/logout`);
    window.localStorage.removeItem("token");
    window.sessionStorage.removeItem("token");
  }

  window.localStorage.removeItem("user_id");
  window.localStorage.removeItem("theme");
}
