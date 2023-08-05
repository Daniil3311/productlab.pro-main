import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userConstants, setUser, setStatus } from "./store/slices/userSlice";

import { getUser } from "./api/api";

import { Layout } from "./components/Layout/Layout";
import { Routes } from "./routes";

import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const token = params?.token;

  useEffect(() => {
    const initial = async () => {
      dispatch(setStatus(userConstants.status.loading));

      await getUser(token)
        .then((data) => {
          dispatch(setUser(data));
          dispatch(setStatus(userConstants.status.success));
        })
        .catch((_) => {
          dispatch(setStatus(userConstants.status.error));
        });
    };

    if (token) {
      initial();
    } else {
      dispatch(setStatus(userConstants.status.success));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout token={token} user={user}>
      <Routes token={token} user={user} />
    </Layout>
  );
};

export default App;
