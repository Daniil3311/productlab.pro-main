import { configureStore } from "@reduxjs/toolkit";

import { userReducer } from "./slices/userSlice";
import { articleReducer } from "./slices/articleSlice";
import { categoriesReducer } from "./slices/categoriesSlice";
import { surveysReducer } from "./slices/surveysSlice";
import { usersSlice } from "./slices/usersSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    article: articleReducer,
    categories: categoriesReducer,
    surveys: surveysReducer,
    users: usersSlice,
  },
});

export { store };
