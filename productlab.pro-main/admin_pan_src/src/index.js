import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Provider as ReduxProvider } from "react-redux";

import { store } from "./store/store";

import * as Sentry from "@sentry/react";
import { CaptureConsole as CaptureConsoleIntegration } from "@sentry/integrations";

Sentry.init({
  dsn: "https://3c3800f1d60146e2b61dd61fd934422a@sentry.tablecrm.com/3",
  integrations: [
    new CaptureConsoleIntegration(
      { levels: ["error"] }
    )
  ]
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ReduxProvider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ReduxProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
