import api from "@/lib/api";

export default async function Logout() {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.getItem !== "function" ||
    typeof window.sessionStorage?.getItem !== "function"
  ) {
    return;
  }

  await api.get(`/users/logout`);

  window.localStorage.removeItem("user_id");
  window.localStorage.removeItem("theme");
}
