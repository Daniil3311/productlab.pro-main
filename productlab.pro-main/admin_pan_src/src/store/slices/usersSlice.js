import { createSlice } from "@reduxjs/toolkit";

export const userConstants = {};

const initialState = {
  users: [],
  tags: [],
  userCategories: [],
};

export const usersSlices = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    setTags(state, action) {
      state.tags = action.payload;
    },
    setUserCategories(state, action) {
      state.userCategories = action.payload;
    },
  },
});

export const {
  reducer: usersSlice,
  actions: { setUsers, setTags, setUserCategories },
} = usersSlices;
