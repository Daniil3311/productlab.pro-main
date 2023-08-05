import { createSlice } from "@reduxjs/toolkit";

export const surveysConstants = {
  status: {
    loading: "loading",
    error: "error",
    success: "success",
  },
};

const initialState = {
  data: [],
  status: surveysConstants.status.loading,
  error: null,
};

export const surveysSlice = createSlice({
  name: "surveys",
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
  reducer: surveysReducer,
  actions: { setData, setStatus, setError },
} = surveysSlice;
