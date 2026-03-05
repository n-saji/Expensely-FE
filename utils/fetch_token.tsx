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
