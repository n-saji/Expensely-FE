// redux/slices/sidebarSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const categoryExpense = createSlice({
  name: "categoryExpense",
  initialState: {
    categories: [
      {
        id: "",
        type: "",
        name: "",
      },
    ],
  },
  reducers: {
    addCategory: (state, action) => {
      state.categories.push(action.payload);
    },
    removeCategory: (state, action) => {
      state.categories = state.categories.filter(
        (category) => category.id !== action.payload.id
      );
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
  },
});

export const { addCategory, removeCategory, setCategories } =
  categoryExpense.actions;
export default categoryExpense.reducer;
