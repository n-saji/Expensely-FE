// redux/slices/sidebarSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    enabled: true,
    popUpEnabled: false,
    loading: false, // Added loading state
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
    setLoading: (state, action) => {
      state.loading = action.payload; // Set loading state
    },
  },
});

export const { toggleSidebar, setSidebar, togglePopUp, setPopUp, setLoading } = sidebarSlice.actions;
export default sidebarSlice.reducer;
