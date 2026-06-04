import { type Component, createSignal, onCleanup, onMount, Show } from "solid-js";

import { Checkbox } from "@/components/ui/Solid/Checkbox";
import { DeleteButton } from "@/components/ui/Solid/DeleteButton";
import { Text } from "@/components/ui/Solid/Text";
import { createExitAnimation } from "@/lib/exit-animation";
import { useAppStore } from "@/state/app-store";
import type { Task } from "@/lib/types";

interface TaskRowProps {
  task: Task;
}

export const TaskRow: Component<TaskRowProps> = (props) => {
  const app = useAppStore();
  const [isEditing, setIsEditing] = createSignal(false);
  const [editTitle, setEditTitle] = createSignal("");
  const [entered, setEntered] = createSignal(false);
  const { exitType, isExiting, startExit } = createExitAnimation();

  onMount(() => setTimeout(() => setEntered(true), 500));

  const startEdit = (): void => {
    setEditTitle(props.task.title);
    setIsEditing(true);
  };

  const saveEdit = (): void => {
    const title = editTitle().trim();
    if (title) {
      void app.updateTaskTitle(props.task.id, title);
    }
    setIsEditing(false);
  };

  const cancelEdit = (): void => {
    setIsEditing(false);
  };

  const handleComplete = (): void => {
    const id = props.task.id;
    startExit(
      "complete",
      () => {
        void app.completeTask(id);
      },
      900
    );
  };

  const handleDelete = (event: MouseEvent): void => {
    event.stopPropagation();
    const id = props.task.id;
    startExit(
      "delete",
      () => {
        void app.deleteTask(id);
      },
      300
    );
  };

  onCleanup(() => {
    setIsEditing(false);
  });

  return (
    <div
      class="task-wrapper"
      classList={{
        "task-completing": exitType() === "complete",
        "task-deleting": exitType() === "delete",
      }}
    >
      <div class="task-inner">
        <div
          class="group flex items-center gap-3 py-4 task-row border-b border-line-subtle"
          classList={{ "task-enter": !entered() && !exitType() }}
        >
          <Checkbox
            status="active"
            ariaLabel={`Complete ${props.task.title}`}
            onToggle={handleComplete}
            disabled={isExiting()}
          />

          <Show
            when={!isEditing()}
            fallback={
              <input
                ref={(el) => {
                  queueMicrotask(() => el?.focus());
                }}
                value={editTitle()}
                onInput={(event) => setEditTitle(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveEdit();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelEdit();
                  }
                }}
                onBlur={() => saveEdit()}
                class="min-w-0 flex-1 bg-transparent text-base outline-none text-ink"
                autocomplete="off"
              />
            }
          >
            <button
              type="button"
              class="min-w-0 flex-1 cursor-text text-left text-base text-ink"
              onClick={() => startEdit()}
              disabled={isExiting()}
            >
              <Text title={props.task.title} />
            </button>
          </Show>

          <DeleteButton
            ariaLabel={`Delete ${props.task.title}`}
            onDelete={handleDelete}
            disabled={isExiting()}
          />
        </div>
      </div>
    </div>
  );
};
