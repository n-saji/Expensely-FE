export default function FetchToken() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token;
}
export function FetchUserId() {
  const userId = localStorage.getItem("user_id");
  return userId
}