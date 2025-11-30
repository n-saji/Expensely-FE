import api from "@/lib/api";


export default async function Logout() {

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    await api.get(`/users/logout`);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }

  localStorage.removeItem("user_id");
  localStorage.removeItem("theme");
}
