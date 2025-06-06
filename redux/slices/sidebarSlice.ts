// redux/slices/sidebarSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    enabled: true,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.enabled = !state.enabled;
    },
    setSidebar: (state, action) => {
      state.enabled = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
