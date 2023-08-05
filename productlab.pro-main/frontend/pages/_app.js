import { ThemeProvider } from "next-themes";
import "../styles/global.css"

import * as Sentry from "@sentry/nextjs";
import { CaptureConsole as CaptureConsoleIntegration } from "@sentry/integrations";

Sentry.init({
  dsn: "https://3cb6d3b7d7ff401a9f96cd1828d7674b@sentry.tablecrm.com/3",
  integrations: [
    new CaptureConsoleIntegration(
      { levels: ["error"] }
    )
  ]
});


function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider enableSystem={true} attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
