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
    },
    clearUser: (state) => {
      state.email = "";
      state.isAuthenticated = false;
      state.id = "";
      state.name = "";
      state.country_code = "";
      state.phone = "";
      state.currency = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
