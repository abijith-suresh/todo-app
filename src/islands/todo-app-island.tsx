import TodoApp from "@/features/todo/app/TodoApp";
import { AppProvider } from "@/state/app-store";

export default function TodoAppIsland() {
  return (
    <AppProvider>
      <TodoApp />
    </AppProvider>
  );
}
