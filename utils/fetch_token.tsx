export default function FetchToken() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token;
}
