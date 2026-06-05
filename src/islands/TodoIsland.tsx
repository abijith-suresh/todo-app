import { TodoApp } from "@/features/todo/TodoApp";
import { AppProvider } from "@/state/app-store";

export const TodoIsland = () => {
  return (
    <AppProvider>
      <TodoApp />
    </AppProvider>
  );
};
