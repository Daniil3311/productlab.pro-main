import { createSlice } from "@reduxjs/toolkit";

export const articleConstants = {
  status: {
    loading: "loading",
    error: "error",
    success: "success",
  },
};

const initialState = {
  allData: [],
  data: {
    offset: 0,
    limit: 10,
    result: [],
    count: 0,
  },
  status: articleConstants.status.loading,
  error: null,
};

export const articleSlice = createSlice({
  name: "article",
  initialState,
  reducers: {
    setAllData(state, action) {
      state.allData = action.payload;
    },
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
  reducer: articleReducer,
  actions: { setData, setStatus, setError, setAllData },
} = articleSlice;
