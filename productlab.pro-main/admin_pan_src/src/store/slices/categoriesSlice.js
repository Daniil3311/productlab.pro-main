import { createSlice } from "@reduxjs/toolkit";

export const categoriesConstants = {
  status: {
    loading: "loading",
    error: "error",
    success: "success",
  },
};

const initialState = {
  data: [],
  status: categoriesConstants.status.loading,
  error: null,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setData(state, action) {
      state.data = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  reducer: categoriesReducer,
  actions: { setData, setStatus, setError },
} = categoriesSlice;
