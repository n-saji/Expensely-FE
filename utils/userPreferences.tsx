"use client";

import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function UserPreferences(): React.ReactElement | null {
  const user = useSelector((state: RootState) => state.user);
  if (!user) {
    return null;
  }
  const theme = user.theme;
  localStorage.setItem("theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return null;
}
