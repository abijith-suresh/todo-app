import { type Component, createMemo, createSignal, onCleanup, Show } from "solid-js";

import { useAppStore } from "@/state/app-store";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
}

export const TaskRow: Component<TaskRowProps> = (props) => {
  const app = useAppStore();
  const [isEditing, setIsEditing] = createSignal(false);
  const [editTitle, setEditTitle] = createSignal("");

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

  onCleanup(() => {
    setIsEditing(false);
  });

  return (
    <div
      class="group flex items-center gap-3 py-4"
      style={{
        "border-bottom": "1px solid var(--color-border-subtle)",
        "background-color": isFocused() ? "var(--color-bg-surface)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isFocused()) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-surface)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isFocused()) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }
      }}
      onFocus={() => app.setFocusedTaskId(props.task.id)}
      tabIndex={0}
    >
      <input
        type="checkbox"
        aria-label={`Complete ${props.task.title}`}
        class="task-checkbox shrink-0"
        onChange={() => void app.completeTask(props.task.id)}
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
        >
          <span class="truncate block">{props.task.title}</span>
        </button>
      </Show>

      <button
        type="button"
        aria-label={`Delete ${props.task.title}`}
        class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: "var(--color-text-tertiary)" }}
        onClick={(event) => {
          event.stopPropagation();
          void app.deleteTask(props.task.id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-3.5"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
};
