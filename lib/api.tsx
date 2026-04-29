// src/lib/api.ts
import axios from "axios";
import { clearCategories } from "@/redux/slices/categorySlice";
import { clearNotifications } from "@/redux/slices/notificationSlice";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { store } from "@/redux/store";
import {
  DEFAULT_THEME,
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
  THEME_IDS,
  ThemeColorId,
  ThemeId,
} from "@/global/constants";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let hasTriggeredInactiveLogout = false;

function normalizeTheme(theme?: string): ThemeId {
  const normalizedTheme = theme?.trim().toLowerCase();
  if (normalizedTheme && THEME_IDS.includes(normalizedTheme as ThemeId)) {
    return normalizedTheme as ThemeId;
  }
  return DEFAULT_THEME;
}

function normalizeThemeColor(themeColor?: string): ThemeColorId {
  const normalizedThemeColor = themeColor?.trim().toLowerCase();
  if (
    normalizedThemeColor &&
    THEME_COLOR_IDS.includes(normalizedThemeColor as ThemeColorId)
  ) {
    return normalizedThemeColor as ThemeColorId;
  }
  return DEFAULT_THEME_COLOR;
}

function applyThemeToDocument(theme: ThemeId, themeColor: ThemeColorId) {
  if (typeof window === "undefined") {
    return;
  }

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.classList.toggle("dark", systemPrefersDark);
  }

  document.documentElement.setAttribute("data-theme-color", themeColor);
  window.localStorage.setItem("theme", theme);
  window.localStorage.setItem("themeColor", themeColor);
}

function syncUserFromMeResponse(response: unknown) {
  const data = response as {
    data?: {
      user?: {
        email?: string;
        id?: string;
        name?: string;
        country_code?: string;
        phone?: string;
        currency?: string;
        theme?: string;
        themeColor?: string;
        theme_color?: string;
        language?: string;
        isActive?: boolean;
        isAdmin?: boolean;
        notificationsEnabled?: boolean;
        alertsEnabled?: boolean;
        alerts_enabled?: boolean;
        profilePicFilePath?: string;
        profilePictureUrl?: string;
        profileComplete?: boolean;
        emailVerified?: boolean;
      };
    };
  };

  const profile = data?.data?.user;
  if (!profile?.id) {
    return;
  }

  const theme = normalizeTheme(profile.theme);
  const themeColor = normalizeThemeColor(
    profile.themeColor ?? profile.theme_color,
  );

  store.dispatch(
    setUser({
      email: profile.email,
      id: profile.id,
      name: profile.name,
      country_code: profile.country_code,
      phone: profile.phone,
      currency: profile.currency,
      theme,
      themeColor,
      language: profile.language,
      isActive: profile.isActive,
      isAdmin: profile.isAdmin,
      notificationsEnabled: profile.notificationsEnabled,
      alertsEnabled: profile.alerts_enabled ?? profile.alertsEnabled,
      profilePicFilePath: profile.profilePicFilePath,
      profilePictureUrl: profile.profilePictureUrl,
      profileComplete: profile.profileComplete,
      emailVerified: profile.emailVerified,
    }),
  );

  applyThemeToDocument(theme, themeColor);
}

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
  (response) => {
    if (response.config?.url?.includes("/users/me")) {
      syncUserFromMeResponse(response);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest.url?.includes("/users/refresh") ||
      originalRequest.url?.includes("/users/login")
    ) {
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
