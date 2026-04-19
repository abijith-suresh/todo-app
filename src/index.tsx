/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App";
import "./index.css";
import { AppProvider } from "./state/app-store";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

render(
  () => (
    <AppProvider>
      <App />
    </AppProvider>
  ),
  root
);
