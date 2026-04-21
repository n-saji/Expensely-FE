"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
  ThemeColorId,
} from "@/global/constants";

export default function UserPreferences(): React.ReactElement | null {
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user?.theme) return;

    const applyTheme = (theme: string) => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (theme === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        document.documentElement.classList.toggle("dark", systemPrefersDark);
      }

      localStorage.setItem("theme", theme);
    };

    applyTheme(user.theme);
  }, [user.theme]);

  useEffect(() => {
    const themeColor = THEME_COLOR_IDS.includes(user.themeColor)
      ? user.themeColor
      : DEFAULT_THEME_COLOR;

    document.documentElement.setAttribute("data-theme-color", themeColor);
    localStorage.setItem("themeColor", themeColor as ThemeColorId);
  }, [user.themeColor]);

  return null;
}
