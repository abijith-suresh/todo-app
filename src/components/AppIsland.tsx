import App from "../App";
import "../index.css";
import { AppProvider } from "../state/app-store";

export default function AppIsland() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
