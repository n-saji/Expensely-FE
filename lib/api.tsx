// src/lib/api.ts
import axios from "axios";
import { clearCategories } from "@/redux/slices/categorySlice";
import { clearNotifications } from "@/redux/slices/notificationSlice";
import { clearUser } from "@/redux/slices/userSlice";
import { store } from "@/redux/store";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let hasTriggeredInactiveLogout = false;

function isInactiveUserError(error: unknown): boolean {
  const message =
    (error as { response?: { data?: { error?: string; message?: string } } })
      ?.response?.data?.error ||
    (error as { response?: { data?: { error?: string; message?: string } } })
      ?.response?.data?.message ||
    "";

  return (
    typeof message === "string" &&
    message.toLowerCase().includes("user is not active")
  );
}

function forceLogoutToLogin() {
  if (hasTriggeredInactiveLogout) {
    return;
  }
  hasTriggeredInactiveLogout = true;

  store.dispatch(clearCategories());
  store.dispatch(clearNotifications());
  store.dispatch(clearUser());

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("user_id");
    window.localStorage.removeItem("theme");
    window.localStorage.removeItem("persist:root");

    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
}

// --- Response interceptor ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes("/users/refresh")) {
      return Promise.reject(error);
    }

    // If access token expired (401) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try refreshing token
        await api.get("/users/refresh");

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → redirect to login
        if (
          typeof window !== "undefined" &&
          !window.location.href.includes("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 400 && isInactiveUserError(error)) {
      forceLogoutToLogin();
    }

    return Promise.reject(error);
  },
);

export default api;
