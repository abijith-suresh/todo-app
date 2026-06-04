import { type Component, createMemo, createSignal, onCleanup, Show } from "solid-js";

import { TrashIcon } from "@/components/icons/TrashIcon";

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

  const isFocused = createMemo(() => app.focusedTaskId() === props.task.id);

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
          data-focused={isFocused() ? "true" : undefined}
          onFocus={() => app.setFocusedTaskId(props.task.id)}
          tabIndex={0}
        >
          <input
            type="checkbox"
            aria-label={`Complete ${props.task.title}`}
            class="task-checkbox shrink-0"
            onChange={handleComplete}
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
              <span class="task-text truncate block">{props.task.title}</span>
            </button>
          </Show>

          <button
            type="button"
            aria-label={`Delete ${props.task.title}`}
            class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: "var(--color-text-tertiary)" }}
            onClick={handleDelete}
            disabled={isExiting()}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
