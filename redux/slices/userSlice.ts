import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
  name: "user",
  initialState: {
    email: "",
    isAuthenticated: false,
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
    profilePictureUrl : "", 
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.isAuthenticated = true;
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
      state.profilePictureUrl =
        action.payload.profilePictureUrl || ""; 
    },
    clearUser: (state) => {
      state.email = "";
      state.isAuthenticated = false;
      state.id = "";
      state.name = "";
      state.country_code = "";
      state.phone = "";
      state.currency = "";
      state.theme = "";
      state.language = "en";
      state.isActive = true;
      state.isAdmin = false;
      state.notificationsEnabled = true;
      state.profilePictureUrl = ""; 
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
