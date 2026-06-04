import TodoApp from "@/features/todo/TodoApp";
import { AppProvider } from "@/state/app-store";

export default function TodoIsland() {
  return (
    <AppProvider>
      <TodoApp />
    </AppProvider>
  );
}
