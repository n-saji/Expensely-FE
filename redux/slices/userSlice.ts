import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_THEME,
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
  THEME_IDS,
  ThemeId,
  ThemeColorId,
} from "@/global/constants";

const normalizeTheme = (theme?: string): ThemeId => {
  const normalizedTheme = theme?.trim().toLowerCase();
  if (normalizedTheme && THEME_IDS.includes(normalizedTheme as ThemeId)) {
    return normalizedTheme as ThemeId;
  }
  return DEFAULT_THEME;
};

const normalizeThemeColor = (themeColor?: string): ThemeColorId => {
  const normalizedThemeColor = themeColor?.trim().toLowerCase();
  if (
    normalizedThemeColor &&
    THEME_COLOR_IDS.includes(normalizedThemeColor as ThemeColorId)
  ) {
    return normalizedThemeColor as ThemeColorId;
  }
  return DEFAULT_THEME_COLOR;
};

interface UserState {
  email: string;
  id: string;
  name: string;
  country_code: string;
  phone: string;
  currency: string;
  theme: ThemeId;
  themeColor: ThemeColorId;
  language: string;
  isActive: boolean;
  isAdmin: boolean;
  notificationsEnabled: boolean;
  alertsEnabled: boolean;
  profilePicFilePath: string;
  profilePictureUrl: string;
  profileComplete: boolean;
  emailVerified: boolean;
}

const initialState: UserState = {
  email: "",
  id: "",
  name: "",
  country_code: "",
  phone: "",
  currency: "",
  theme: DEFAULT_THEME,
  themeColor: DEFAULT_THEME_COLOR,
  language: "en",
  isActive: true,
  isAdmin: false,
  notificationsEnabled: true,
  alertsEnabled: true,
  profilePicFilePath: "",
  profilePictureUrl: "",
  profileComplete: false,
  emailVerified: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      state.email = action.payload.email ?? state.email;
      state.id = action.payload.id ?? state.id;
      state.name = action.payload.name ?? state.name;
      state.country_code = action.payload.country_code ?? state.country_code;
      state.phone = action.payload.phone ?? state.phone;
      state.currency = action.payload.currency ?? state.currency;
      state.theme = normalizeTheme(action.payload.theme || state.theme);
      state.themeColor = normalizeThemeColor(
        action.payload.themeColor || state.themeColor,
      );
      state.language = action.payload.language ?? state.language;
      state.isActive =
        action.payload.isActive !== undefined
          ? action.payload.isActive
          : state.isActive;
      state.isAdmin =
        action.payload.isAdmin !== undefined
          ? action.payload.isAdmin
          : state.isAdmin;
      state.notificationsEnabled =
        action.payload.notificationsEnabled !== undefined
          ? action.payload.notificationsEnabled
          : state.notificationsEnabled;
      state.alertsEnabled =
        action.payload.alertsEnabled !== undefined
          ? action.payload.alertsEnabled
          : state.alertsEnabled;
      state.profilePictureUrl =
        action.payload.profilePictureUrl ?? state.profilePictureUrl;
      state.profilePicFilePath =
        action.payload.profilePicFilePath ?? state.profilePicFilePath;
      state.profileComplete =
        action.payload.profileComplete !== undefined
          ? action.payload.profileComplete
          : state.profileComplete;
      state.emailVerified =
        action.payload.emailVerified !== undefined
          ? action.payload.emailVerified
          : state.emailVerified;
    },
    clearUser: (state) => {
      state.email = "";
      state.id = "";
      state.name = "";
      state.country_code = "";
      state.phone = "";
      state.currency = "";
      state.theme = DEFAULT_THEME;
      state.themeColor = DEFAULT_THEME_COLOR;
      state.language = "en";
      state.isActive = false;
      state.isAdmin = false;
      state.notificationsEnabled = false;
      state.alertsEnabled = false;
      state.profilePictureUrl = "";
      state.profileComplete = false;
      state.profilePicFilePath = "";
      state.emailVerified = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
