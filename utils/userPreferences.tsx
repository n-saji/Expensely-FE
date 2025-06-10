"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.toggle("dark", systemPrefersDark);
      }

      localStorage.setItem("theme", theme);
    };

    applyTheme(user.theme);
  }, [user.theme]);

  return null;
}
