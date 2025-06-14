"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import sidebarReducer from "./slices/sidebarSlice";
import userReducer from "./slices/userSlice";
import categoryReducer from "./slices/category";

const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  user: userReducer,
  categoryExpense: categoryReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "categoryExpense"], // persist user and categoryExpense slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
