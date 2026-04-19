import { createSortable, transformStyle } from "@thisbeyond/solid-dnd";
import { type Component, createMemo } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { getTaskUrgency } from "../lib/view-model";
import { useAppStore } from "../state/app-store";
import type { Task } from "../types";
import { ChevronDownIcon, ChevronUpIcon, DragHandleIcon, StarFilledIcon, StarIcon } from "./icons";

interface TaskRowProps {
  task: Task;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
}

export const TaskRow: Component<TaskRowProps> = (props) => {
  const app = useAppStore();
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.task.id);
  const isSelected = createMemo(() => app.selectedTaskId() === props.task.id);
  const isCompleting = createMemo(() => app.completingTaskIds().includes(props.task.id));
  const urgency = createMemo(() => getTaskUrgency(props.task));

  const rowBg = createMemo(() => {
    if (isSelected()) return "var(--color-accent-subtle)";
    if (urgency() === "overdue") return "var(--color-urgency-red-bg)";
    if (urgency() === "due-today") return "var(--color-urgency-amber-bg)";
    return "transparent";
  });

  const style = createMemo(() => ({
    ...transformStyle(sortable.transform),
    transition: "transform 200ms ease, opacity 200ms ease, background-color 150ms ease",
    "background-color": rowBg(),
    "border-left": isSelected() ? "3px solid var(--color-accent)" : "3px solid transparent",
    "padding-left": isSelected() ? "calc(0.75rem - 3px)" : "0.75rem",
  }));

  return (
    <div
      use:sortable
      ref={sortable.ref}
      style={style()}
      role="button"
      tabindex="0"
      aria-label={props.task.title}
      classList={{
        "task-row-completing": isCompleting(),
      }}
      class="group flex items-center gap-2.5 border-b py-2.5 pr-2 text-left outline-none transition-colors"
      onClick={() => app.openTask(props.task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          app.openTask(props.task.id);
        }
      }}
      onFocus={() => app.setFocusedTaskId(props.task.id)}
      onMouseEnter={(e) => {
        if (!isSelected()) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-input)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = rowBg();
      }}
    >
      {/* drag handle — hover-only */}
      <button
        type="button"
        aria-label="Drag task"
        class="shrink-0 cursor-grab rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-40 active:cursor-grabbing"
        style={{ color: "var(--color-text-tertiary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <DragHandleIcon class="size-3.5" />
      </button>

      {/* custom checkbox */}
      <input
        type="checkbox"
        aria-label={`Complete ${props.task.title}`}
        class="task-checkbox shrink-0"
        checked={false}
        onClick={(event) => event.stopPropagation()}
        onChange={() => void app.completeTask(props.task.id)}
      />

      {/* title + notes */}
      <div class="min-w-0 flex-1">
        <span
          class="task-title-text block truncate text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {props.task.title}
        </span>
        {props.task.notes ? (
          <p class="mt-0.5 line-clamp-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {props.task.notes}
          </p>
        ) : null}
      </div>

      {/* date chips */}
      <div class="hidden shrink-0 items-center gap-1.5 md:flex">
        {props.task.whenDate ? (
          <span
            class="rounded-full border px-2 py-0.5 font-mono text-[11px]"
            style={{
              "border-color": "var(--color-border-subtle)",
              "background-color": "var(--color-bg-input)",
              color: "var(--color-text-tertiary)",
            }}
          >
            {formatDateLabel(props.task.whenDate)}
          </span>
        ) : null}

        {props.task.dueDate ? (
          <span
            class="rounded-full border px-2 py-0.5 font-mono text-[11px]"
            style={{
              "border-color":
                urgency() === "overdue"
                  ? "var(--color-urgency-red)"
                  : urgency() === "due-today"
                    ? "var(--color-urgency-amber)"
                    : "var(--color-border-subtle)",
              "background-color":
                urgency() === "overdue"
                  ? "var(--color-urgency-red-bg)"
                  : urgency() === "due-today"
                    ? "var(--color-urgency-amber-bg)"
                    : "var(--color-bg-input)",
              color:
                urgency() === "overdue"
                  ? "var(--color-urgency-red)"
                  : urgency() === "due-today"
                    ? "var(--color-urgency-amber)"
                    : "var(--color-text-tertiary)",
            }}
          >
            Due {formatDateLabel(props.task.dueDate)}
          </span>
        ) : null}
      </div>

      {/* star */}
      <button
        type="button"
        aria-label={props.task.starred ? "Unstar task" : "Star task"}
        class="shrink-0 rounded p-1 transition-colors"
        style={{
          color: props.task.starred ? "var(--color-star)" : "var(--color-text-tertiary)",
        }}
        onMouseEnter={(e) => {
          if (!props.task.starred) {
            (e.currentTarget as HTMLElement).style.color = "var(--color-star)";
          }
        }}
        onMouseLeave={(e) => {
          if (!props.task.starred) {
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-tertiary)";
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          void app.toggleTaskStar(props.task.id);
        }}
      >
        {props.task.starred ? <StarFilledIcon class="size-3.5" /> : <StarIcon class="size-3.5" />}
      </button>

      {/* up/down reorder — hover-only */}
      <div class="hidden flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
        <button
          type="button"
          aria-label="Move task up"
          disabled={!props.canMoveUp}
          class="rounded p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: "var(--color-text-tertiary)" }}
          onClick={(event) => {
            event.stopPropagation();
            props.onMove(-1);
          }}
        >
          <ChevronUpIcon class="size-3" />
        </button>
        <button
          type="button"
          aria-label="Move task down"
          disabled={!props.canMoveDown}
          class="rounded p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          style={{ color: "var(--color-text-tertiary)" }}
          onClick={(event) => {
            event.stopPropagation();
            props.onMove(1);
          }}
        >
          <ChevronDownIcon class="size-3" />
        </button>
      </div>
    </div>
  );
};
