import { createSortable, transformStyle } from "@thisbeyond/solid-dnd";
import { type Component, createMemo } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { getTaskUrgency } from "../lib/view-model";
import { useAppStore } from "../state/app-store";
import type { Task } from "../types";
import { ChevronDownIcon, ChevronUpIcon, DragHandleIcon, StarIcon } from "./icons";

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
  const style = createMemo(() => ({
    ...transformStyle(sortable.transform),
    transition: "transform 200ms ease, opacity 200ms ease, background-color 200ms ease",
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
        "border-emerald-400/60 bg-emerald-500/10": isSelected(),
      }}
      class="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left shadow-sm outline-none ring-0 transition hover:border-white/20 hover:bg-white/8 focus:border-sky-400/60 focus:bg-sky-500/10 dark:border-white/10 dark:bg-white/5"
      onClick={() => app.openTask(props.task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          app.openTask(props.task.id);
        }
      }}
      onFocus={() => app.setFocusedTaskId(props.task.id)}
    >
      <button
        type="button"
        aria-label="Drag task"
        class="cursor-grab rounded-lg p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200 active:cursor-grabbing"
      >
        <DragHandleIcon class="size-4" />
      </button>

      <input
        type="checkbox"
        aria-label={`Complete ${props.task.title}`}
        class="size-4 rounded border-white/20 bg-transparent text-emerald-400 focus:ring-emerald-400"
        checked={false}
        onClick={(event) => event.stopPropagation()}
        onChange={() => void app.completeTask(props.task.id)}
      />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span
            classList={{
              "line-through text-zinc-400": isCompleting(),
            }}
            class="truncate font-medium text-zinc-100"
          >
            {props.task.title}
          </span>
          {props.task.starred ? <span class="sr-only">Starred</span> : null}
        </div>
        {props.task.notes ? (
          <p class="mt-1 line-clamp-1 text-sm text-zinc-400">{props.task.notes}</p>
        ) : null}
      </div>

      <div class="hidden items-center gap-2 md:flex">
        {props.task.whenDate ? (
          <span class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300">
            When {formatDateLabel(props.task.whenDate)}
          </span>
        ) : null}
        {props.task.dueDate ? (
          <span
            classList={{
              "border-red-400/40 bg-red-500/10 text-red-200": urgency() === "overdue",
              "border-amber-400/40 bg-amber-500/10 text-amber-100": urgency() === "due-today",
            }}
            class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300"
          >
            Due {formatDateLabel(props.task.dueDate)}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        aria-label={props.task.starred ? "Unstar task" : "Star task"}
        classList={{
          "text-amber-300": props.task.starred,
        }}
        class="rounded-lg p-1 text-zinc-400 transition hover:bg-white/10 hover:text-amber-200"
        onClick={(event) => {
          event.stopPropagation();
          void app.toggleTaskStar(props.task.id);
        }}
      >
        <StarIcon class="size-4" />
      </button>

      <div class="hidden flex-col gap-1 opacity-0 transition group-hover:opacity-100 md:flex">
        <button
          type="button"
          aria-label="Move task up"
          disabled={!props.canMoveUp}
          class="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={(event) => {
            event.stopPropagation();
            props.onMove(-1);
          }}
        >
          <ChevronUpIcon class="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Move task down"
          disabled={!props.canMoveDown}
          class="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={(event) => {
            event.stopPropagation();
            props.onMove(1);
          }}
        >
          <ChevronDownIcon class="size-3.5" />
        </button>
      </div>
    </div>
  );
};
