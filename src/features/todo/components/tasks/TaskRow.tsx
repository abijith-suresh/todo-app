import { type Component, createSignal, onCleanup, Show } from "solid-js";

import { TaskCheckbox } from "@/components/primitives/TaskCheckbox";
import { TaskDeleteButton } from "@/components/primitives/TaskDeleteButton";
import { TaskTitle } from "@/components/primitives/TaskTitle";
import { createExitAnimation } from "@/lib/exit-animation";
import { useAppStore } from "@/state/app-store";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
}

export const TaskRow: Component<TaskRowProps> = (props) => {
  const app = useAppStore();
  const [isEditing, setIsEditing] = createSignal(false);
  const [editTitle, setEditTitle] = createSignal("");
  const { exitType, isExiting, startExit } = createExitAnimation();

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
    startExit(
      "complete",
      () => {
        void app.completeTask(props.task.id);
      },
      900
    );
  };

  const handleDelete = (event: MouseEvent): void => {
    event.stopPropagation();
    startExit(
      "delete",
      () => {
        void app.deleteTask(props.task.id);
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
          class="group flex items-center gap-3 py-4 task-row"
          classList={{ "task-enter": !exitType() }}
          style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
        >
          <TaskCheckbox
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
                class="min-w-0 flex-1 bg-transparent text-base outline-none"
                style={{ color: "var(--color-text-primary)" }}
                autocomplete="off"
              />
            }
          >
            <button
              type="button"
              class="min-w-0 flex-1 cursor-text text-left text-base"
              style={{ color: "var(--color-text-primary)" }}
              onClick={() => startEdit()}
              disabled={isExiting()}
            >
              <TaskTitle title={props.task.title} />
            </button>
          </Show>

          <TaskDeleteButton
            ariaLabel={`Delete ${props.task.title}`}
            onDelete={handleDelete}
            disabled={isExiting()}
          />
        </div>
      </div>
    </div>
  );
};
