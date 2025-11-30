import api from "@/lib/api";

export default async function validateToken() {
  try {
    const res = await api.get(`/users/check-auth`);
    if (res.status === 200) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
