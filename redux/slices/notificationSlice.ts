import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [] as {
      id: string;
      message: string;
      sender: string;
      time: string;
      type: "INFO" | "ALERT" | "ERROR" | "SUCCESS";
      isRead: boolean;
    }[],
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.notifications.find(
        (n) => n.id === action.payload.id
      );
      if (!exists) state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload.id
      );
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },
    markOneRead: (state, action) => {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n) n.isRead = true;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  setNotifications,
  clearNotifications,
  markAllRead,
  markOneRead,
} = notificationSlice.actions;
export default notificationSlice.reducer;
