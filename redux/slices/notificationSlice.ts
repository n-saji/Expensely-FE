import { createSlice } from "@reduxjs/toolkit";

const getNotificationTime = (timeStr: string) => {
  const normalized = timeStr.endsWith("Z") ? timeStr : timeStr + "Z";
  return new Date(normalized).getTime();
};

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [] as {
      id: string;
      message: string;
      sender: string;
      time: string;
      type: "INFO" | "ALERT" | "ERROR" | "SUCCESS" | "LOGOUT";
      isRead: boolean;
    }[],
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.notifications.find(
        (n) => n.id === action.payload.id
      );
      if (exists) {
        state.notifications = state.notifications.map((n) =>
          n.id === action.payload.id ? action.payload : n
        );
      } else {
        state.notifications.unshift(action.payload);
      }
      state.notifications.sort(
        (a, b) => getNotificationTime(b.time) - getNotificationTime(a.time)
      );
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload.id
      );
    },
    setNotifications: (state, action) => {
      state.notifications = [...action.payload].sort(
        (a, b) => getNotificationTime(b.time) - getNotificationTime(a.time)
      );
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
