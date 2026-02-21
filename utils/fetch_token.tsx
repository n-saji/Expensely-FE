export default function FetchToken() {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.getItem !== "function" ||
    typeof window.sessionStorage?.getItem !== "function"
  ) {
    return null;
  }

  const token =
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token");
  return token;
}
export function FetchUserId() {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage?.getItem !== "function"
  ) {
    return null;
  }

  const userId = window.localStorage.getItem("user_id");
  return userId;
}
