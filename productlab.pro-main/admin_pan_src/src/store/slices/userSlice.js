import { createSlice } from "@reduxjs/toolkit";

export const userConstants = {
  status: {
    loading: "loading",
    error: "error",
    success: "success",
  },
  role: {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    COPYWRITER: "COPYWRITER",
    STUDENT: "STUDENT",
    default: "default",
  },
};

const initialState = {
  data: null,
  status: userConstants.status.loading,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.data = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const {
  reducer: userReducer,
  actions: { setUser, setStatus },
} = userSlice;
