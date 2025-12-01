// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

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
        await api.get("/users/refresh").then((e) => {
          console.log("Token refreshed", e);
        });

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → redirect to login
        if (typeof window !== "undefined" && !window.location.href.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
