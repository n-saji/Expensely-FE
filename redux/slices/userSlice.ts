import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  email: string;
  id: string;
  name: string;
  country_code: string;
  phone: string;
  currency: string;
  theme: string;
  language: string;
  isActive: boolean;
  isAdmin: boolean;
  notificationsEnabled: boolean;
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
  theme: "",
  language: "en",
  isActive: true,
  isAdmin: false,
  notificationsEnabled: true,
  profilePicFilePath: "",
  profilePictureUrl: "",
  profileComplete: false,
  emailVerified: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.country_code = action.payload.country_code;
      state.phone = action.payload.phone;
      state.currency = action.payload.currency;
      state.theme = action.payload.theme;
      state.language = action.payload.language || "en";
      state.isActive =
        action.payload.isActive !== undefined ? action.payload.isActive : true;
      state.isAdmin =
        action.payload.isAdmin !== undefined ? action.payload.isAdmin : false;
      state.notificationsEnabled =
        action.payload.notificationsEnabled !== undefined
          ? action.payload.notificationsEnabled
          : true;
      state.profilePictureUrl = action.payload.profilePictureUrl || "";
      state.profilePicFilePath = action.payload.profilePicFilePath || "";
      state.profileComplete =
        action.payload.profileComplete !== undefined
          ? action.payload.profileComplete
          : false;
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
      state.theme = "";
      state.language = "en";
      state.isActive = false;
      state.isAdmin = false;
      state.notificationsEnabled = false;
      state.profilePictureUrl = "";
      state.profileComplete = false;
      state.profilePicFilePath = "";
      state.emailVerified = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
