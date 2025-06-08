// redux/slices/sidebarSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    enabled: true,
    popUpEnabled: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.enabled = !state.enabled;
    },
    setSidebar: (state, action) => {
      state.enabled = action.payload;
    },
    togglePopUp: (state) => {
      state.popUpEnabled = !state.popUpEnabled;
    },
    setPopUp: (state, action) => {
      state.popUpEnabled = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar, togglePopUp, setPopUp } = sidebarSlice.actions;
export default sidebarSlice.reducer;
