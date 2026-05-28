import {
  closestCenter,
  DragDropProvider,
  DragDropSensors,
  type DragEvent,
  DragOverlay,
  SortableProvider,
} from "@thisbeyond/solid-dnd";
import { type Component, createMemo, For, Show } from "solid-js";

import { moveArrayItem } from "@/lib/view-model";
import type { Task } from "@/types";

import { TaskRow } from "./TaskRow";

interface SortableTaskListProps {
  tasks: Task[];
  sectionTitle?: string;
  /** When true the section title is rendered in tertiary (muted) color */
  mutedTitle?: boolean;
  /** "overdue" renders the section title in urgency-red */
  sectionUrgency?: "overdue";
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export const SortableTaskList: Component<SortableTaskListProps> = (props) => {
  const ids = createMemo(() => props.tasks.map((task) => task.id));

  const handleDragEnd = async (event: DragEvent): Promise<void> => {
    if (!event.draggable || !event.droppable) return;

    const orderedIds = ids();
    const fromIndex = orderedIds.indexOf(String(event.draggable.id));
    const toIndex = orderedIds.indexOf(String(event.droppable.id));

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    await props.onReorder(moveArrayItem(orderedIds, fromIndex, toIndex));
  };

  const titleColor = () => {
    if (props.sectionUrgency === "overdue") return "var(--color-urgency-red)";
    return "var(--color-text-tertiary)";
  };

  return (
    <section>
      {props.sectionTitle ? (
        <h2 class="mb-1.5 px-1 text-xs font-medium" style={{ color: titleColor() }}>
          {props.sectionTitle}
        </h2>
      ) : null}

      <DragDropProvider collisionDetector={closestCenter} onDragEnd={handleDragEnd}>
        <DragDropSensors />
        <SortableProvider ids={ids()}>
          <div>
            <For each={props.tasks}>{(task) => <TaskRow task={task} />}</For>
          </div>
        </SortableProvider>

        {/* Floating drag overlay — renders a shadow card following the cursor */}
        <DragOverlay class="pointer-events-none" style={{ "z-index": "9999" }}>
          {(draggable) => {
            const task = props.tasks.find((t) => t.id === String(draggable?.id));
            return (
              <Show when={task}>
                {(t) => (
                  <div
                    class="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                    style={{
                      "background-color": "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-subtle)",
                      "box-shadow": "0 12px 40px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.07)",
                      transform: "scale(1.02)",
                      cursor: "grabbing",
                      "min-width": "200px",
                    }}
                  >
                    {/* hollow checkbox circle */}
                    <span
                      class="shrink-0 rounded-full border-[1.5px] flex-none"
                      style={{
                        width: "17px",
                        height: "17px",
                        "border-color": "var(--color-border-default)",
                        display: "block",
                      }}
                    />
                    <span
                      class="min-w-0 flex-1 truncate text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {t().title}
                    </span>
                  </div>
                )}
              </Show>
            );
          }}
        </DragOverlay>
      </DragDropProvider>
    </section>
  );
};
